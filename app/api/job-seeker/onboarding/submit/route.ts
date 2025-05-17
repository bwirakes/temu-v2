import { NextRequest, NextResponse } from "next/server";
import { db, userProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { validateOnboardingCompletion } from "@/lib/middleware/validateOnboarding";

export async function POST(req: NextRequest) {
  try {
    // Validate onboarding completion
    const validationResult = await validateOnboardingCompletion(req);
    
    if (!validationResult.isValid) {
      // Extract redirect URL from the response if available
      let errorResponse;
      try {
        errorResponse = await validationResult.response.json();
      } catch (e) {
        errorResponse = { error: "Validation failed" };
      }

      // Return a more user-friendly response with redirect information
      return NextResponse.json({
        success: false,
        error: errorResponse.error || "Onboarding validation failed",
        missingFields: errorResponse.missingFields || [],
        redirectTo: errorResponse.redirectTo || "/job-seeker/onboarding/ringkasan"
      }, { status: 400 });
    }

    const { userProfile } = validationResult;

    // Mark profile as complete
    await db
      .update(userProfiles)
      .set({ 
        updatedAt: new Date(),
        // In a real application, you might add a specific isComplete field
      })
      .where(eq(userProfiles.id, userProfile.id));

    return NextResponse.json({ 
      success: true,
      message: "Onboarding completed successfully",
      profileId: userProfile.id,
      redirectUrl: "/job-seeker/dashboard" // Provide redirect URL for client
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json({ 
      error: "Failed to complete onboarding",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 
