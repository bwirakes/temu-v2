"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Type definition for job posting data
 */
export interface JobPostingData {
  jobId: string;
  jobTitle: string;
  contractType: string;
  minWorkExperience: number;
  lastEducation?: string;
  requiredCompetencies?: string[];
  numberOfPositions?: number;
  expectations?: {
    ageRange?: {
      min: number | undefined;
      max: number | undefined;
    };
  };
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL" | undefined;
    acceptedDisabilityTypes?: string[];
    numberOfDisabilityPositions?: number | null;
  };
  // Flag to indicate if the job posting has been confirmed
  isConfirmed?: boolean;
}

/**
 * Context interface
 */
interface JobPostingContextType {
  data: JobPostingData;
  updateFormValues: (values: Partial<JobPostingData>) => void;
  getStepValidationErrors: (step: number) => Record<string, string>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

// Default context value
const defaultJobPostingData: JobPostingData = {
  jobId: '',
  jobTitle: '',
  contractType: '',
  minWorkExperience: 0,
  lastEducation: '',
  requiredCompetencies: [],
  numberOfPositions: 0,
  expectations: {
    ageRange: {
      min: 18,
      max: 45
    }
  },
  additionalRequirements: {
    gender: "ANY",
    acceptedDisabilityTypes: [],
    numberOfDisabilityPositions: null
  },
  isConfirmed: false
};

/**
 * Provider component for JobPostingContext
 */
export const JobPostingProvider = ({ children }: { children: ReactNode }) => {
  const [jobData, setJobData] = useState<JobPostingData>(defaultJobPostingData);
  const [currentStep, setCurrentStep] = useState<number>(1); // Default to first step

  /**
   * Updates job posting form values
   */
  const updateFormValues = (values: Partial<JobPostingData>) => {
    console.log('Updating form values:', values);
    
    setJobData(prevData => {
      const newData = {
        ...prevData,
        ...values
      };
      console.log('New job data:', newData);
      return newData;
    });
  };

  /**
   * Validates form data for a specific step
   * @returns Record of field errors
   */
  const getStepValidationErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Different validation based on step
    if (step === 1) {
      // Basic info validation
      if (!jobData.jobTitle || jobData.jobTitle.trim() === '') {
        errors.jobTitle = 'Jenis pekerjaan wajib diisi';
      }
      
      if (!jobData.numberOfPositions || jobData.numberOfPositions < 1) {
        errors.numberOfPositions = 'Jumlah tenaga kerja wajib diisi';
      }
    }
    
    // Step 2 validation (requirements form)
    if (step === 2) {
      // Validate gender
      if (!jobData.additionalRequirements?.gender) {
        errors.gender = 'Jenis kelamin wajib diisi';
      }
      
      // Validate lastEducation
      if (!jobData.lastEducation || jobData.lastEducation.trim() === '') {
        errors.lastEducation = 'Pendidikan terakhir wajib diisi';
      }
    }
    
    // Add validation for step 3 (expectations form)
    if (step === 3) {
      // Validate age range
      if (!jobData.expectations?.ageRange) {
        errors.ageRange = 'Harapan umur wajib diisi';
      } else {
        const { min, max } = jobData.expectations.ageRange;
        if (!min || min < 15) {
          errors.ageRange = 'Umur minimal tidak valid (minimal 15 tahun)';
        } else if (!max || max < min) {
          errors.ageRange = 'Umur maksimal harus lebih besar dari umur minimal';
        }
      }
    }
    
    // Add validation for step 4 (additional info form)
    if (step === 4) {
      // Validate disability-related fields if relevant
      const hasDisabilityPositions = jobData.additionalRequirements?.numberOfDisabilityPositions && 
                                    jobData.additionalRequirements.numberOfDisabilityPositions > 0;
      
      if (hasDisabilityPositions) {
        if (!jobData.additionalRequirements?.acceptedDisabilityTypes || 
            jobData.additionalRequirements.acceptedDisabilityTypes.length === 0) {
          errors.acceptedDisabilityTypes = 'Pilih minimal satu jenis disabilitas';
        }
      }
    }
    
    return errors;
  };

  return (
    <JobPostingContext.Provider 
      value={{
        data: jobData,
        updateFormValues,
        getStepValidationErrors,
        currentStep,
        setCurrentStep
      }}
    >
      {children}
    </JobPostingContext.Provider>
  );
};

// Create context with default value
export const JobPostingContext = createContext<JobPostingContextType>({
  data: defaultJobPostingData,
  updateFormValues: () => {},
  getStepValidationErrors: () => ({}),
  currentStep: 1,
  setCurrentStep: () => {}
});

/**
 * Hook for consuming the JobPosting context
 */
export const useJobPosting = () => useContext(JobPostingContext); 