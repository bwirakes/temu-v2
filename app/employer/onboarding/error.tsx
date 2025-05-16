'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Onboarding error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Something went wrong
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            <p>
              We encountered an error while loading the onboarding page.
            </p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error details:</h3>
            <p className="mt-2 text-sm text-red-700">{error.message || 'An unexpected error occurred'}</p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={reset}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try again
            </button>
            
            <div className="text-center">
              <p className="text-sm">
                If the problem persists, please try to:
              </p>
              <ul className="list-disc pl-8 mt-2 text-sm text-gray-600 text-left">
                <li>Check if the database migrations have been applied</li>
                <li>Verify your database connection</li>
                <li>Check the server logs for more information</li>
              </ul>
            </div>
            
            <div className="flex justify-center pt-2">
              <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500">
                Return to home page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 