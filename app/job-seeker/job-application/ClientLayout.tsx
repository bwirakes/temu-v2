'use client';

import { ReactNode } from 'react';
import { JobApplicationProvider } from '@/lib/context/JobApplicationContext';
// If JobPostingContext is also needed for all pages in this segment:
// import { JobPostingProvider } from '@/lib/context/JobPostingContext';

/**
 * Client component layout for the job application section.
 * It provides the JobApplicationContext.
 * It relies on the global SessionProvider from app/layout.tsx.
 */
export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <JobApplicationProvider>
      {/* If JobPostingProvider is needed here: */}
      {/* <JobPostingProvider> */}
      {children}
      {/* </JobPostingProvider> */}
    </JobApplicationProvider>
  );
} 