import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllAdminMetrics } from '@/lib/data/admin';

/**
 * API handler to get admin dashboard statistics
 * This endpoint is protected and can only be accessed by the admin user
 */
export async function GET() {
  try {
    // Verify the current session
    const session = await auth();
    
    // If no user is logged in or if the user is not the admin, return 403
    if (!session?.user || session.user.email !== 'brandon.r.wirakesuma@gmail.com') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 403 }
      );
    }
    
    // Fetch all admin metrics
    const metrics = await getAllAdminMetrics();
    
    // Return the data
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch admin statistics' }),
      { status: 500 }
    );
  }
} 