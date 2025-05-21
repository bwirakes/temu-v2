// Server component for job listings with ISR
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Plus, 
  Search,
  Users,
  Clock,
  Briefcase,
  Globe,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  getEmployerByUserId, 
  getJobsByEmployerId,
  db,
  jobs,
  jobApplications
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { JobsClientWrapper } from "./jobs-client";
import { MinWorkExperienceEnum } from "@/lib/constants";

// Enable Incremental Static Regeneration
export const revalidate = 3600; // Revalidate every hour

// Mark this page as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

// Job interface matching our updated database schema
interface Job {
  id: string;
  employerId: string;
  jobId?: string; // Make jobId optional with the ? operator
  jobTitle: string;
  minWorkExperience: MinWorkExperienceEnum;
  postedDate: string;
  // Allow numberOfPositions to be null (this matches what's returned from the database)
  numberOfPositions: number | null;
  isConfirmed: boolean;
  applicationCount: number;
  // Make contractType optional since it's being removed
  contractType?: string;
  // Add lokasiKerja field, allow it to be string | undefined, but not null
  lokasiKerja?: string;
}

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

const getStatusBadge = (isConfirmed: boolean) => {
  if (isConfirmed) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktif</Badge>;
  } else {
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
  }
};

export default async function JobsPage() {
  // Get authenticated user
  const session = await auth();
  
  // Redirect if not authenticated
  if (!session?.user?.id) {
    redirect('/login');
  }
  
  // Get employer ID from the user ID
  const employer = await getEmployerByUserId(session.user.id);
  
  if (!employer) {
    redirect('/employer/onboarding');
  }
  
  // Get all jobs for this employer
  let jobsData = await getJobsByEmployerId(employer.id);
  
  // Get application counts for each job
  const jobsWithApplicationCounts = await Promise.all(
    jobsData.map(async (job) => {
      // Count applications for this job
      const applications = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.jobId, job.id));
      
      const applicationCount = applications.length;
      
      // Convert minWorkExperience from number to enum if needed
      let minWorkExperienceValue: MinWorkExperienceEnum = "LULUSAN_BARU";
      
      if (typeof job.minWorkExperience === 'string' && 
          ["LULUSAN_BARU", "SATU_DUA_TAHUN", "TIGA_EMPAT_TAHUN", "TIGA_LIMA_TAHUN", "LEBIH_LIMA_TAHUN"].includes(job.minWorkExperience)) {
        minWorkExperienceValue = job.minWorkExperience as MinWorkExperienceEnum;
      } else if (typeof job.minWorkExperience === 'number') {
        // Convert numeric experience to enum based on values
        if (job.minWorkExperience === 0) {
          minWorkExperienceValue = "LULUSAN_BARU";
        } else if (job.minWorkExperience <= 2) {
          minWorkExperienceValue = "SATU_DUA_TAHUN";
        } else if (job.minWorkExperience <= 4) {
          minWorkExperienceValue = "TIGA_LIMA_TAHUN";
        } else if (job.minWorkExperience <= 5) {
          minWorkExperienceValue = "TIGA_LIMA_TAHUN";
        } else if (job.minWorkExperience <= 10) {
          minWorkExperienceValue = "LIMA_SEPULUH_TAHUN";
        } else {
          minWorkExperienceValue = "LEBIH_SEPULUH_TAHUN";
        }
      }
      
      // Transform dates to strings and ensure all required fields are present
      return {
        id: job.id,
        employerId: job.employerId,
        jobTitle: job.jobTitle,
        minWorkExperience: minWorkExperienceValue,
        postedDate: job.postedDate.toISOString(),
        // Keep numberOfPositions as null if it's null in the database
        numberOfPositions: job.numberOfPositions,
        isConfirmed: job.isConfirmed,
        applicationCount,
        // Add default contractType since it's been removed from schema
        contractType: "FULL_TIME",
        // Include jobId if available
        jobId: job.jobId,
        // Include lokasiKerja, convert null to undefined
        lokasiKerja: job.lokasiKerja || undefined
      };
    })
  );
  
  // Sort jobs by posted date (newest first)
  const sortedJobs = jobsWithApplicationCounts.sort((a, b) => {
    return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lowongan Pekerjaan</h1>
            <p className="text-muted-foreground">
              Kelola semua lowongan pekerjaan yang telah Anda posting
            </p>
          </div>
          
          <Link 
            href={`/careers/${employer.id}`}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Globe className="mr-2 h-4 w-4" />
            Lihat Halaman Karir Publik
          </Link>
        </div>
      </div>

      {/* Client-side wrapper for search and filtering functionality */}
      <JobsClientWrapper jobs={sortedJobs} />
    </div>
  );
} 



