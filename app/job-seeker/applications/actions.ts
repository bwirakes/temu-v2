'use server';

import { db, jobApplications, jobs, employers, userProfiles } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getJobSeekerSession } from "@/lib/auth-utils";

// Application type that will be passed to the client
export interface Application {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  companyName: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  updatedAt: string;
  referenceCode?: string;
  education?: string | null;
  additionalNotes?: string | null;
  cvFileUrl?: string | null;
}

/**
 * Server action to fetch job applications for the authenticated job seeker
 * This function handles auth checks and data fetching in a server context
 */
export async function getJobApplications(): Promise<Application[]> {
  try {
    // Get typed session for job seeker (throws error if not authenticated or wrong user type)
    const session = await getJobSeekerSession();
    
    // Ensure user is available (should always be true after getJobSeekerSession)
    if (!session.user || !session.user.id) {
      redirect("/auth/signin");
    }
    
    // Get user profile
    const userProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    
    if (!userProfile || userProfile.length === 0) {
      // Redirect to profile creation if profile doesn't exist
      redirect("/job-seeker/onboarding/informasi-dasar");
    }
    
    // Fetch job applications for the authenticated user with joins
    const applicationsData = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        additionalNotes: jobApplications.additionalNotes,
        education: jobApplications.education,
        resumeUrl: jobApplications.resumeUrl,
        cvFileUrl: jobApplications.cvFileUrl,
        jobId: jobs.id,
        jobTitle: jobs.jobTitle,
        companyName: employers.namaPerusahaan,
        // Using ID as a proxy for creation timestamp since we don't have actual timestamps
        createdAt: jobApplications.id, 
        updatedAt: jobApplications.id, 
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .where(eq(jobApplications.applicantProfileId, userProfile[0].id))
      .orderBy(desc(jobApplications.id));
    
    // Format the applications data to match the expected interface
    const formattedApplications: Application[] = applicationsData.map((application) => {
      // Generate a reference code for each application
      const referenceCode = `JA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${application.id.substring(0, 6).toUpperCase()}`;
      
      return {
        id: application.id,
        jobPostingId: application.jobId,
        jobTitle: application.jobTitle,
        companyName: application.companyName,
        status: application.status,
        createdAt: new Date().toISOString(), // Fallback creation date
        updatedAt: new Date().toISOString(), // Fallback update date
        education: application.education,
        additionalNotes: application.additionalNotes,
        cvFileUrl: application.cvFileUrl,
        referenceCode: referenceCode
      };
    });
    
    return formattedApplications;
  } catch (error) {
    console.error("Error fetching job applications:", error);
    throw error;
  }
}