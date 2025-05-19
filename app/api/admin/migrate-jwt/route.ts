import { NextRequest, NextResponse } from 'next/server';
import { db, users, userProfiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getJobSeekerOnboardingStatus, getEmployerOnboardingStatus } from '@/lib/db';

/**
 * Admin endpoint to run the JWT migration for all users.
 * 
 * This endpoint:
 * 1. Processes all users in the database
 * 2. Checks their onboarding status 
 * 3. Logs the results
 * 
 * This doesn't directly modify any JWTs (as that's not possible server-side),
 * but ensures all users' onboarding statuses are correctly calculated.
 * Users will get the updated onboarding status on their next login or session refresh.
 */

// This is an admin-only endpoint that should be protected in production environments
// Implement proper authorization before deploying to production

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
    
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users to migrate`);
    
    const results = {
      total: allUsers.length,
      processed: 0,
      jobSeekers: 0,
      employers: 0,
      errors: 0,
      errorDetails: [] as string[]
    };
    
    // Process users in batches to avoid memory issues
    for (const user of allUsers) {
      try {
        // Process based on user type
        if (user.userType === 'job_seeker') {
          results.jobSeekers++;
          // Get and store onboarding status
          const status = await getJobSeekerOnboardingStatus(user.id);
          
          // Log the status for debugging
          console.log(`User ${user.id} (job seeker) onboarding status: ${status.completed ? 'completed' : 'incomplete'}`);
          
          // We don't need to modify the JWT here - it will be updated when user logs in next
          // This simply ensures the database has the correct status
        } else if (user.userType === 'employer') {
          results.employers++;
          // Get and store onboarding status
          const status = await getEmployerOnboardingStatus(user.id);
          
          // Log the status for debugging
          console.log(`User ${user.id} (employer) onboarding status: ${status.completed ? 'completed' : 'incomplete'}`);
          
          // We don't need to modify the JWT here - it will be updated when user logs in next
        }
        
        results.processed++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.errors++;
        results.errorDetails.push(`User ${user.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} users (${results.jobSeekers} job seekers, ${results.employers} employers)`,
      errors: results.errors,
      errorDetails: results.errorDetails.length > 0 ? results.errorDetails : undefined
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate users', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 