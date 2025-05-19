import { auth } from '@/lib/auth';
import { CustomSession } from './types';

/**
 * Gets the authenticated session with proper typing
 * This ensures consistent handling of user types across server components and actions
 */
export async function getTypedSession(): Promise<CustomSession> {
  return await auth() as CustomSession;
}

/**
 * Checks if the user is authenticated and is a job seeker
 * Returns the session if authenticated and the user is a job seeker
 * @throws Error if not authenticated or not a job seeker
 */
export async function getJobSeekerSession(): Promise<CustomSession> {
  const session = await getTypedSession();
  
  if (!session || !session.user) {
    throw new Error('Authentication required');
  }
  
  if (session.user.userType !== 'job_seeker') {
    throw new Error('Only job seekers can access this resource');
  }
  
  return session;
}

/**
 * Checks if the user is authenticated and is an employer
 * Returns the session if authenticated and the user is an employer
 * @throws Error if not authenticated or not an employer
 */
export async function getEmployerSession(): Promise<CustomSession> {
  const session = await getTypedSession();
  
  if (!session || !session.user) {
    throw new Error('Authentication required');
  }
  
  if (session.user.userType !== 'employer') {
    throw new Error('Only employers can access this resource');
  }
  
  return session;
}

/**
 * Refreshes the NextAuth session to update JWT token with current onboarding status
 * Call this after a user completes onboarding to ensure their JWT contains 
 * the updated onboardingCompleted flag.
 */
export async function refreshAuthSession() {
  // This triggers NextAuth to revalidate the session and generate a new token
  // which will pick up the latest onboarding status from the database
  try {
    // Using a no-cache fetch to ensure we get fresh data
    await fetch('/api/auth/session?update', { 
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
      }
    });
    console.log('Auth session refreshed to update onboarding status');
    return true;
  } catch (error) {
    console.error('Failed to refresh auth session:', error);
    return false;
  }
} 