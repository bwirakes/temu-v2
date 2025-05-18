'use client';

import { ReactNode, useState } from 'react';
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
  // Add required state and functions to match JobPostingContextType
  const [data, setData] = useState<JobPostingData>(jobData);
  const [currentStep, setCurrentStep] = useState<number>(1);

  /**
   * Updates job posting form values
   */
  const updateFormValues = (values: Partial<JobPostingData>) => {
    setData(prevData => ({
      ...prevData,
      ...values
    }));
  };

  /**
   * Validates form data for a specific step (simplified version)
   * @returns Record of field errors
   */
  const getStepValidationErrors = (step: number): Record<string, string> => {
    // Simplified validation just to satisfy the interface
    return {};
  };

  return (
    <JobPostingContext.Provider value={{ 
      data, 
      updateFormValues, 
      getStepValidationErrors, 
      currentStep, 
      setCurrentStep 
    }}>
      {children}
    </JobPostingContext.Provider>
  );
} 