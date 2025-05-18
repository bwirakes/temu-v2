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
    const jobId = params.id;
    
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
      cvFileUrl: application.cvFileUrl
    }));

    // Calculate the actual application count
    const applicationCount = applicants.length;

    // Create a job object with all fields, including new ones
    const jobWithApplicationCount = {
      ...job,
      applicationCount,
      // Always include applicationDeadline property, set to null
      applicationDeadline: null,
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