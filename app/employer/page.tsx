'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Extended session type to include userType
interface CustomSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

export default function EmployerDashboard() {
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
        if (session.user.userType !== 'employer') {
          router.push('/');
          return;
        }
        
        try {
          // Make a request to an API endpoint to check onboarding status
          console.log("Checking onboarding status...");
          const response = await fetch('/api/employer/check-onboarding');
          const data = await response.json();
          
          console.log("Onboarding status:", data);
          
          // If onboarding is not complete, redirect to the onboarding step
          if (!data.completed && data.redirectTo) {
            console.log(`Redirecting to onboarding: ${data.redirectTo}`);
            
            // Force a hard navigation to the onboarding page
            window.location.href = data.redirectTo;
            return;
          }
          
          // If onboarding is complete, allow access to dashboard
          setIsChecking(false);
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          setIsChecking(false);
        }
      }
    }
    
    checkOnboardingStatus();
  }, [status, session, router]);

  // Show loading state while checking
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Employer Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg">Welcome to your employer dashboard!</p>
        <p className="text-gray-600 mt-2">From here you can manage your job postings, view applications, and update your company profile.</p>
      </div>
    </div>
  );
} 