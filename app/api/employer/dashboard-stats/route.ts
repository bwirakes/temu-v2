import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, jobs, jobApplications } from '@/lib/db';
import { count, eq, and } from 'drizzle-orm';
import { getEmployerByUserId } from '@/lib/db';

// Define the custom session type to match what's in lib/auth.ts
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get employer ID from the user ID
    const employer = await getEmployerByUserId(session.user.id);
    
    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Query for active jobs count (where isConfirmed is true)
    const activeJobsResult = await db
      .select({ value: count() })
      .from(jobs)
      .where(and(
        eq(jobs.employerId, employer.id),
        eq(jobs.isConfirmed, true)
      ))
      .execute();
    
    const activeJobsCount = activeJobsResult[0]?.value ?? 0;

    // Query for total applications count related to the employer's jobs
    const totalApplicantsResult = await db
      .select({ value: count() })
      .from(jobApplications)
      .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(eq(jobs.employerId, employer.id))
      .execute();
    
    const totalApplicantsCount = totalApplicantsResult[0]?.value ?? 0;

    // Return the dashboard statistics
    return NextResponse.json({
      activeJobsCount,
      totalApplicantsCount
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
} 