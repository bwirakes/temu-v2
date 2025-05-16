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
 * Creates a new job posting for the specified employer (employer ID is handled server-side)
 *
 * @param jobData The job posting data
 * @returns The created job object
 * @throws Error if the API call fails
 */
export async function createJobPosting(jobData: Partial<JobPostingData>): Promise<CreateJobResponse> {
  try {
    // Prepare the request payload
    const payload = {
      jobTitle: jobData.jobTitle,
      contractType: jobData.contractType,
      minWorkExperience: jobData.minWorkExperience,
      salaryRange: jobData.salaryRange,
      applicationDeadline: jobData.applicationDeadline?.toISOString(),
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      description: jobData.description,
      numberOfPositions: jobData.numberOfPositions,
      workingHours: jobData.workingHours,
      expectations: jobData.expectations,
      additionalRequirements: jobData.additionalRequirements,
      isConfirmed: jobData.isConfirmed || false,
    };

    // Make the API call to the new endpoint
    const response = await fetch(`/api/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle non-success responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create job posting');
    }

    // Return the created job
    return await response.json();
  } catch (error) {
    console.error('Error creating job posting:', error);
    throw error;
  }
}

/**
 * Updates the confirmation status of a job posting
 * (This action might also need to be updated to remove employerId param
 * and rely on server-side auth/verification, depending on its API route)
 *
 * @param employerId The ID of the employer
 * @param jobId The ID of the job to update
 * @param isConfirmed Whether the job is confirmed
 * @returns The updated job object
 * @throws Error if the API call fails
 */
export async function confirmJobPosting(employerId: string, jobId: string, isConfirmed: boolean): Promise<CreateJobResponse> {
  try {
    const response = await fetch(`/api/employer/${employerId}/jobs/${jobId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isConfirmed }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update job confirmation status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error confirming job posting:', error);
    throw error;
  }
} 