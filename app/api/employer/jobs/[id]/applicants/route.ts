import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { 
  db, 
  getEmployerByUserId,
  getJobById,
  jobApplications, 
  userProfiles,
} from '@/lib/db';
import { and, eq, like, inArray, gte, lte, sql, desc, asc, SQL } from 'drizzle-orm';
import { EXPERIENCE_LEVEL_CATEGORIES } from '@/lib/constants';

// Mark this API route as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

// Define the Applicant type inline
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
      return NextResponse.json(
        { error: 'ID lowongan tidak diberikan' },
        { status: 400 }
      );
    }
    
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    // Get employer ID from the user ID
    const employer = await getEmployerByUserId(session.user.id);
    
    if (!employer) {
      return NextResponse.json(
        { error: 'Tidak ditemukan: Akun employer tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get job details
    const job = await getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Lowongan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ensure the job belongs to the authenticated employer
    if (job.employerId !== employer.id) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses ke lowongan ini' },
        { status: 403 }
      );
    }

    // Extract query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const searchQuery = url.searchParams.get('searchQuery') || '';
    const status = url.searchParams.get('status') || null;
    const education = url.searchParams.get('education') || null;
    const gender = url.searchParams.get('gender') || null;
    const ageMin = url.searchParams.get('ageMin') ? parseInt(url.searchParams.get('ageMin')!) : null;
    const ageMax = url.searchParams.get('ageMax') ? parseInt(url.searchParams.get('ageMax')!) : null;
    const city = url.searchParams.get('city') || null;
    const levelPengalaman = url.searchParams.get('levelPengalaman') || null;
    const sortBy = url.searchParams.get('sortBy') || 'applicationDate';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const whereConditions: SQL[] = [eq(jobApplications.jobId, jobId)];

    // Add filter conditions
    if (searchQuery) {
      whereConditions.push(
        sql`(${like(userProfiles.namaLengkap, `%${searchQuery}%`)} OR ${like(userProfiles.email, `%${searchQuery}%`)})`
      );
    }

    if (status) {
      whereConditions.push(eq(jobApplications.status, status as any));
    }

    if (education) {
      whereConditions.push(eq(jobApplications.education, education as any));
    }

    if (gender) {
      whereConditions.push(eq(jobApplications.jenisKelamin, gender));
    }

    // For age filters, we need to calculate the birthdate range
    if (ageMin !== null) {
      const maxBirthdate = new Date();
      maxBirthdate.setFullYear(maxBirthdate.getFullYear() - ageMin);
      whereConditions.push(lte(jobApplications.tanggalLahir, maxBirthdate.toISOString()));
    }

    if (ageMax !== null) {
      const minBirthdate = new Date();
      minBirthdate.setFullYear(minBirthdate.getFullYear() - ageMax - 1);
      whereConditions.push(gte(jobApplications.tanggalLahir, minBirthdate.toISOString()));
    }

    if (city) {
      whereConditions.push(eq(jobApplications.kotaDomisili, city));
    }

    if (levelPengalaman) {
      whereConditions.push(eq(jobApplications.levelPengalaman, levelPengalaman));
    }

    // Calculate the total count of applicants matching the filters (for pagination)
    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(jobApplications)
      .innerJoin(
        userProfiles,
        eq(jobApplications.applicantProfileId, userProfiles.id)
      )
      .where(and(...whereConditions));

    const totalApplicants = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalApplicants / limit);

    // Prepare the ORDER BY clause based on sortBy and sortOrder
    let orderByClause;
    const sortDirection = sortOrder === 'asc' ? asc : desc;

    switch (sortBy) {
      case 'name':
        orderByClause = sortDirection(userProfiles.namaLengkap);
        break;
      case 'email':
        orderByClause = sortDirection(userProfiles.email);
        break;
      case 'status':
        orderByClause = sortDirection(jobApplications.status);
        break;
      case 'education':
        orderByClause = sortDirection(jobApplications.education);
        break;
      case 'jenisKelamin':
        orderByClause = sortDirection(jobApplications.jenisKelamin);
        break;
      case 'kotaDomisili':
        orderByClause = sortDirection(jobApplications.kotaDomisili);
        break;
      case 'umur':
        // For umur, we need to sort by tanggalLahir (older date = older person)
        orderByClause = sortOrder === 'asc' 
          ? desc(jobApplications.tanggalLahir) // Ascending age = descending birth date
          : asc(jobApplications.tanggalLahir);  // Descending age = ascending birth date
        break;
      case 'applicationDate':
      default:
        // Use SQL's CURRENT_TIMESTAMP since we don't have actual application dates
        orderByClause = sortDirection(sql`CURRENT_TIMESTAMP`);
        break;
    }

    // Get the paginated applicants with sorting
    const applicationsData = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        additionalNotes: jobApplications.additionalNotes,
        education: jobApplications.education,
        resumeUrl: jobApplications.resumeUrl,
        statusChangeReason: jobApplications.statusChangeReason,
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
        // Use current_timestamp as a placeholder for applicationDate
        applicationDate: sql<string>`CURRENT_TIMESTAMP`,
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
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Transform data to match the expected format in the frontend
    const applicants = applicationsData.map(application => ({
      id: application.id,
      name: application.name || 'Unknown',
      email: application.email || 'No email',
      applicationDate: new Date(application.applicationDate).toISOString(),
      status: application.status,
      resumeUrl: application.resumeUrl,
      additionalNotes: application.additionalNotes,
      education: application.education,
      profileId: application.profileId,
      cvFileUrl: application.cvFileUrl,
      statusChangeReason: application.statusChangeReason,
      tanggalLahir: application.tanggalLahir 
        ? new Date(application.tanggalLahir).toISOString() 
        : null,
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

    // Fetch distinct values for filter dropdowns
    const distinctEducations = await db
      .selectDistinct({ education: jobApplications.education })
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(jobApplications.education);

    const distinctCities = await db
      .selectDistinct({ city: jobApplications.kotaDomisili })
      .from(jobApplications)
      .where(and(
        eq(jobApplications.jobId, jobId),
        sql`${jobApplications.kotaDomisili} IS NOT NULL`
      ))
      .orderBy(jobApplications.kotaDomisili);

    const distinctLevelPengalaman = await db
      .selectDistinct({ level: jobApplications.levelPengalaman })
      .from(jobApplications)
      .where(and(
        eq(jobApplications.jobId, jobId),
        sql`${jobApplications.levelPengalaman} IS NOT NULL`
      ))
      .orderBy(jobApplications.levelPengalaman);

    // We'll use standardized categories for level pengalaman if available
    // but also include any custom levels from the database that don't match the standards
    const standardizedLevelPengalaman = [
      ...EXPERIENCE_LEVEL_CATEGORIES,
      ...distinctLevelPengalaman
        .map(level => level.level)
        .filter(level => 
          level !== null && 
          !EXPERIENCE_LEVEL_CATEGORIES.includes(level)
        )
    ].filter((value, index, self) => self.indexOf(value) === index);

    return NextResponse.json({
      applicants,
      totalApplicants,
      currentPage: page,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filterOptions: {
        educations: distinctEducations.map(e => e.education).filter(Boolean),
        cities: distinctCities.map(c => c.city).filter(Boolean),
        levelPengalaman: standardizedLevelPengalaman.filter(Boolean),
        gender: ["MALE", "FEMALE"]
      }
    });
  } catch (error) {
    console.error('Error fetching applicants with pagination:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pelamar' },
      { status: 500 }
    );
  }
} 
