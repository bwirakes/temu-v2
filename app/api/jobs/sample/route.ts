import { NextResponse } from 'next/server';
import { db, jobs, employers } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

// Cache the response for 1 hour (3600 seconds)
export const revalidate = 3600;

/**
 * GET endpoint that fetches the 4 most recently posted, confirmed jobs
 * with employer information for the job seeker dashboard.
 */
export async function GET() {
  try {
    const sampleJobsData = await db
      .select({
        uuid: jobs.id,
        jobId: jobs.jobId,
        jobTitle: jobs.jobTitle,
        companyName: employers.namaPerusahaan,
        logoUrl: employers.logoUrl,
      })
      .from(jobs)
      .leftJoin(employers, eq(jobs.employerId, employers.id))
      .where(eq(jobs.isConfirmed, true))
      .orderBy(desc(jobs.postedDate))
      .limit(4);

    return NextResponse.json({ jobs: sampleJobsData });
  } catch (error) {
    console.error('Error fetching sample jobs:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching sample jobs.' },
      { status: 500 }
    );
  }
} 
