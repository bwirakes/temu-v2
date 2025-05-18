import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, employerOnboardingProgress, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { CustomSession } from '@/lib/types';

/**
 * Debug endpoint to check employer onboarding data
 * USE THIS ONLY FOR DEBUGGING - REMOVE IN PRODUCTION
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Must be authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
    
    console.log(`Debug API: Looking up data for user ${userId}`);
    
    // Check if the user exists
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!userRecord) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    
    // Look up onboarding progress records
    const progressRecords = await db
      .select()
      .from(employerOnboardingProgress)
      .where(eq(employerOnboardingProgress.userId, userId));
    
    // Return all debug information
    return NextResponse.json({
      message: "Debug information retrieved successfully",
      userId,
      userEmail: userRecord.email,
      userType: userRecord.userType,
      onboardingRecordsCount: progressRecords.length,
      onboardingRecords: progressRecords.map(record => ({
        id: record.id,
        currentStep: record.currentStep,
        status: record.status,
        dataKeys: record.data ? Object.keys(record.data) : [],
        data: record.data,
        lastUpdated: record.lastUpdated,
        createdAt: record.createdAt
      }))
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 