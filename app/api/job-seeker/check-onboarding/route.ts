import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getJobSeekerByUserId, getJobSeekerOnboardingStatus } from '@/lib/db';
import { CustomSession } from '@/lib/types';

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if the user has the correct role
    if (session.user.userType !== 'job_seeker') {
      return NextResponse.json(
        { error: "Forbidden: Only job seekers can access this endpoint" },
        { status: 403 }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }
    
    console.log(`API: Checking onboarding status for job seeker ${userId}`);
    
    // Check onboarding status
    try {
      const onboardingStatus = await getJobSeekerOnboardingStatus(userId);
      
      console.log(`API: Job seeker onboarding status:`, onboardingStatus);
      
      // Return the status
      return NextResponse.json({
        completed: onboardingStatus.completed,
        currentStep: onboardingStatus.currentStep,
        redirectTo: onboardingStatus.redirectTo
      });
    } catch (dbError) {
      console.error("Database error checking onboarding status:", dbError);
      
      // If we have a database error, assume user needs to start onboarding
      return NextResponse.json({
        completed: false,
        currentStep: 1,
        redirectTo: '/job-seeker/onboarding/informasi-dasar'
      });
    }
    
  } catch (error: any) {
    console.error("Error checking job seeker onboarding status:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred while checking onboarding status", 
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
} 