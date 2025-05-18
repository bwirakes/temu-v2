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