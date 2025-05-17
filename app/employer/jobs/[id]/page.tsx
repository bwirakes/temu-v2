// Job details page - Server Component with ISR
import { Suspense } from "react";
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
import { getJobById, getEmployerByUserId } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ApplicantsClientWrapper } from "./applicants-client";

// Import type definitions only
import type { Job } from "./job-details";

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

const getContractTypeLabel = (type: string): string => {
  switch (type) {
    case "FULL_TIME":
      return "Penuh Waktu";
    case "PART_TIME":
      return "Paruh Waktu";
    case "CONTRACT":
      return "Kontrak";
    case "INTERNSHIP":
      return "Magang";
    case "FREELANCE":
      return "Freelance";
    default:
      return type;
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
export async function generateMetadata({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  
  if (!job) {
    return {
      title: 'Job Not Found',
      description: 'The requested job could not be found',
    };
  }
  
  return {
    title: `${job.jobTitle} | Employer Dashboard`,
    description: job.description || `Job details for ${job.jobTitle}`,
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
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

  // Transform job data to match the expected format
  const jobData = {
    id: job.id,
    employerId: job.employerId,
    jobTitle: job.jobTitle,
    contractType: job.contractType,
    salaryRange: job.salaryRange || { isNegotiable: false },
    minWorkExperience: job.minWorkExperience,
    applicationDeadline: job.applicationDeadline ? job.applicationDeadline.toISOString() : null,
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    description: job.description,
    postedDate: job.postedDate.toISOString(),
    numberOfPositions: job.numberOfPositions,
    workingHours: job.workingHours,
    isConfirmed: job.isConfirmed,
    applicationCount: 0 // Will be updated from client component
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
            {getContractTypeLabel(job.contractType)} • {job.numberOfPositions || 1} posisi • 
            Diposting pada {formatDate(job.postedDate)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/job-detail/${job.id}`}>
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

        {/* Applicants Tab Content - This will be a Client Component */}
        <TabsContent value="applicants" className="mt-6">
          <Suspense fallback={
            <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[50vh]">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">Memuat data pelamar</h3>
              <p className="mt-1 text-sm text-gray-500">Mohon tunggu sebentar...</p>
                </div>
          }>
            <ApplicantsTabContent jobId={jobId} />
          </Suspense>
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