import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/mock-db';

export async function GET() {
  try {
    // Get test user
    const testUser = await getUserByEmail('test@example.com');
    
    return NextResponse.json({
      message: 'Test user check',
      testUserExists: !!testUser,
      testUserDetails: testUser ? {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        userType: testUser.userType,
        hasPassword: !!testUser.password
      } : null
    });
  } catch (error) {
    console.error('Error fetching test user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test user' },
      { status: 500 }
    );
  }
} 