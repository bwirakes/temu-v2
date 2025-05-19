'use client';

import { ReactNode } from 'react';
// Removing the JobApplicationProvider import since we won't use it here
// The provider is already properly used in [jobId]/page.tsx

/**
 * Client component layout for the job application section.
 * Child components like [jobId]/page.tsx already provide the JobApplicationContext
 * with the required jobId parameter.
 */
export default function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="job-application-layout">
      {children}
    </div>
  );
} 