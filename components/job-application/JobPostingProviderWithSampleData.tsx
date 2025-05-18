"use client";

import { ReactNode } from "react";
import { JobPostingContext, JobPostingData } from "@/lib/context/JobPostingContext";

// Sample data to display for the job application preview
const sampleJobData: JobPostingData = {
  jobId: 'JOB-SAMPLE123',
  jobTitle: "Senior Frontend Developer",
  minWorkExperience: 3,
  lastEducation: "S1",
  requiredCompetencies: ["React", "TypeScript", "CSS", "Git", "Testing"],
  numberOfPositions: 2,
  expectations: {
    ageRange: {
      min: 25,
      max: 40
    }
  },
  additionalRequirements: {
    gender: "ANY",
    acceptedDisabilityTypes: ["Penglihatan terbatas", "Tuli/sulit mendengar"],
    numberOfDisabilityPositions: 1
  },
  isConfirmed: true
};

/**
 * Sample job posting provider component for demo purposes
 * This wraps sample data with the JobPostingContext
 */
export default function JobPostingProviderWithSampleData({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <JobPostingContext.Provider 
      value={{
        data: sampleJobData,
        updateFormValues: () => {}, // No-op function since this is a sample
        getStepValidationErrors: () => ({}), // No-op function since this is a sample
        currentStep: 1,
        setCurrentStep: () => {} // No-op function since this is a sample
      }}
    >
      {children}
    </JobPostingContext.Provider>
  );
} 
