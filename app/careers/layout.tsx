import { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Careers - Find Your Next Job Opportunity',
  description: 'Browse job opportunities from top employers.',
};

export default function CareersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Temu</span>
              </Link>
              <nav className="ml-6 flex space-x-8">
                <Link 
                  href="/careers" 
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Job Listings
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Link
                href="/job-seeker/register"
                className="ml-8 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Register as Job Seeker
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Temu. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 