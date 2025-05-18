'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, jobApplications, applicationStatusEnum } from '@/lib/db';
import { redirect } from 'next/navigation';
import { sql } from 'drizzle-orm';
import { getTypedSession } from '@/lib/auth-utils';

// Schema for job application validation
export const jobApplicationSchema = z.object({
  jobId: z.string().min(1, { message: "Job ID is required" }),
  coverLetter: z.string().min(50, { message: "Surat lamaran minimal 50 karakter" })
    .max(2000, { message: "Surat lamaran maksimal 2000 karakter" })
    .optional(),
  education: z.enum(["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"], {
    required_error: "Pendidikan terakhir harus dipilih",
  }).optional(),
  additionalNotes: z.string().optional(),
  resumeUrl: z.string().optional(),
});

type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

/**
 * Submit a job application
 */
export async function submitJobApplication(formData: JobApplicationFormData) {
  // Validate form data
  const validatedData = jobApplicationSchema.parse(formData);
  
  // Get the current user session
  const session = await getTypedSession();
  if (!session?.user) {
    return { error: "Unauthorized", success: false };
  }
  
  try {
    // Get the user profile ID (this would depend on your auth implementation)
    // For demonstration purposes - in a real app, you'd need to fetch the profile ID
    // using the user's email or ID
    const userId = session.user.id;
    if (!userId) {
      return { error: "User ID not found", success: false };
    }
    
    const userProfileId = (session.user as any).userProfileId || await getUserProfileId(userId);
    if (!userProfileId) {
      return { error: "User profile not found", success: false };
    }
    
    // Check if the user has already applied for this job
    const existingApplication = await db
      .select()
      .from(jobApplications)
      .where(sql`${jobApplications.applicantProfileId} = ${userProfileId} AND ${jobApplications.jobId} = ${validatedData.jobId}`);
    
    if (existingApplication.length > 0) {
      return { error: "You have already applied for this job", success: false };
    }
    
    // Create the application in the database
    const [application] = await db
      .insert(jobApplications)
      .values({
        applicantProfileId: userProfileId,
        jobId: validatedData.jobId,
        status: 'SUBMITTED', // Using applicationStatusEnum values
        additionalNotes: validatedData.coverLetter || validatedData.additionalNotes || "",
        education: validatedData.education,
        resumeUrl: validatedData.resumeUrl || "",
      })
      .returning();
    
    // Generate a reference code
    const referenceCode = `APP-${application.id.substring(0, 6)}`;
    
    // In a production app, you'd likely save this reference code to the application
    // or a related table
    
    // Revalidate relevant paths
    revalidatePath(`/job-seeker/applications`);
    revalidatePath(`/job-seeker/jobs/${validatedData.jobId}`);
    
    return { 
      success: true, 
      data: { 
        id: application.id,
        referenceCode
      }
    };
  } catch (error) {
    console.error("Error submitting application:", error);
    return { error: "Failed to submit application", success: false };
  }
}

/**
 * Withdraw a job application
 */
export async function withdrawJobApplication(applicationId: string) {
  // Get the current user session
  const session = await getTypedSession();
  if (!session?.user) {
    return { error: "Unauthorized", success: false };
  }
  
  try {
    // Update the application status
    await db
      .update(jobApplications)
      .set({ status: 'WITHDRAWN' })
      .where(sql`${jobApplications.id} = ${applicationId}`);
    
    // Revalidate relevant paths
    revalidatePath(`/job-seeker/applications`);
    
    return { success: true };
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return { error: "Failed to withdraw application", success: false };
  }
}

/**
 * Get a user's job applications
 */
export async function getUserJobApplications() {
  // Get the current user session
  const session = await getTypedSession();
  if (!session?.user) {
    return { error: "Unauthorized", success: false };
  }
  
  try {
    // Get the user profile ID
    const userId = session.user.id;
    if (!userId) {
      return { error: "User ID not found", success: false };
    }
    
    const userProfileId = (session.user as any).userProfileId || await getUserProfileId(userId);
    if (!userProfileId) {
      return { error: "User profile not found", success: false };
    }
    
    // Get the applications
    const applications = await db
      .select()
      .from(jobApplications)
      .where(sql`${jobApplications.applicantProfileId} = ${userProfileId}`);
    
    return { success: true, data: applications };
  } catch (error) {
    console.error("Error getting applications:", error);
    return { error: "Failed to get applications", success: false };
  }
}

/**
 * Helper function to get a user's profile ID
 */
async function getUserProfileId(userId: string): Promise<string | null> {
  try {
    // Import only used in this function to avoid circular dependencies
    const { userProfiles } = await import('@/lib/db');
    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(sql`${userProfiles.userId} = ${userId}`);
      
    return userProfile?.id || null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
} 
