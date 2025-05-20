'use server';

import { getJobSeekerSession } from "@/lib/auth-utils";
import { 
  getUserProfileByUserId, 
  getJobById, 
  getJobByHumanId, 
  getUserPendidikanByProfileId, 
  getJobWorkLocationsByJobId, 
  getEmployerById,
  db,
  jobApplications
} from "@/lib/db";
import { eq, and } from "drizzle-orm";

// Add back the required types
export interface JobDetails {
  id: string;
  jobId: string;
  jobTitle: string;
  contractType: string;
  minWorkExperience: number;
  salaryRange: { min?: number; max?: number; isNegotiable?: boolean; };
  lastEducation?: string;
  requiredCompetencies?: string;
  numberOfPositions?: number;
  applicationDeadline?: Date;
  workLocations: { city: string; province: string; isRemote: boolean; }[];
  companyInfo: {
    name: string;
    industry: string;
    address: string;
    website?: string;
    logoUrl?: string;
    socialMedia?: any;
    description?: string;
  };
}

export interface JobSeekerProfileData {
  id: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  cvFileUrl?: string | null;
  cvUploadDate?: string | Date | null;
  pendidikanTerakhir?: string;
}

// Application status interface
export interface ApplicationStatus {
  hasApplied: boolean;
  referenceCode?: string;
  applicationDate?: Date;
  status?: string;
}

// Minimal data fetcher for job application
export async function getJobApplicationPageData(jobId: string) {
  // Get session and verify it has a user
  const session = await getJobSeekerSession();
  if (!session.user?.id) throw new Error("Authentication required");
  
  // Get user profile
  const profileData = await getUserProfileByUserId(session.user.id);
  if (!profileData) throw new Error("Profile not found");
  
  // Get job data
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
  const job = isUuid ? await getJobById(jobId) : await getJobByHumanId(jobId);
  if (!job) throw new Error("Job not found");
  
  // Get related data
  const [workLocations, employer, pendidikan] = await Promise.all([
    getJobWorkLocationsByJobId(job.id),
    getEmployerById(job.employerId),
    getUserPendidikanByProfileId(profileData.id)
  ]);
  
  if (!employer) throw new Error("Employer not found");
  
  // Get highest education if available
  let highestEducation;
  if (pendidikan?.length) {
    const sorted = [...pendidikan].sort((a, b) => 
      new Date(b.tanggalLulus || 0).getTime() - new Date(a.tanggalLulus || 0).getTime()
    );
    highestEducation = sorted[0]?.jenjangPendidikan;
  }
  
  // Check if the user has already applied for this job
  const existingApplications = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.applicantProfileId, profileData.id),
        eq(jobApplications.jobId, job.id)
      )
    );
  
  const hasApplied = existingApplications.length > 0;
  
  // Generate reference code if the user has applied
  let referenceCode = '';
  if (hasApplied && existingApplications[0]) {
    const applicationId = existingApplications[0].id;
    
    // Format: APP-{FIRST 5 CHARS OF UUID}-{YYMMDD}
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const shortId = applicationId.substring(0, 5).toUpperCase();
    referenceCode = `APP-${shortId}-${year}${month}${day}`;
  }
  
  // Return formatted data
  return {
    jobDetails: {
      id: job.id,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      contractType: 'FULL_TIME',
      minWorkExperience: job.minWorkExperience,
      salaryRange: { isNegotiable: false },
      lastEducation: job.lastEducation || undefined,
      requiredCompetencies: job.requiredCompetencies || undefined,
      numberOfPositions: job.numberOfPositions || undefined,
      applicationDeadline: job.postedDate,
      workLocations: workLocations.map(l => ({
        city: l.city,
        province: l.province,
        isRemote: l.isRemote,
      })),
      companyInfo: {
        name: employer.namaPerusahaan,
        industry: employer.industri,
        address: employer.alamatKantor,
        website: employer.website || undefined,
        logoUrl: employer.logoUrl || undefined,
        socialMedia: employer.socialMedia || undefined,
        description: '',
      }
    },
    profileData: {
      ...profileData,
      pendidikanTerakhir: highestEducation
    },
    applicationStatus: {
      hasApplied,
      referenceCode: hasApplied ? referenceCode : undefined,
      applicationDate: hasApplied && 'createdAt' in existingApplications[0] ? 
        existingApplications[0].createdAt as Date : undefined, 
      status: hasApplied ? existingApplications[0].status : undefined
    }
  };
} 
