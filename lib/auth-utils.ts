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
 * 
 * Optimized version with better error handling and performance.
 */
export async function refreshAuthSession() {
  try {
    // Use AbortController to set a timeout on the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Using a no-cache fetch with signal for timeout control
    const response = await fetch('/api/auth/session?update', { 
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      signal: controller.signal
    });
    
    // Clear timeout once request completes
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('Auth session refresh response not OK:', response.status);
      return false;
    }
    
    // We don't need to parse the response, just confirm it happened
    console.log('Auth session refreshed to update onboarding status');
    return true;
  } catch (error) {
    // Don't treat AbortError as a failure since we're just timing out the request
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Auth session refresh timed out, continuing...');
      return true; // Assume it worked to prevent blocking the user
    }
    
    console.error('Failed to refresh auth session:', error);
    return false;
  }
} 