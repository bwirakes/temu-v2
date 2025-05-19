import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CustomSession } from '@/lib/types';
import { db, employers, jobs, jobApplications, userProfiles, getUserProfileByUserId } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * API route that handles job application initiation after authentication
 * This is called by the apply page after confirming the user is authenticated
 * and creates a new application record and redirects to the proper application flow
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session and verify the user is authenticated
    const session = await auth() as CustomSession;
    
    if (!session?.user) {
      // If not authenticated, redirect to sign-in
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // Verify user is a job seeker
    if (session.user.userType !== 'job_seeker') {
      // Only job seekers can apply for jobs
      console.error('User is not a job seeker:', session.user.id);
      return NextResponse.redirect(
        new URL('/error?message=Anda harus login sebagai pencari kerja untuk melamar', request.url)
      );
    }
    
    // Parse URL parameters
    const searchParams = request.nextUrl.searchParams;
    const employerId = searchParams.get('employerId');
    const jobId = searchParams.get('jobId');
    
    if (!employerId || !jobId) {
      console.error('Missing required parameters:', { employerId, jobId });
      return NextResponse.redirect(
        new URL('/error?message=Parameter yang diperlukan tidak lengkap', request.url)
      );
    }
    
    // Get the user's profile ID (we need this for the applicantProfileId field)
    const userProfile = await getUserProfileByUserId(session.user.id);
    if (!userProfile) {
      console.error('User profile not found:', session.user.id);
      return NextResponse.redirect(
        new URL('/error?message=Profil pengguna tidak ditemukan', request.url)
      );
    }
    
    // Verify job posting exists
    const [jobPosting] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));
    
    if (!jobPosting) {
      console.error('Job posting not found:', jobId);
      return NextResponse.redirect(
        new URL('/error?message=Lowongan tidak ditemukan', request.url)
      );
    }
    
    // Check if user has already applied to this job
    const existingApplications = await db
      .select({ id: jobApplications.id })
      .from(jobApplications)
      .where(
        sql`${jobApplications.jobId} = ${jobId} AND ${jobApplications.applicantProfileId} = ${userProfile.id}`
      );
    
    if (existingApplications.length > 0) {
      // User has already applied, redirect to the existing application
      const applicationId = existingApplications[0].id;
      console.log('User has already applied to this job:', { userId: session.user.id, jobId, applicationId });
      return NextResponse.redirect(
        new URL(`/job-seeker/applications/${applicationId}/view?message=already-applied`, request.url)
      );
    }
    
    // Create a new application stub
    const applicationId = uuidv4();
    const referenceCode = generateApplicationReferenceCode();
    const now = new Date();
    
    // Use CV file URL from user profile
    const cvFileUrl = userProfile.cvFileUrl || null;
    
    await db.insert(jobApplications).values({
      id: applicationId,
      jobId: jobId,
      applicantProfileId: userProfile.id,  // Use the profile ID, not user ID
      status: 'SUBMITTED',  // Use the correct enum value from the schema
      additionalNotes: 'Application created via job application flow',
      cvFileUrl: cvFileUrl
      // Other fields can be updated later in the application flow
    });
    
    console.log('Created new application:', { applicationId, jobId, userProfileId: userProfile.id });
    
    // Redirect to the application form
    return NextResponse.redirect(
      new URL(`/job-seeker/applications/${applicationId}/step-1`, request.url)
    );
    
  } catch (error) {
    console.error('Error in job application process:', error);
    return NextResponse.redirect(
      new URL('/error?message=Terjadi kesalahan saat memproses lamaran', request.url)
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