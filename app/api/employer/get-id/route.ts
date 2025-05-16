import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmployerByUserId } from '@/lib/db';

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
    
    // Get the employer record
    const employer = await getEmployerByUserId(userId);
    
    if (!employer) {
      return NextResponse.json(
        { error: "Employer record not found" },
        { status: 404 }
      );
    }
    
    // Return the employer ID
    return NextResponse.json({
      employerId: employer.id
    });
    
  } catch (error) {
    console.error('Error getting employer ID:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 