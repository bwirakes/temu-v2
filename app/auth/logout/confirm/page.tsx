'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LogoutConfirmPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push('/auth/logout/success');
    } catch (error) {
      console.error('Error during sign out:', error);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-neutral-900 dark:border-neutral-700">
      <div className="text-center">
        <div className="mb-4 inline-flex justify-center items-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </div>
        <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
          Konfirmasi Keluar
        </h1>
        <p className="mt-3 text-gray-600 dark:text-neutral-400">
          Apakah Anda yakin ingin keluar dari akun Anda?
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-r-transparent rounded-full mr-2"></span>
              Sedang Keluar...
            </>
          ) : (
            'Ya, Keluar'
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Batal
        </button>
      </div>
    </div>
  );
} 
