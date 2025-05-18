'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Error component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('Terjadi kesalahan selama proses autentikasi');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setErrorMessage('Email atau kata sandi tidak valid');
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage('Email ini sudah terkait dengan akun lain');
          break;
        case 'EmailSignin':
          setErrorMessage('Gagal mengirim email verifikasi');
          break;
        case 'Verification':
          setErrorMessage('Tautan verifikasi tidak valid atau telah kedaluwarsa');
          break;
        case 'AccessDenied':
          setErrorMessage('Akses ditolak. Anda tidak memiliki izin untuk mengakses sumber daya ini');
          break;
        case 'Configuration':
          setErrorMessage('Terdapat masalah pada konfigurasi server');
          break;
        default:
          setErrorMessage('Terjadi kesalahan selama proses autentikasi');
          break;
      }
    }
  }, [searchParams]);

  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700">
      <div className="p-4 sm:p-7">
        <div className="text-center">
          <div className="mb-4 inline-flex justify-center items-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900">
            <svg className="w-6 h-6 text-red-600 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Kesalahan Autentikasi</h1>
          <p className="mt-3 text-gray-600 dark:text-neutral-400">
            {errorMessage}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link 
            href="/auth/signin" 
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700"
          >
            Kembali ke Halaman Masuk
          </Link>
          <Link 
            href="/" 
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
          >
            Ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function ErrorLoadingFallback() {
  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700">
      <div className="p-4 sm:p-7">
        <div className="text-center">
          <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Memuat...</h1>
          <p className="mt-3 text-gray-600 dark:text-neutral-400">
            Sedang memuat informasi kesalahan
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorLoadingFallback />}>
      <ErrorContent />
    </Suspense>
  );
} 