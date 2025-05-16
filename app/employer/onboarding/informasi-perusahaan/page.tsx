'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

import InformasiPerusahaanForm from '@/components/employer-onboarding/forms/InformasiPerusahaanForm';
import EmployerOnboardingLayout from '@/components/employer-onboarding/EmployerOnboardingLayout';

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

export default function InformasiPerusahaanPage() {
  const { data: session, status } = useSession() as { 
    data: CustomSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.userType !== 'employer') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
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
    <EmployerOnboardingLayout 
      title="Informasi Perusahaan" 
      description="Langkah 1 dari 4: Lengkapi informasi dasar perusahaan Anda"
    >
      <InformasiPerusahaanForm />
    </EmployerOnboardingLayout>
  );
}