import { NextRequest, NextResponse } from "next/server";
import { getJobById, getEmployerByUserId } from "@/lib/db";
import { auth } from '@/lib/auth';
import { 
  db, 
  getJobApplicationsByJobId, 
  jobs,
  jobApplications, 
  userProfiles,
  applicationStatusEnum
} from '@/lib/db';
import { and, eq, sql } from 'drizzle-orm';

// Mark this API route as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

// Define the Applicant type inline instead of importing it
type ApplicantType = {
  id: string;
  name: string;
  email: string;
  applicationDate: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl: string | null;
  cvFileUrl: string | null;
  additionalNotes: string | null;
  statusChangeReason?: string | null;
  education?: string | null;
  profileId?: string;
  tanggalLahir?: string | null;
  umur?: number | null;
  jenisKelamin?: string | null;
  kotaDomisili?: string | null;
  pendidikanFull?: Array<{
    jenjangPendidikan?: string | null;
    namaInstitusi?: string | null;
    bidangStudi?: string | null;
    tanggalLulus?: string | null;
  }> | null;
  pengalamanKerjaFull?: Array<{
    posisi?: string | null;
    namaPerusahaan?: string | null;
    tanggalMulai?: string | null;
    tanggalSelesai?: string | null;
    deskripsiPekerjaan?: string | null;
  }> | null;
  pengalamanKerjaTerakhir?: {
    posisi?: string | null;
    namaPerusahaan?: string | null;
  } | null;
  gajiTerakhir?: number | null;
  levelPengalaman?: string | null;
  ekspektasiGaji?: {
    min?: number;
    max?: number;
    negotiable?: boolean;
  } | null;
  preferensiLokasiKerja?: string[] | null;
  preferensiJenisPekerjaan?: string[] | null;
}

// Define the custom session type to match what's in lib/auth.ts
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the job ID from URL parameters
    const jobId = await params.id;
    
    if (!jobId) {
      console.error('Missing job ID in params');
      return NextResponse.json(
        { error: 'ID lowongan tidak diberikan' },
        { status: 400 }
      );
    }
    
    console.log(`API: Fetching job details for ID: ${jobId}`);
    
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      console.error('Unauthorized: No user session');
      return NextResponse.json(
        { error: 'Unauthorized: Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    console.log(`API: User authenticated with ID: ${session.user.id}`);

    // Get employer ID from the user ID
    const employer = await getEmployerByUserId(session.user.id);
    
    if (!employer) {
      console.error(`Employer not found for user ID: ${session.user.id}`);
      return NextResponse.json(
        { error: 'Tidak ditemukan: Akun employer tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log(`API: Found employer with ID: ${employer.id}`);

    // Get job details
    console.log(`API: Fetching job with ID: ${jobId}`);
    const job = await getJobById(jobId);
    
    if (!job) {
      console.log(`API: Job with ID ${jobId} not found`);
      return NextResponse.json(
        { error: 'Lowongan tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log(`API: Job found: ${job.jobTitle}`);
    console.log(`API: Job employerId: ${job.employerId}, Current employer ID: ${employer.id}`);

    // Ensure the job belongs to the authenticated employer
    if (job.employerId !== employer.id) {
      console.error(`Access denied: Job ${jobId} belongs to employer ${job.employerId}, not ${employer.id}`);
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses ke lowongan ini' },
        { status: 403 }
      );
    }

    // Get job applications with a current timestamp as applicationDate
    const jobApplicationsData = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        additionalNotes: jobApplications.additionalNotes,
        education: jobApplications.education,
        resumeUrl: jobApplications.resumeUrl,
        statusChangeReason: jobApplications.statusChangeReason,
        // New fields from jobApplications table
        tanggalLahir: jobApplications.tanggalLahir,
        jenisKelamin: jobApplications.jenisKelamin,
        kotaDomisili: jobApplications.kotaDomisili,
        pendidikanFull: jobApplications.pendidikanFull,
        pengalamanKerjaFull: jobApplications.pengalamanKerjaFull,
        pengalamanKerjaTerakhir: jobApplications.pengalamanKerjaTerakhir,
        gajiTerakhir: jobApplications.gajiTerakhir,
        levelPengalaman: jobApplications.levelPengalaman,
        ekspektasiGaji: jobApplications.ekspektasiGaji,
        preferensiLokasiKerja: jobApplications.preferensiLokasiKerja,
        preferensiJenisPekerjaan: jobApplications.preferensiJenisPekerjaan,
        // Use current_timestamp as a placeholder
        applicationDate: sql<string>`CURRENT_TIMESTAMP`,
        // Join with user profile to get applicant information
        name: userProfiles.namaLengkap,
        email: userProfiles.email,
        profileId: userProfiles.id,
        cvFileUrl: userProfiles.cvFileUrl
      })
      .from(jobApplications)
      .innerJoin(
        userProfiles,
        eq(jobApplications.applicantProfileId, userProfiles.id)
      )
      .where(eq(jobApplications.jobId, jobId));

    // Transform data to match the expected format in the frontend
    const applicants = jobApplicationsData.map(application => ({
      id: application.id,
      name: application.name,
      email: application.email,
      // Format the date as ISO string
      applicationDate: new Date(application.applicationDate).toISOString(),
      status: application.status,
      resumeUrl: application.resumeUrl,
      additionalNotes: application.additionalNotes,
      education: application.education,
      profileId: application.profileId,
      cvFileUrl: application.cvFileUrl,
      statusChangeReason: application.statusChangeReason,
      // Include the new fields in the response
      tanggalLahir: application.tanggalLahir ? new Date(application.tanggalLahir).toISOString() : null,
      jenisKelamin: application.jenisKelamin,
      kotaDomisili: application.kotaDomisili,
      pendidikanFull: application.pendidikanFull as ApplicantType['pendidikanFull'],
      pengalamanKerjaFull: application.pengalamanKerjaFull as ApplicantType['pengalamanKerjaFull'],
      pengalamanKerjaTerakhir: application.pengalamanKerjaTerakhir as ApplicantType['pengalamanKerjaTerakhir'],
      gajiTerakhir: application.gajiTerakhir,
      levelPengalaman: application.levelPengalaman,
      ekspektasiGaji: application.ekspektasiGaji as ApplicantType['ekspektasiGaji'],
      preferensiLokasiKerja: application.preferensiLokasiKerja as ApplicantType['preferensiLokasiKerja'],
      preferensiJenisPekerjaan: application.preferensiJenisPekerjaan as ApplicantType['preferensiJenisPekerjaan'],
      // Calculate age if tanggalLahir is available
      umur: application.tanggalLahir 
        ? Math.floor((new Date().getTime() - new Date(application.tanggalLahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null
    }));

    // Calculate the actual application count
    const applicationCount = applicants.length;

    // Create a job object with all fields, including new ones
    const jobWithApplicationCount = {
      ...job,
      applicationCount,
      // Format dates as ISO strings
      postedDate: job.postedDate.toISOString(),
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    };

    console.log('API: Returning job data with all fields (including new fields)');
    return NextResponse.json({
      job: jobWithApplicationCount,
      applicants
    });
  } catch (error) {
    console.error('Error fetching job details and applicants:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil detail lowongan' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the job ID from params
    const jobId = await params.id;
    
    // ... existing code ...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus lowongan' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the job ID from params
    const jobId = await params.id;
    
    // ... existing code ...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui lowongan' },
      { status: 500 }
    );
  }
} 