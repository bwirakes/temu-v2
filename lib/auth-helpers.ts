import { getJobSeekerOnboardingStatus, getEmployerOnboardingStatus } from './db';

/**
 * Fetches the onboarding status for a user by ID and type
 * This is used both on initial sign in and token updates
 */
export async function getOnboardingStatus(userId: string, userType: string): Promise<{ completed: boolean; redirectTo: string }> {
  try {
    if (userType === 'job_seeker') {
      const status = await getJobSeekerOnboardingStatus(userId);
      return { 
        completed: status.completed, 
        redirectTo: status.redirectTo 
      };
    } else if (userType === 'employer') {
      const status = await getEmployerOnboardingStatus(userId);
      return { 
        completed: status.completed, 
        redirectTo: status.redirectTo || '/employer' 
      };
    }
    
    // Default fallback
    return { completed: true, redirectTo: '/' };
  } catch (error) {
    console.error(`Error fetching onboarding status for ${userType} ${userId}:`, error);
    // Safe defaults based on user type
    if (userType === 'job_seeker') {
      return { completed: false, redirectTo: '/job-seeker/onboarding/informasi-dasar' };
    } else {
      return { completed: true, redirectTo: '/employer' };
    }
  }
} 