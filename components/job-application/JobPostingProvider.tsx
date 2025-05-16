'use client';

import { ReactNode } from 'react';
import { JobPostingContext, JobPostingData } from '@/lib/context/JobPostingContext';

interface JobPostingProviderProps {
  children: ReactNode;
  jobData: JobPostingData;
}

/**
 * Provider component for job posting data
 * This wraps the context around components that need access to job posting data
 */
export default function JobPostingProvider({ children, jobData }: JobPostingProviderProps) {
  return (
    <JobPostingContext.Provider value={{ data: jobData }}>
      {children}
    </JobPostingContext.Provider>
  );
} 