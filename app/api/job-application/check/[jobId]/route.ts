import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, jobApplications, getUserProfileByUserId } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// Define the session type to match what's in lib/auth.ts
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

// GET endpoint to check if the current user has already applied for a specific job
export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  try {
    // Check authentication
    const session = await auth() as CustomSession;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Only job seekers should be able to check their applications
    if (session.user.userType !== 'job_seeker') {
      return NextResponse.json(
        { error: "Only job seekers can access this endpoint" },
        { status: 403 }
      );
    }
    
    const jobId = (await props.params).jobId;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Get user profile
    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 400 }
      );
    }
    
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has already applied for this job
    const existingApplications = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.applicantProfileId, userProfile.id),
          eq(jobApplications.jobId, jobId)
        )
      );
    
    const hasApplied = existingApplications.length > 0;
    
    // If the user has applied, find the reference code
    let referenceCode = '';
    if (hasApplied && existingApplications[0]) {
      // Generate a reference code based on the application ID
      const applicationId = existingApplications[0].id;
      
      // Format: JA-{YEAR}{MONTH}{DAY}-{FIRST 6 CHARS OF UUID}
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const shortId = applicationId.substring(0, 6).toUpperCase();
      referenceCode = `JA-${year}${month}${day}-${shortId}`;
    }
    
    // Return the result
    return NextResponse.json(
      { 
        success: true, 
        hasApplied,
        application: hasApplied ? existingApplications[0] : null,
        referenceCode
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error checking job application status:', error);
    
    return NextResponse.json(
      { error: "Failed to check application status" },
      { status: 500 }
    );
  }
} 