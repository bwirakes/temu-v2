import { 
  getJobSeekerOnboardingStatus, 
  getEmployerOnboardingStatus, 
  updateUserOnboardingStatus,
  users,
  db
} from './db';
import { eq } from 'drizzle-orm';

/**
 * Fetches the onboarding status for a user by ID and type
 * This is used for redirect calculations in middleware and pages
 */
export async function getOnboardingStatus(userId: string, userType: string): Promise<{ completed: boolean; redirectTo: string }> {
  try {
    // First check if the user's onboardingCompleted is true in the database
    // This is the source of truth for onboarding completion status
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // If the user has onboardingCompleted set to true, return completed status
    // This ensures consistency with the session token and prevents unnecessary API calls
    if (user?.onboardingCompleted) {
      console.log(`Auth-helpers: User ${userId} has onboardingCompleted=true in database`);
      const redirectPath = userType === 'job_seeker' ? '/job-seeker/dashboard' : '/employer/dashboard';
      return { 
        completed: true, 
        redirectTo: redirectPath
      };
    }
    
    // Otherwise, determine the correct onboarding status and redirect path
    if (userType === 'job_seeker') {
      const status = await getJobSeekerOnboardingStatus(userId);
      console.log(`Auth-helpers: Job seeker ${userId} onboarding status:`, status);
      return { 
        completed: status.completed, 
        redirectTo: status.redirectTo 
      };
    } else if (userType === 'employer') {
      const status = await getEmployerOnboardingStatus(userId);
      console.log(`Auth-helpers: Employer ${userId} onboarding status:`, status);
      return { 
        completed: status.completed, 
        redirectTo: status.redirectTo || '/employer' 
      };
    }
    
    // Default fallback
    console.log(`Auth-helpers: Unknown user type ${userType} for user ${userId}, defaulting to completed=true`);
    return { completed: true, redirectTo: '/' };
  } catch (error) {
    console.error(`Error fetching onboarding status for ${userType} ${userId}:`, error);
    // Safe defaults based on user type
    if (userType === 'job_seeker') {
      return { completed: false, redirectTo: '/job-seeker/onboarding/informasi-dasar' };
    } else {
      return { completed: false, redirectTo: '/employer/onboarding/informasi-perusahaan' };
    }
  }
}

/**
 * Updates the user's onboarding status in the database
 * This should be called when a user completes onboarding
 */
export async function completeUserOnboarding(userId: string): Promise<boolean> {
  try {
    console.log(`Completing onboarding for user ${userId}`);
    const updated = await updateUserOnboardingStatus(userId, true);
    return !!updated;
  } catch (error) {
    console.error(`Error updating onboarding status for user ${userId}:`, error);
    return false;
  }
}

/**
 * Checks if a user's onboarding is completed directly from the user record
 * Use this for simple checks where you don't need redirect information
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    return user?.onboardingCompleted || false;
  } catch (error) {
    console.error(`Error checking onboarding completion for user ${userId}:`, error);
    return false;
  }
} 