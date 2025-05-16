"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Type definition for job posting data
 */
export interface JobPostingData {
  jobId: string;
  jobTitle: string;
  company: string;
  location?: string;
  workLocations: {
    city: string;
    province: string;
    isRemote: boolean;
    address?: string;
  }[];
  contractType: string;
  salaryRange?: {
    min?: number;
    max?: number;
    isNegotiable: boolean;
  };
  minWorkExperience: number;
  applicationDeadline?: Date;
  requirements?: string[];
  responsibilities: string[];
  description?: string;
  postedDate?: Date;
  numberOfPositions?: number;
  workingHours?: string;
  // Add gender field
  gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
  // Add other requirement fields
  requiredDocuments?: string;
  specialSkills?: string;
  technologicalSkills?: string;
  // Add expectations field for job candidate expectations
  expectations?: {
    ageRange?: {
      min: number;
      max: number;
    };
    expectedCharacter?: string;
    foreignLanguage?: string;
  };
  // Add additional requirements fields
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    requiredDocuments?: string;
    specialSkills?: string;
    technologicalSkills?: string;
    suitableForDisability?: boolean;
  };
  // Flag to indicate if the job posting has been confirmed
  isConfirmed?: boolean;
  // Company information
  companyInfo?: {
    logo?: string;
    name: string;
    industry: string;
    address?: string;
    website?: string;
    socialMedia?: {
      linkedin?: string;
      instagram?: string;
      twitter?: string;
      facebook?: string;
    };
    description?: string;
  };
  // Add suitableForDisability field
  suitableForDisability?: boolean;
}

/**
 * Context interface
 */
interface JobPostingContextType {
  data: JobPostingData;
  updateFormValues: (values: Partial<JobPostingData> & { responsibilities?: string | string[] }) => void;
  getStepValidationErrors: (step: number) => Record<string, string>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

// Default context value
const defaultJobPostingData: JobPostingData = {
  jobId: '',
  jobTitle: '',
  company: '',
  contractType: '',
  minWorkExperience: 0,
  workLocations: [], // Initialize with empty array
  responsibilities: [],
  requirements: [],
  gender: "ANY", // Default to ANY
  requiredDocuments: '',
  specialSkills: '',
  technologicalSkills: '',
  expectations: {
    ageRange: {
      min: 18,
      max: 45
    },
    expectedCharacter: '',
    foreignLanguage: ''
  },
  additionalRequirements: {
    gender: "ANY",
    requiredDocuments: '',
    specialSkills: '',
    technologicalSkills: '',
    suitableForDisability: false
  },
  isConfirmed: false,
  suitableForDisability: false
};

/**
 * Provider component for JobPostingContext
 */
export const JobPostingProvider = ({ children }: { children: ReactNode }) => {
  // Initialize job data with at least one work location
  const initialJobData = {
    ...defaultJobPostingData,
    workLocations: defaultJobPostingData.workLocations.length 
      ? defaultJobPostingData.workLocations 
      : [{ city: '', province: '', isRemote: false, address: '' }]
  };
  
  const [jobData, setJobData] = useState<JobPostingData>(initialJobData);
  const [currentStep, setCurrentStep] = useState<number>(1); // Default to first step

  /**
   * Updates job posting form values
   */
  const updateFormValues = (values: Partial<JobPostingData> & { responsibilities?: string | string[] }) => {
    console.log('Updating form values:', values);
    
    const formattedValues = { ...values };

    // Handle responsibilities conversion if provided
    if (values.responsibilities !== undefined) {
      // If string, convert to array
      if (typeof values.responsibilities === 'string') {
        formattedValues.responsibilities = values.responsibilities
          .split('\n')
          .filter(item => item.trim() !== '');
        console.log('Converted responsibilities to array:', formattedValues.responsibilities);
      }
    }
    
    // Ensure workLocations is never empty if it's being updated
    if (formattedValues.workLocations && formattedValues.workLocations.length === 0) {
      formattedValues.workLocations = [{ city: '', province: '', isRemote: false, address: '' }];
    }

    // Type assertion since we've handled the string case
    setJobData(prevData => {
      const newData = {
        ...prevData,
        ...formattedValues as Partial<JobPostingData>
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
      
      if (!jobData.responsibilities || jobData.responsibilities.length === 0) {
        errors.responsibilities = 'Tugas dan tanggung jawab wajib diisi';
      }
      
      if (!jobData.workLocations || jobData.workLocations.length === 0) {
        errors.workLocations = 'Minimal satu lokasi kerja wajib diisi';
      } else {
        // Validate each location
        jobData.workLocations.forEach((location, index) => {
          if (!location.city || location.city.trim() === '') {
            errors[`workLocations[${index}].city`] = 'Kota wajib diisi';
          }
          
          if (!location.province || location.province.trim() === '') {
            errors[`workLocations[${index}].province`] = 'Provinsi wajib diisi';
          }
        });
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
      
      // Validate expected character
      if (!jobData.expectations?.expectedCharacter || jobData.expectations.expectedCharacter.trim() === '') {
        errors.expectedCharacter = 'Karakter yang diharapkan wajib diisi';
      }
      
      // Debug log
      console.log('Validating expectations:', jobData.expectations);
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