"use client";

import { JobPostingData } from "@/lib/context/JobPostingContext";

/**
 * Interface for API response when creating a job
 */
interface CreateJobResponse {
  id: string;
  employerId: string;
  jobTitle: string;
  // Include other job fields as needed
  createdAt: string;
  updatedAt: string;
}

/**
 * Valid education levels for the lastEducation field
 */
const VALID_EDUCATION_LEVELS = [
  'SD', 'SMP', 'SMK', 'SMA', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'
];

/**
 * Creates a new job posting for the specified employer (employer ID is handled server-side)
 *
 * @param jobData The job posting data
 * @returns The created job object
 * @throws Error if the API call fails
 */
export async function createJobPosting(jobData: Partial<JobPostingData>): Promise<CreateJobResponse> {
  try {
    // Map education level values if needed (e.g., convert 'Diploma' to appropriate D1-D4 value)
    let lastEducation = jobData.lastEducation;
    if (lastEducation && !VALID_EDUCATION_LEVELS.includes(lastEducation)) {
      // Map common alternative terms to valid enum values
      if (lastEducation === 'Diploma') {
        lastEducation = 'D3'; // Default to D3 for general "Diploma" entries
      } else if (lastEducation === 'SMA/SMK') {
        lastEducation = 'SMA/SMK/Sederajat'; // Map to the new combined format
      }
    }

    // Process disability positions count to ensure it's always a valid number
    let numberOfDisabilityPositions = 0; // Default to 0
    
    // Only try to parse if there's actually a value
    if (jobData.additionalRequirements?.numberOfDisabilityPositions !== undefined && 
        jobData.additionalRequirements.numberOfDisabilityPositions !== null) {
      
      if (typeof jobData.additionalRequirements.numberOfDisabilityPositions === 'string') {
        const parsed = parseInt(jobData.additionalRequirements.numberOfDisabilityPositions, 10);
        numberOfDisabilityPositions = isNaN(parsed) ? 0 : parsed;
      } else if (typeof jobData.additionalRequirements.numberOfDisabilityPositions === 'number') {
        numberOfDisabilityPositions = jobData.additionalRequirements.numberOfDisabilityPositions;
      }
    }

    // Prepare the request payload ensuring all fields match the expected API schema
    const payload = {
      jobTitle: jobData.jobTitle,
      minWorkExperience: typeof jobData.minWorkExperience === 'string' 
        ? parseInt(jobData.minWorkExperience, 10) 
        : jobData.minWorkExperience,
      numberOfPositions: typeof jobData.numberOfPositions === 'string' 
        ? parseInt(jobData.numberOfPositions, 10) 
        : jobData.numberOfPositions,
      lastEducation: lastEducation,
      jurusan: jobData.jurusan || '', // Include jurusan field
      requiredCompetencies: jobData.requiredCompetencies || '', // Now a string instead of an array
      expectations: jobData.expectations || { ageRange: undefined },
      additionalRequirements: {
        gender: jobData.additionalRequirements?.gender || "ANY",
        // Always use an empty array instead of null for acceptedDisabilityTypes
        acceptedDisabilityTypes: jobData.additionalRequirements?.acceptedDisabilityTypes || [],
        // Use the pre-processed number value that is guaranteed to be a number
        numberOfDisabilityPositions: numberOfDisabilityPositions
      },
      isConfirmed: jobData.isConfirmed || false,
    };

    console.log('Sending job data to API:', payload);

    // Make the API call to the new endpoint
    const response = await fetch(`/api/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Parse response
    const responseData = await response.json();

    // Handle non-success responses
    if (!response.ok) {
      // Check if there are validation details to include
      const errorMessage = responseData.details 
        ? `${responseData.error}: ${JSON.stringify(responseData.details)}`
        : responseData.error || 'Failed to create job posting';
        
      throw new Error(errorMessage);
    }

    // Return the created job
    return responseData;
  } catch (error) {
    console.error('Error creating job posting:', error);
    throw error;
  }
}

/**
 * Updates the confirmation status of a job posting
 *
 * @param jobId The ID of the job to update
 * @param isConfirmed Whether the job is confirmed
 * @returns The updated job object
 * @throws Error if the API call fails
 */
export async function confirmJobPosting(jobId: string, isConfirmed: boolean): Promise<CreateJobResponse> {
  try {
    // Updated to use the correct API path based on the project structure
    const response = await fetch(`/api/employer/jobs/${jobId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isConfirmed }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.error || 'Failed to update job confirmation status';
      throw new Error(errorMessage);
    }

    return responseData.job;
  } catch (error) {
    console.error('Error confirming job posting:', error);
    throw error;
  }
} 