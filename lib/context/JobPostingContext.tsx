"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { MinWorkExperienceEnum, LokasiKerjaEnum } from '@/lib/constants';

/**
 * Type definition for job posting data
 */
export interface JobPostingData {
  jobId: string;
  jobTitle: string;
  minWorkExperience: MinWorkExperienceEnum;
  lastEducation?: string;
  jurusan?: string;
  requiredCompetencies?: string;
  numberOfPositions?: number;
  lokasiKerja?: string;
  expectations?: {
    ageRange?: {
      min: number | undefined;
      max: number | undefined;
    };
  };
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL" | undefined;
    acceptedDisabilityTypes?: string[] | null;
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
  minWorkExperience: 'LULUSAN_BARU',
  lastEducation: '',
  jurusan: '',
  requiredCompetencies: '',
  numberOfPositions: 0,
  lokasiKerja: undefined,
  expectations: {
    ageRange: {
      min: 18,
      max: 45
    }
  },
  additionalRequirements: {
    gender: "ANY",
    acceptedDisabilityTypes: null,
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
      // Ensure number values are properly parsed from form inputs
      const processedValues = { ...values };
      
      // Handle number conversions
      if (typeof values.numberOfPositions === 'string') {
        processedValues.numberOfPositions = parseInt(values.numberOfPositions, 10);
      }
      
      // Handle nested number conversions
      if (values.expectations?.ageRange) {
        const ageRange = { ...values.expectations.ageRange };
        
        if (typeof ageRange.min === 'string') {
          ageRange.min = parseInt(ageRange.min, 10);
        }
        
        if (typeof ageRange.max === 'string') {
          ageRange.max = parseInt(ageRange.max, 10);
        }
        
        processedValues.expectations = {
          ...values.expectations,
          ageRange
        };
      }
      
      if (values.additionalRequirements?.numberOfDisabilityPositions && 
          typeof values.additionalRequirements.numberOfDisabilityPositions === 'string') {
        processedValues.additionalRequirements = {
          ...values.additionalRequirements,
          numberOfDisabilityPositions: parseInt(values.additionalRequirements.numberOfDisabilityPositions, 10)
        };
      }
      
      const newData = {
        ...prevData,
        ...processedValues
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
      // Disability fields are now optional, so we only validate if the user has explicitly 
      // indicated they want to provide positions for people with disabilities
      const hasDisabilityPositions = 
        jobData.additionalRequirements?.numberOfDisabilityPositions !== null &&
        jobData.additionalRequirements?.numberOfDisabilityPositions !== undefined &&
        jobData.additionalRequirements.numberOfDisabilityPositions > 0;
      
      if (hasDisabilityPositions) {
        // Only validate disability types if positions are specified
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