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
    
    // Get the user profile and check if CV is uploaded
    const userProfile = await getJobSeekerByUserId(userId);
    
    // Use the more comprehensive onboarding status check
    const onboardingStatus = await getJobSeekerOnboardingStatus(userId);
    
    // Check onboarding status based on onboardingCompleted flag in users table
    const onboardingCompleted = session.user.onboardingCompleted || false;
    
    if (onboardingCompleted) {
      // If onboarding is complete, redirect to dashboard
      return NextResponse.json({
        completed: true,
        redirectTo: '/job-seeker/dashboard'
      });
    } else {
      // If CV is missing but is now required, redirect to CV upload step
      if (userProfile && !userProfile.cvFileUrl && onboardingStatus.completedSteps.includes(5)) {
        return NextResponse.json({
          completed: false,
          currentStep: 8,
          redirectTo: '/job-seeker/onboarding/cv-upload'
        });
      }
      
      // Otherwise use the status from getJobSeekerOnboardingStatus
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