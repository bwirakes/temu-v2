import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CustomUser } from '@/lib/types';

/**
 * Server Component: Landing page for job seekers
 * 
 * This component serves as an entry point for the /job-seeker route.
 * Instead of client-side redirects with API calls, we handle all redirects
 * efficiently on the server side based on auth session data.
 */
export default async function JobSeekerPage() {
  // Get auth session (cached by Next.js automatically)
  const session = await auth();
  
  // Get user from session
  const user = session?.user as CustomUser | undefined;
  
  // Redirect logic based on authentication and onboarding status
  if (!user) {
    // User not authenticated, redirect to sign in
    redirect('/auth/signin');
  }
  
  if (user.userType !== 'job_seeker') {
    // Wrong user type, redirect to home
    redirect('/');
  }
  
  if (user.onboardingCompleted) {
    // Onboarding completed, redirect to dashboard
    redirect('/job-seeker/dashboard');
  } else {
    // Onboarding not completed, redirect to appropriate onboarding step
    redirect(user.onboardingRedirectTo || '/job-seeker/onboarding/informasi-dasar');
  }
  
  // This part should never execute due to redirects above
} 