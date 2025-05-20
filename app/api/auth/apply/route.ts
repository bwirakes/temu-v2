import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CustomSession } from '@/lib/types';
import { db, employers, jobs, jobApplications, userProfiles, getUserProfileByUserId } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * API route that handles job application initiation after authentication
 * This is called by the Server Component after confirming the user is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session and verify the user is authenticated
    const session = await auth() as CustomSession;
    
    // Fast path for authentication failure - redirect directly to sign-in
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // Fast path for user type check - job seekers only
    if (session.user.userType !== 'job_seeker') {
      return NextResponse.redirect(
        new URL('/error?message=Anda harus login sebagai pencari kerja untuk melamar', request.url)
      );
    }
    
    // Parse URL parameters
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');
    const jobId = searchParams.get('jobId');
    
    if (!employerId || !jobId) {
      return NextResponse.redirect(
        new URL('/error?message=Parameter yang diperlukan tidak lengkap', request.url)
      );
    }
    
    // Get the user's profile
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    // If profile doesn't exist, create it first
    if (!userProfile) {
      const returnUrl = `/careers/${employerId}/${jobId}/apply`;
      return NextResponse.redirect(
        new URL(`/job-seeker/onboarding/informasi-dasar?returnTo=${encodeURIComponent(returnUrl)}`, request.url)
      );
    }
    
    // Verify job posting exists
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
    const jobPosting = isUuid 
      ? (await db.select().from(jobs).where(eq(jobs.id, jobId)))[0]
      : (await db.select().from(jobs).where(eq(jobs.jobId, jobId)))[0];
    
    if (!jobPosting) {
      return NextResponse.redirect(
        new URL('/error?message=Lowongan tidak ditemukan', request.url)
      );
    }
    
    // Use the UUID for database operations
    const jobUuid = isUuid ? jobId : jobPosting.id;
    
    // Check if user has already applied to this job
    const existingApplications = await db
      .select({ id: jobApplications.id })
      .from(jobApplications)
      .where(
        sql`${jobApplications.jobId} = ${jobUuid} AND ${jobApplications.applicantProfileId} = ${userProfile.id}`
      );
    
    if (existingApplications.length > 0) {
      // User has already applied, redirect to the existing application
      const applicationId = existingApplications[0].id;
      return NextResponse.redirect(
        new URL(`/job-seeker/applications/${applicationId}/view?message=already-applied`, request.url)
      );
    }
    
    // Create a new application
    const applicationId = uuidv4();
    const cvFileUrl = userProfile.cvFileUrl || null;
    
    await db.insert(jobApplications).values({
      id: applicationId,
      jobId: jobUuid,
      applicantProfileId: userProfile.id,
      status: 'SUBMITTED',
      additionalNotes: 'Application created via job application flow',
      cvFileUrl: cvFileUrl
    });
    
    // DIRECT REDIRECT - bypassing any middleware interference
    // Use a complete URL to ensure middleware doesn't intercept
    return NextResponse.redirect(
      new URL(`/job-seeker/job-application/${jobId}`, request.url)
    );
    
  } catch (error) {
    console.error('Error in job application process:', error);
    return NextResponse.redirect(
      new URL('/error?message=Error processing application', request.url)
    );
  }
}

/**
 * Generate a unique application reference code
 * Format: APP-XXXXX-YYMMDD where X is random alphanumeric and Y is date
 */
function generateApplicationReferenceCode(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 5 random alphanumeric characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `APP-${randomPart}-${year}${month}${day}`;
} 