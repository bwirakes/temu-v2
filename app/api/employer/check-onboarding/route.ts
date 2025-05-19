import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmployerByUserId, db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { CustomSession } from '@/lib/types';

/**
 * Endpoint to check if the employer has completed onboarding
 * With the new approach, we only check if onboarding is completed
 * We don't track progress on the server-side anymore
 */
export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
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
    
    const userId = session.user.id;
    
    // First check if the user's onboardingCompleted flag is true
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (user?.onboardingCompleted) {
      // If onboardingCompleted is true, onboarding is completed
      return NextResponse.json({
        completed: true
      });
    }
    
    // Check if the user already has an employer record
    const employer = await getEmployerByUserId(userId);
    
    if (employer) {
      // If employer record exists, mark onboarding as completed for consistency
      try {
        await db
          .update(users)
          .set({ 
            onboardingCompleted: true,
            updatedAt: new Date() 
          })
          .where(eq(users.id, userId));
      } catch (error) {
        console.error("Error updating onboarding status:", error);
      }
      
      // Return completed status
      return NextResponse.json({
        completed: true
      });
    }
    
    // If no employer record and onboardingCompleted is false, onboarding is not completed
    return NextResponse.json({
      completed: false
    });
    
  } catch (error) {
    console.error("Error checking employer onboarding status:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred while checking onboarding status", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 