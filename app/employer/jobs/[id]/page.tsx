// Job details page - Server Component with ISR
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Users, 
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  getJobById, 
  getEmployerByUserId, 
  db,
  jobApplications,
  userProfiles
} from "@/lib/db";
import { auth } from "@/lib/auth";
import { ApplicantsClientWrapper } from "./applicants-client";
import { eq, and, sql } from 'drizzle-orm';
import { Suspense } from "react";
import { EXPERIENCE_LEVEL_CATEGORIES } from "@/lib/constants";

// Import type definitions only
import type { Job } from "./job-details";
import type { Applicant } from "./applicants";
import { JobDetailsCard } from "./job-details";
import { ApplicantsTab } from "./applicants";

// Configure ISR - revalidate job pages every 1 hour (3600 seconds)
export const revalidate = 3600;

// Mark this page as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

// Utility functions
const getStatusBadge = (isConfirmed: boolean) => {
  if (isConfirmed) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktif</Badge>;
  } else {
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
  }
};

const getContractTypeLabel = (type?: string): string => {
  if (!type) return "Full Time"; // Default value
  
  switch (type) {
    case "FULL_TIME":
      return "Full Time";
    case "PART_TIME":
      return "Part Time";
    case "CONTRACT":
      return "Kontrak";
    case "INTERNSHIP":
      return "Magang";
    case "FREELANCE":
      return "Freelance";
    default:
      return "Full Time";
  }
};

const formatDate = (dateString: string | Date) => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch (e) {
    return String(dateString);
  }
};

// Generate static paths for all job IDs - could be expanded in production
export async function generateStaticParams() {
  // In production, you would get all the job IDs from the database
  // For now, we'll return an empty array and rely on ISR for paths
  return [];
}

// This function gets called at build time and when revalidation occurs
export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const job = await getJobById(params.id);

  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'The requested job could not be found',
    };
  }

  return {
    title: `${job.jobTitle} | Employer Dashboard`,
    description: `Job details for ${job.jobTitle}`,
  };
}

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const jobId = params.id;
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Get employer ID from the user ID
  const employer = session.user.id ? await getEmployerByUserId(session.user.id) : null;

  if (!employer) {
    return {
      redirect: {
        destination: '/employer/onboarding',
        permanent: false,
      },
    };
  }

  // Get job details
  const job = await getJobById(jobId);

  if (!job) {
    notFound();
  }

  // Ensure the job belongs to the authenticated employer
  if (job.employerId !== employer.id) {
    return {
      redirect: {
        destination: '/employer/jobs',
        permanent: false,
      },
    };
  }

  // Get just the first page of applications (limit 20 for initial load)
  // This will be used as fallback data for SWR
  const applicationsData = await db
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
      cvFileUrl: userProfiles.cvFileUrl,
      name: userProfiles.namaLengkap,
      email: userProfiles.email,
      profileId: userProfiles.id
    })
    .from(jobApplications)
    .innerJoin(
      userProfiles,
      eq(jobApplications.applicantProfileId, userProfiles.id)
    )
    .where(eq(jobApplications.jobId, jobId))
    .limit(20);

  // Get total count of applicants for this job (for pagination metadata)
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(jobApplications)
    .where(eq(jobApplications.jobId, jobId));

  const totalApplicants = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalApplicants / 20); // Using limit of 20 per page

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

  // Combine standard categories with any custom ones from the database
  const standardizedLevelPengalaman = [
    ...EXPERIENCE_LEVEL_CATEGORIES,
    ...distinctLevelPengalaman
      .map(level => level.level)
      .filter(level => 
        level !== null && 
        !EXPERIENCE_LEVEL_CATEGORIES.includes(level)
      )
  ].filter((value, index, self) => self.indexOf(value) === index);

  // Format applicant data for the client component
  const applicants: Applicant[] = applicationsData.map(application => ({
    id: application.id,
    name: application.name || 'Unknown',
    email: application.email || 'No email',
    applicationDate: new Date().toISOString(), // Use current date as fallback since we don't store application date
    status: application.status,
    resumeUrl: application.resumeUrl,
    cvFileUrl: application.cvFileUrl,
    additionalNotes: application.additionalNotes,
    education: application.education,
    statusChangeReason: application.statusChangeReason,
    profileId: application.profileId,
    // Add the new fields
    tanggalLahir: application.tanggalLahir ? new Date(application.tanggalLahir).toISOString() : null,
    jenisKelamin: application.jenisKelamin,
    kotaDomisili: application.kotaDomisili,
    pendidikanFull: application.pendidikanFull as Applicant['pendidikanFull'],
    pengalamanKerjaFull: application.pengalamanKerjaFull as Applicant['pengalamanKerjaFull'],
    pengalamanKerjaTerakhir: application.pengalamanKerjaTerakhir as Applicant['pengalamanKerjaTerakhir'],
    gajiTerakhir: application.gajiTerakhir,
    levelPengalaman: application.levelPengalaman,
    ekspektasiGaji: application.ekspektasiGaji as Applicant['ekspektasiGaji'],
    preferensiLokasiKerja: application.preferensiLokasiKerja as Applicant['preferensiLokasiKerja'],
    preferensiJenisPekerjaan: application.preferensiJenisPekerjaan as Applicant['preferensiJenisPekerjaan'],
    // Calculate age if tanggalLahir is available
    umur: application.tanggalLahir 
      ? Math.floor((new Date().getTime() - new Date(application.tanggalLahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null
  }));

  // Prepare the initial data object for SWR fallback - ensure all values are non-null
  const initialApplicantsData = {
    applicants,
    totalApplicants,
    currentPage: 1,
    totalPages,
    limit: 20,
    hasNextPage: totalPages > 1,
    hasPrevPage: false,
    filterOptions: {
      educations: distinctEducations.map(e => e.education).filter(Boolean) as string[],
      cities: distinctCities.map(c => c.city).filter(Boolean) as string[],
      levelPengalaman: standardizedLevelPengalaman.filter(Boolean) as string[],
      gender: ["MALE", "FEMALE"]
    }
  };

  // Transform job data to match the expected format
  const jobData = {
    id: job.id,
    jobId: job.jobId,
    employerId: job.employerId,
    jobTitle: job.jobTitle,
    contractType: 'FULL_TIME', // Provide a default value since contractType was removed from the schema
    minWorkExperience: job.minWorkExperience,
    postedDate: job.postedDate.toISOString(),
    numberOfPositions: job.numberOfPositions || undefined,
    isConfirmed: job.isConfirmed,
    applicationCount: totalApplicants, // Set the accurate count from our server-side fetch
    lastEducation: job.lastEducation || undefined,
    requiredCompetencies: job.requiredCompetencies || '',
    lokasiKerja: job.lokasiKerja || undefined,
    expectations: job.expectations ? {
      ageRange: job.expectations.ageRange
    } : undefined,
    additionalRequirements: {
      gender: job.additionalRequirements?.gender,
      acceptedDisabilityTypes: job.additionalRequirements?.acceptedDisabilityTypes || [],
      numberOfDisabilityPositions: job.additionalRequirements?.numberOfDisabilityPositions || 0
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto mr-2"
          asChild
        >
          <Link href="/employer/jobs">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali</span>
          </Link>
        </Button>
        <span className="mx-2">/</span>
        <Link href="/employer/jobs" className="hover:underline">Lowongan</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{job.jobTitle}</span>
      </div>

      {/* Job header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.jobTitle}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Diposting pada {formatDate(job.postedDate)}</span>
            <span>•</span>
            <span>{getContractTypeLabel()}</span>
            <span>•</span>
            {getStatusBadge(job.isConfirmed)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/employer/jobs/${job.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Lowongan
            </Link>
          </Button>
          {job.isConfirmed && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/jobs/${job.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Lihat di Portal
              </Link>
            </Button>
          )}
          <ApplicantsClientWrapper />
        </div>
      </div>

      {/* Job tabs */}
      <Tabs defaultValue="applicants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applicants">
            <Users className="mr-2 h-4 w-4" />
            Pelamar
            <span className="ml-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
              {totalApplicants}
            </span>
          </TabsTrigger>
          <TabsTrigger value="info">
            <FileText className="mr-2 h-4 w-4" />
            Info Lowongan
          </TabsTrigger>
        </TabsList>
        <TabsContent value="applicants" className="space-y-4">
          <Suspense fallback={<div>Loading applicants...</div>}>
            <ApplicantsTab 
              jobId={jobId} 
              initialApplicants={applicants} 
              jobTitle={job.jobTitle}
              filterOptions={initialApplicantsData.filterOptions}
              totalApplicants={totalApplicants}
              totalPages={totalPages}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="info" className="space-y-4">
          <JobDetailsCard job={jobData} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 