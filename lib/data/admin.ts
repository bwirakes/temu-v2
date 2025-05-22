/**
 * Data-fetching functions for admin dashboard statistics
 * These functions query the actual database using Drizzle ORM
 */
import { db, users, jobs, jobApplications } from '@/lib/db';
import { count, eq, sum } from 'drizzle-orm';

/**
 * Gets the total number of employer accounts
 */
export async function getEmployerAccountCount(): Promise<number> {
  try {
    const result = await db.select({ value: count() })
      .from(users)
      .where(eq(users.userType, 'employer'));
    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Error fetching employer account count:", error);
    throw new Error("Failed to fetch employer account count");
  }
}

/**
 * Gets the total number of job seeker accounts
 */
export async function getJobSeekerAccountCount(): Promise<number> {
  try {
    const result = await db.select({ value: count() })
      .from(users)
      .where(eq(users.userType, 'job_seeker'));
    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Error fetching job seeker account count:", error);
    throw new Error("Failed to fetch job seeker account count");
  }
}

/**
 * Gets the total number of jobs posted
 */
export async function getTotalJobsPosted(): Promise<number> {
  try {
    const result = await db.select({ value: count() })
      .from(jobs)
      .where(eq(jobs.isConfirmed, true));
    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Error fetching total jobs posted:", error);
    throw new Error("Failed to fetch total jobs posted");
  }
}

/**
 * Gets the total number of job applications
 */
export async function getTotalApplications(): Promise<number> {
  try {
    const result = await db.select({ value: count() })
      .from(jobApplications);
    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Error fetching total applications:", error);
    throw new Error("Failed to fetch total applications");
  }
}

/**
 * Gets the total number of job openings (sum of all numberOfPositions)
 */
export async function getTotalJobOpenings(): Promise<number> {
  try {
    const result = await db.select({ 
      value: sum(jobs.numberOfPositions) 
    })
    .from(jobs)
    .where(eq(jobs.isConfirmed, true));
    
    // If there are no jobs, sum might return null
    // Convert the result to a number to ensure type safety
    const totalOpenings = result[0]?.value;
    return totalOpenings ? Number(totalOpenings) : 0;
  } catch (error) {
    console.error("Error fetching total job openings:", error);
    throw new Error("Failed to fetch total job openings");
  }
}

// Utility function to fetch all metrics at once
export async function getAllAdminMetrics() {
  const [
    employerCount,
    jobSeekerCount,
    jobsPosted,
    applications,
    openings
  ] = await Promise.all([
    getEmployerAccountCount(),
    getJobSeekerAccountCount(),
    getTotalJobsPosted(),
    getTotalApplications(),
    getTotalJobOpenings()
  ]);

  return {
    employerCount,
    jobSeekerCount,
    jobsPosted,
    applications,
    openings
  };
} 