import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateEmployerOnboardingProgress } from '@/lib/db';

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

export async function POST(request: Request) {
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
    
    // Parse request body
    const requestData = await request.json();
    
    // Extract the current step from the request body
    let currentStep: number | undefined = undefined;
    
    // Extract from the body - it should now always be present
    if (requestData.currentStep !== undefined) {
      currentStep = Number(requestData.currentStep);
      console.log(`Current step from request body: ${currentStep}`);
      
      // Keep currentStep in the data object - don't remove it
    } else {
      // Fallback to URL if somehow not in body
      const url = new URL(request.url);
      const stepParam = url.searchParams.get('step');
      if (stepParam) {
        currentStep = Number(stepParam);
        console.log(`Current step from URL: ${currentStep}`);
        // Add the step to the request data
        requestData.currentStep = currentStep;
      }
    }
    
    // Validate the step number
    if (currentStep !== undefined && (isNaN(currentStep) || currentStep < 1 || currentStep > 4)) {
      console.log(`Invalid step number: ${currentStep}`);
      return NextResponse.json(
        { error: "Invalid step number" },
        { status: 400 }
      );
    }
    
    // If there's still no current step, default to step 1
    if (currentStep === undefined) {
      console.log("No current step provided, defaulting to step 1");
      currentStep = 1;
      requestData.currentStep = 1;
    }
    
    console.log('Processing save for user:', userId);
    console.log('Current step:', currentStep);
    console.log('Progress data:', requestData);
    
    // Save the onboarding progress to the database
    try {
      const updatedProgress = await updateEmployerOnboardingProgress(userId, {
        currentStep,
        status: 'IN_PROGRESS',
        data: requestData
      });
      
      // Return success response with the updated progress
      return NextResponse.json(
        { 
          success: true, 
          message: "Progress saved successfully",
          data: {
            currentStep: updatedProgress.currentStep,
            status: updatedProgress.status
          }
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error when saving employer onboarding progress:", dbError);
      
      // Check for "relation does not exist" error
      if (dbError instanceof Error && dbError.message.includes("relation") && dbError.message.includes("does not exist")) {
        return NextResponse.json(
          { 
            error: "Database schema error", 
            message: "The required database table does not exist. Please run the database migration.",
            details: "See MIGRATION-INSTRUCTIONS.md for instructions on how to fix this issue."
          },
          { status: 500 }
        );
      }
      
      // Other database errors
      throw dbError;
    }
    
  } catch (error) {
    console.error("Error saving employer onboarding progress:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred while saving progress", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 