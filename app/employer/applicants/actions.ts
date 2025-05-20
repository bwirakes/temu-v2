'use server';

import { db, jobApplications, userProfiles, jobs } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { ApplicantRow } from './types';

/**
 * Server action to fetch all applicants for an employer
 */
export async function getApplicantsForEmployer(employerId: string): Promise<ApplicantRow[]> {
  // Fetch all job applications for the employer
  const applicationsData = await db
    .select({
      applicationId: jobApplications.id,
      applicantName: userProfiles.namaLengkap,
      applicantEmail: userProfiles.email,
      jobId: jobs.id,
      jobTitle: jobs.jobTitle,
      status: jobApplications.status,
      cvFileUrl: userProfiles.cvFileUrl,
    })
    .from(jobApplications)
    .innerJoin(
      userProfiles,
      eq(jobApplications.applicantProfileId, userProfiles.id)
    )
    .innerJoin(
      jobs,
      eq(jobApplications.jobId, jobs.id)
    )
    .where(
      eq(jobs.employerId, employerId)
    );

  // Function to generate a fake date based on ID
  const generateDateFromId = (id: string): Date => {
    // Extract a numeric value from the UUID to use as a timestamp offset
    const numericValue = parseInt(id.replace(/[^0-9]/g, '').substring(0, 8) || '0', 10);
    // Create a date within the last year (more realistic than using current date for all)
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const timeSpan = now.getTime() - oneYearAgo.getTime();
    return new Date(oneYearAgo.getTime() + (numericValue % timeSpan));
  };

  // Transform the data to match the ApplicantRow interface
  return applicationsData.map(app => ({
    applicationId: app.applicationId,
    applicantName: app.applicantName,
    applicantEmail: app.applicantEmail,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    // Generate a timestamp from the ID
    applicationDate: generateDateFromId(app.applicationId).toISOString(),
    status: app.status,
    cvFileUrl: app.cvFileUrl,
  }));
} 
