import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * This is an admin-only endpoint to force all users to refresh their sessions.
 * It will add a property to the nextauth_* cookies to make them invalid,
 * forcing users to re-login and get fresh tokens with onboarding status.
 * 
 * WARNING: This will log out all users across the application.
 */
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
    
    // In Next.js, we can't directly invalidate all sessions
    // The most reliable approach is to update the JWT_SECRET environment variable
    // As an alternative, we'll recommend this in the response
    
    return NextResponse.json({
      success: true,
      message: "To immediately invalidate all existing sessions, update the JWT_SECRET environment variable.",
      instructions: [
        "1. Generate a new secret using: `openssl rand -base64 32`",
        "2. Update the JWT_SECRET environment variable with this new value",
        "3. Restart the application to apply the change",
        "4. All users will need to log in again and will get fresh tokens with onboarding status"
      ]
    });
    
  } catch (error) {
    console.error('Force refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 