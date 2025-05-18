'use client';

import Link from 'next/link';

export default function LogoutSuccessPage() {
  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm p-6 dark:bg-neutral-900 dark:border-neutral-700">
      <div className="text-center">
        <div className="mb-4 inline-flex justify-center items-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900">
          <svg className="w-6 h-6 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
          Berhasil Keluar
        </h1>
        <p className="mt-3 text-gray-600 dark:text-neutral-400">
          Anda telah berhasil keluar dari akun Anda.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/auth/signin"
          className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
        >
          Masuk Kembali
        </Link>
      </div>
    </div>
  );
} 