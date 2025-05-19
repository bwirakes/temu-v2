import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { CustomUser } from '@/lib/types';

/**
 * GET handler for refreshing the session token
 * This will force a new JWT token to be issued based on current database state
 */
export async function GET(req: NextRequest) {
  try {
    // Get current session data
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = session.user as CustomUser;
    
    // Get the latest user data from database
    const [latestUserData] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));
    
    if (!latestUserData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`Session refresh requested for user ${user.id}`);
    console.log(`Current onboardingCompleted in session: ${user.onboardingCompleted}`);
    console.log(`Latest onboardingCompleted in DB: ${latestUserData.onboardingCompleted}`);
    
    // Set a cache control header to prevent caching
    const headers = new Headers({
      'Cache-Control': 'no-store, must-revalidate, max-age=0',
      'Content-Type': 'application/json',
    });
    
    // Return the current session data
    // Note: The session will be refreshed on next request
    // This is just to inform the client of the current status
    return new NextResponse(
      JSON.stringify({
        user: {
          ...user,
          onboardingCompleted: latestUserData.onboardingCompleted,
          dbTimestamp: latestUserData.updatedAt.toISOString()
        },
        message: 'Session will refresh on next request'
      }),
      { headers }
    );
  } catch (error) {
    console.error('Error getting session:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get current session data
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = session.user as CustomUser;
    
    // Parse request body to get updated fields
    const body = await req.json();
    
    // Validate that onboardingCompleted is a boolean
    if (typeof body.onboardingCompleted !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid onboardingCompleted value' },
        { status: 400 }
      );
    }
    
    console.log(`Updating onboardingCompleted to ${body.onboardingCompleted} for user ${user.id}`);
    
    // Update user in the database
    const [updatedUser] = await db
      .update(users)
      .set({
        onboardingCompleted: body.onboardingCompleted,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))
      .returning();
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }
    
    console.log('User updated in database:', updatedUser.id);
    
    // We can't directly modify the session here, but we've updated the DB
    // The next request will have the updated session token
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully. Session will refresh on next request.'
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 