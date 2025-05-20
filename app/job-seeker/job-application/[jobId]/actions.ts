'use server';

import { getJobSeekerSession } from "@/lib/auth-utils";
import { 
  getUserProfileByUserId, 
  getJobById, 
  getJobByHumanId, 
  getUserPendidikanByProfileId, 
  getJobWorkLocationsByJobId, 
  getEmployerById,
  jobApplications
} from "@/lib/db";
import { redirect, notFound } from 'next/navigation';
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";

// Define types for the job application page data
export interface JobApplicationPageData {
  jobDetails: JobDetails;
  profileData: JobSeekerProfileData | null;
  hasApplied: boolean;
  referenceCode: string | null;
}

export interface JobDetails {
  id: string;
  jobId: string;
  jobTitle: string;
  contractType: string;
  minWorkExperience: number;
  salaryRange: {
    min?: number;
    max?: number;
    isNegotiable?: boolean;
  };
  lastEducation?: string;
  requiredCompetencies?: string;
  numberOfPositions?: number;
  applicationDeadline?: Date;
  workLocations: WorkLocation[];
  companyInfo: CompanyInfo;
}

interface WorkLocation {
  city: string;
  province: string;
  isRemote: boolean;
}

interface CompanyInfo {
  name: string;
  industry: string;
  address: string;
  website?: string;
  logoUrl?: string;
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  description?: string;
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

/**
 * Maps a raw education level string to a standardized education enum value
 */
export async function mapEducationLevelToEnum(educationLevel: string): Promise<string | undefined> {
  const educationMapping: Record<string, string> = {
    'SD': 'SD',
    'SMP': 'SMP',
    'SMA': 'SMA/SMK',
    'SMK': 'SMA/SMK',
    'SMA/SMK': 'SMA/SMK',
    'D1': 'D1',
    'D2': 'D2',
    'D3': 'D3',
    'D4': 'D4',
    'S1': 'S1',
    'S2': 'S2',
    'S3': 'S3',
  };
  
  // Try to find a direct match first
  if (educationLevel in educationMapping) {
    return educationMapping[educationLevel];
  }
  
  // If no direct match, try a case-insensitive match
  const normalizedLevel = educationLevel.toUpperCase();
  for (const [key, value] of Object.entries(educationMapping)) {
    if (normalizedLevel.includes(key)) {
      return value;
    }
  }
  
  // If we couldn't map the education level, return undefined
  console.warn(`Could not map education level: ${educationLevel}`);
  return undefined;
}

/**
 * Generate a consistent reference code for job applications
 */
function generateReferenceCode(applicationId: string): string {
  // Format: JA-{YEAR}{MONTH}{DAY}-{FIRST 6 CHARS OF UUID}
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const shortId = applicationId.substring(0, 6).toUpperCase();
  
  return `JA-${year}${month}${day}-${shortId}`;
}

/**
 * Fetches all data needed for the job application page
 * - Verifies user authentication and authorization
 * - Fetches job details
 * - Fetches user profile data
 * - Checks if user has already applied
 * - Redirects if user has already applied
 */
export async function getJobApplicationPageData(jobId: string): Promise<JobApplicationPageData> {
  try {
    // 1. Verify user authentication & authorization
    const session = await getJobSeekerSession();
    
    if (!session.user || !session.user.id) {
      // Redirect to login if not authenticated
      redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/job-seeker/job-application/${jobId}`)}`);
    }
    
    // 2. Check if the user has already applied for this job
    let hasApplied = false;
    let referenceCode: string | null = null;
    
    // Get user profile
    const profileData = await getUserProfileByUserId(session.user.id);
    
    if (!profileData) {
      redirect('/job-seeker/profile'); // Redirect to profile if user doesn't have a profile
    }
    
    // Check if the user has already applied
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
    let jobUuid = jobId;
    
    if (!isUuid) {
      // If it's a human-readable ID, get the UUID
      const job = await getJobByHumanId(jobId);
      if (job) {
        jobUuid = job.id;
      }
    }
    
    // Query for existing application
    const existingApplications = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.applicantProfileId, profileData.id),
          eq(jobApplications.jobId, jobUuid)
        )
      );
    
    hasApplied = existingApplications.length > 0;
    
    // If the user has already applied, prepare to redirect
    if (hasApplied && existingApplications[0]) {
      referenceCode = generateReferenceCode(existingApplications[0].id);
      
      // Redirect to success page
      redirect(`/job-seeker/job-application/success?reference=${referenceCode}`);
    }
    
    // 3. Fetch job details
    // Determine if jobId is a UUID or human-readable ID and use the appropriate function
    const job = isUuid 
      ? await getJobById(jobUuid)
      : await getJobByHumanId(jobId);
    
    if (!job) {
      // Use notFound() instead of throwing an error for job not found
      notFound();
    }
    
    // 4. Fetch related job details
    // Get work locations
    const workLocations = await getJobWorkLocationsByJobId(job.id);
    
    // Get employer details
    const employer = await getEmployerById(job.employerId);
    
    if (!employer) {
      // Use notFound() for missing employer details as well
      notFound();
    }
    
    // 5. Get education data
    // Find the highest education level
    let highestEducation = undefined;
    
    if (profileData) {
      const pendidikanData = await getUserPendidikanByProfileId(profileData.id);
      
      if (pendidikanData && pendidikanData.length > 0) {
        // Sort education by date if available, assuming newer is higher level
        const sortedEducation = [...pendidikanData].sort((a, b) => {
          // Try to parse dates if available
          const dateA = a.tanggalLulus ? new Date(a.tanggalLulus) : new Date(0);
          const dateB = b.tanggalLulus ? new Date(b.tanggalLulus) : new Date(0);
          // Sort most recent first
          return dateB.getTime() - dateA.getTime();
        });
        
        // Get the most recent education
        const latestEducation = sortedEducation[0];
        
        // Map to our expected format
        highestEducation = await mapEducationLevelToEnum(latestEducation.jenjangPendidikan);
      }
    }
    
    // 6. Compose final job details object
    const jobDetails: JobDetails = {
      id: job.id,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      contractType: 'FULL_TIME', // Default contract type since it's not in the job object
      minWorkExperience: job.minWorkExperience,
      salaryRange: {
        // Create salary range from any available fields or defaults
        min: undefined,
        max: undefined,
        isNegotiable: false
      },
      lastEducation: job.lastEducation || undefined,
      requiredCompetencies: job.requiredCompetencies || undefined,
      numberOfPositions: job.numberOfPositions || undefined,
      applicationDeadline: job.postedDate, // Use posted date as fallback
      workLocations: workLocations.map(location => ({
        city: location.city,
        province: location.province,
        isRemote: location.isRemote,
      })),
      companyInfo: {
        name: employer.namaPerusahaan,
        industry: employer.industri,
        address: employer.alamatKantor,
        website: employer.website || undefined,
        logoUrl: employer.logoUrl || undefined,
        socialMedia: employer.socialMedia || undefined, // Handle null case
        description: '',  // Default empty description
      }
    };
    
    // 7. Compose final profile data object with education
    const profileWithEducation: JobSeekerProfileData = {
      ...profileData,
      pendidikanTerakhir: highestEducation
    };
    
    // 8. Return complete data
    return {
      jobDetails,
      profileData: profileWithEducation,
      hasApplied,
      referenceCode
    };
    
  } catch (error) {
    // Check if this is a Next.js notFound() error (these should be propagated, not logged)
    if (error instanceof Error && error.message.includes('NEXT_HTTP_ERROR_FALLBACK;404')) {
      throw error; // Re-throw notFound errors directly to be handled by Next.js
    }
    
    console.error("Error getting job application page data:", error);
    
    // For authentication errors, redirect to login
    if (error instanceof Error && error.message.includes('Authentication required')) {
      redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/job-seeker/job-application/${jobId}`)}`);
    }
    
    // For user type errors, redirect to home
    if (error instanceof Error && error.message.includes('Only job seekers')) {
      redirect("/");
    }
    
    // For job not found errors, use notFound()
    if (error instanceof Error && error.message.includes('not found')) {
      notFound();
    }
    
    // Rethrow the error for other unexpected errors
    // Next.js will handle NEXT_REDIRECT internally
    throw error;
  }
} 
