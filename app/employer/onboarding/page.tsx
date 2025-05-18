"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CustomSession } from '@/lib/types';

export default function EmployerOnboardingPage() {
  const { data: session, status } = useSession() as { 
    data: CustomSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.userType !== 'employer') {
        router.push('/');
      } else {
        // Automatically redirect to the first step of employer onboarding
        router.push('/employer/onboarding/informasi-perusahaan');
      }
    }
  }, [session, status, router]);

  // Show loading state while checking authentication or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat...</p>
      </div>
    </div>
  );
} 