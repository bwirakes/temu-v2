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
import { eq, and } from 'drizzle-orm';
import { Suspense } from "react";

// Import type definitions only
import type { Job } from "./job-details";
import type { Applicant } from "./applicants";

// Configure ISR - revalidate job pages every 1 hour (3600 seconds)
export const revalidate = 3600;

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

  // Get job applications with user profiles (server-side data fetching for SSG/ISR)
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
    .where(eq(jobApplications.jobId, jobId));

  // Format applicant data for the client component
  const applicants: Applicant[] = applicationsData.map(application => ({
    id: application.id,
    name: application.name || 'Unknown',
    email: application.email || 'No email',
    applicationDate: new Date().toISOString(), // Use current date as fallback
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
    applicationCount: applicants.length, // Set the accurate count from our server-side fetch
    lastEducation: job.lastEducation || undefined,
    requiredCompetencies: job.requiredCompetencies || '',
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
        <span className="text-foreground font-medium truncate max-w-[200px]">{job.jobTitle}</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{job.jobTitle}</h1>
            {getStatusBadge(job.isConfirmed)}
          </div>
          <p className="text-muted-foreground mt-1">
            {getContractTypeLabel(undefined)} • {job?.numberOfPositions || 1} posisi • 
            Diposting pada {formatDate(job.postedDate)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/careers/${employer.id}/${job.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Posting
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
          >
            <Link href={`/employer/job-posting/edit/${jobId}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Lowongan
            </Link>
          </Button>
          <ApplicantsClientWrapper />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="applicants" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="applicants">
            <Users className="h-4 w-4 mr-2" />
            Pelamar
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Detail Lowongan
          </TabsTrigger>
        </TabsList>

        {/* Applicants Tab Content - Pass the server-fetched data */}
        <TabsContent value="applicants" className="mt-6">
          <ApplicantsTabContent 
            jobId={jobId} 
            initialApplicants={applicants} 
            jobTitle={job.jobTitle} 
          />
        </TabsContent>

        {/* Job Details Tab Content - Static content */}
        <TabsContent value="details" className="mt-6">
          <JobDetailsCardComponent job={jobData} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 

// Import components dynamically to avoid naming conflicts
import { JobDetailsCard as JobDetailsCardComponent } from "./job-details";
import { ApplicantsTab as ApplicantsTabContent } from "./applicants"; 