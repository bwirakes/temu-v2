'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CustomSession } from '@/lib/types';

export default function JobSeekerPage() {
  const router = useRouter();
  const { data: session, status } = useSession() as { 
    data: CustomSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return;
      }
      
      if (status === 'authenticated' && session?.user) {
        if (session.user.userType !== 'job_seeker') {
          router.push('/');
          return;
        }
        
        try {
          // Make a request to an API endpoint to check onboarding status
          console.log("Checking job seeker onboarding status...");
          const response = await fetch('/api/job-seeker/check-onboarding');
          const data = await response.json();
          
          console.log("Onboarding status:", data);
          
          // If onboarding is not complete, redirect to the onboarding step
          if (!data.completed && data.redirectTo) {
            console.log(`Redirecting to onboarding: ${data.redirectTo}`);
            
            // Force a hard navigation to the onboarding page
            window.location.href = data.redirectTo;
            return;
          }
          
          // If onboarding is complete, redirect to dashboard
          router.push('/job-seeker/dashboard');
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Default to redirecting to dashboard
          router.push('/job-seeker/dashboard');
        } finally {
          setIsChecking(false);
        }
      }
    }
    
    checkOnboardingStatus();
  }, [status, session, router]);

  // Show loading state while checking
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat...</p>
      </div>
    </div>
  );
} 