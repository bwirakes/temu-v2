'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('An error occurred during authentication');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setErrorMessage('Invalid email or password');
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage('This email is already associated with another account');
          break;
        case 'EmailSignin':
          setErrorMessage('Failed to send verification email');
          break;
        case 'Verification':
          setErrorMessage('The verification link is invalid or has expired');
          break;
        case 'AccessDenied':
          setErrorMessage('Access denied. You do not have permission to access this resource');
          break;
        case 'Configuration':
          setErrorMessage('There is a problem with the server configuration');
          break;
        default:
          setErrorMessage('An error occurred during authentication');
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
          <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Authentication Error</h1>
          <p className="mt-3 text-gray-600 dark:text-neutral-400">
            {errorMessage}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link 
            href="/auth/signin" 
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700"
          >
            Back to Sign In
          </Link>
          <Link 
            href="/" 
            className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 