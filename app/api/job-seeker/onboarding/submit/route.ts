import { NextRequest, NextResponse } from "next/server";
import { db, userProfiles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { validateOnboardingCompletion } from "@/lib/middleware/validateOnboarding";

export async function POST(req: NextRequest) {
  try {
    // Validate onboarding completion
    const validationResult = await validateOnboardingCompletion(req);
    
    if (!validationResult.isValid) {
      return validationResult.response;
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
      redirectUrl: "/dashboard" // Provide redirect URL for client
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json({ 
      error: "Failed to complete onboarding",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 
