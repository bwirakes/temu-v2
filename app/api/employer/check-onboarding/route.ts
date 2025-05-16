import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmployerOnboardingStatus, getEmployerByUserId } from '@/lib/db';

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
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if the user has the correct role
    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: "Forbidden: Only employers can access this endpoint" },
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
    
    console.log(`API: Checking onboarding status for user ${userId}`);
    
    // First, check if the employer record exists
    const employer = await getEmployerByUserId(userId);
    if (employer) {
      console.log(`API: Employer record found, onboarding is completed`);
      return NextResponse.json({
        completed: true,
        currentStep: 4,
        redirectTo: '/employer'
      });
    }
    
    // If we reach here, we need to determine which onboarding step the user should be on
    try {
      // Check the onboarding status
      const onboardingStatus = await getEmployerOnboardingStatus(userId);
      
      console.log(`API: Onboarding status:`, onboardingStatus);
      
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
        redirectTo: '/employer/onboarding/informasi-perusahaan'
      });
    }
    
  } catch (error: any) {
    console.error("Error checking employer onboarding status:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred while checking onboarding status", 
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
} 