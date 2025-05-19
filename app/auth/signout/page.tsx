'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Directly sign out without any additional checks
        await signOut({ redirect: false });
        
        // After successful signout, redirect to home page
        router.push('/');
      } catch (err) {
        console.error('Error during sign out:', err);
        setError('Terjadi kesalahan saat keluar. Silakan coba lagi.');
        setIsLoading(false);
      }
    };

    performSignOut();
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[300px] p-4">
      <div className="text-center">
        <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-600 border-r-transparent rounded-full"></div>
        <p className="mt-6 text-lg text-gray-700 dark:text-neutral-300">Sedang keluar dari akun Anda...</p>
      </div>
    </div>
  );
} 