'use server';

import { getJobSeekerSession } from "@/lib/auth-utils";
import { 
  getUserProfileByUserId, 
  getJobById, 
  getJobByHumanId, 
  getUserPendidikanByProfileId, 
  getJobWorkLocationsByJobId, 
  getEmployerById
} from "@/lib/db";

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
    }
  };
} 
