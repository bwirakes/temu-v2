import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getOnboardingStatus } from '@/lib/auth-helpers';

// This endpoint is for updating a specific user's JWT onboarding status
// It doesn't directly modify the JWT (as that's not possible server-side)
// but ensures the database has the correct information for next login/token refresh

export async function POST(req: NextRequest) {
  try {
    // Simple auth check - in production, use a proper admin auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const adminToken = authHeader.split(' ')[1];
    // In production, validate against a secure admin token
    if (adminToken !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
    
    // Get user ID from request body
    const { userId, email } = await req.json();
    
    if (!userId && !email) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        message: 'Either userId or email must be provided' 
      }, { status: 400 });
    }
    
    // Find the user
    let user;
    if (userId) {
      [user] = await db.select().from(users).where(eq(users.id, userId));
    } else if (email) {
      [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check onboarding status
    const userType = user.userType;
    const status = await getOnboardingStatus(user.id, userType);
    
    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      userType,
      onboardingStatus: {
        completed: status.completed,
        redirectTo: status.redirectTo
      },
      message: `User ${user.id} (${user.email}) onboarding status checked. JWT will be updated on next login or session refresh.`
    });
  } catch (error) {
    console.error('Error updating user JWT:', error);
    return NextResponse.json(
      { error: 'Failed to update user JWT', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 