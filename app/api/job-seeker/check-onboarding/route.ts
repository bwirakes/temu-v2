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
    
    // Get the user profile
    const userProfile = await getJobSeekerByUserId(userId);
    
    // Get onboarding status directly from the database
    // This is the single source of truth
    const onboardingStatus = await getJobSeekerOnboardingStatus(userId);
    
    if (onboardingStatus.completed) {
      // If onboarding is complete according to the database, redirect to dashboard
      return NextResponse.json({
        completed: true,
        redirectTo: '/job-seeker/dashboard'
      });
    } else {
      // Otherwise use the detailed status from getJobSeekerOnboardingStatus
      return NextResponse.json({
        completed: onboardingStatus.completed,
        currentStep: onboardingStatus.currentStep,
        redirectTo: onboardingStatus.redirectTo || '/job-seeker/onboarding/informasi-dasar'
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