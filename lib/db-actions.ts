import 'server-only';
import { 
  db, 
  jobApplications, 
  userProfiles,
  jobs,
  employers
} from './db';
import { eq } from 'drizzle-orm';

/**
 * Get a job application by ID
 */
export async function getJobApplicationById(applicationId: string) {
  try {
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, applicationId));
    
    return application;
  } catch (error) {
    console.error('Error fetching job application:', error);
    return null;
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfileById(profileId: string) {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, profileId));
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get a job by ID
 */
export async function getJobById(jobId: string) {
  try {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
    
    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

/**
 * Get an employer by ID
 */
export async function getEmployerById(employerId: string) {
  try {
    const [employer] = await db
      .select()
      .from(employers)
      .where(eq(employers.id, employerId));
    
    return employer;
  } catch (error) {
    console.error('Error fetching employer:', error);
    return null;
  }
}

/**
 * Get a user profile by user ID
 */
export async function getUserProfileByUserId(userId: string) {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile by user ID:', error);
    return null;
  }
} 
