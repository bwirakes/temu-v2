import { JobApplicant, JobApplication, JobApplicationManager } from '../models/JobApplication';

// Client-side service that uses API calls instead of direct database access
class JobApplicationService {
  private applications: JobApplication[] = [];

  /**
   * Submit a new job application via API
   * This is the main method that should be used from client components
   */
  async submitApplication(
    jobPostingId: string, 
    applicantData: JobApplicant
  ): Promise<{ application: JobApplication; referenceCode: string }> {
    try {
      // Use the API to submit the application
      const response = await fetch('/api/job-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobPostingId,
          ...applicantData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();
      
      // Create a proper JobApplication object from the API response
      const application: JobApplication = {
        id: result.application.id,
        jobPostingId: result.application.jobPostingId || jobPostingId,
        applicant: applicantData,
        status: result.application.status || 'SUBMITTED',
        createdAt: new Date(result.application.createdAt || new Date()),
        updatedAt: new Date(result.application.createdAt || new Date())
      };
      
      // Store in memory for compatibility with other methods
      this.applications.push(application);
      
      return { 
        application, 
        referenceCode: result.referenceCode 
      };
    } catch (error) {
      console.error("Error submitting job application:", error);
      throw error;
    }
  }

  /**
   * Save application via API
   * This method is kept for backward compatibility
   */
  async saveApplicationViaAPI(
    jobId: string,
    applicantData: Omit<JobApplicant, 'userId'>
  ): Promise<{ application: Partial<JobApplication>; referenceCode: string }> {
    try {
      // Use the submitApplication method which now uses the API
      const result = await this.submitApplication(jobId, applicantData);
      
      return {
        application: {
          id: result.application.id,
          jobPostingId: result.application.jobPostingId,
          status: result.application.status,
          createdAt: result.application.createdAt,
        },
        referenceCode: result.referenceCode,
      };
    } catch (error) {
      console.error('Error saving application via API:', error);
      throw error;
    }
  }

  /**
   * Get an application by ID
   */
  async getApplicationById(id: string): Promise<JobApplication | null> {
    try {
      // Try to get from API first
      const response = await fetch(`/api/job-application/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.application;
      }
      
      // Fall back to in-memory store if API fails
      const application = this.applications.find(app => app.id === id);
      return application || null;
    } catch (error) {
      console.error('Error getting application:', error);
      
      // Fall back to in-memory store if API fails
      const application = this.applications.find(app => app.id === id);
      return application || null;
    }
  }

  /**
   * Get applications by job posting ID
   */
  async getApplicationsByJobPosting(jobPostingId: string): Promise<JobApplication[]> {
    try {
      // Try to get from API first
      const response = await fetch(`/api/job-application/job/${jobPostingId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.applications;
      }
      
      // Fall back to in-memory store if API fails
      return this.applications.filter(app => app.jobPostingId === jobPostingId);
    } catch (error) {
      console.error('Error getting applications:', error);
      
      // Fall back to in-memory store if API fails
      return this.applications.filter(app => app.jobPostingId === jobPostingId);
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string, 
    status: JobApplication['status']
  ): Promise<JobApplication | null> {
    try {
      // Use API to update status
      const response = await fetch(`/api/job-application/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      const result = await response.json();
      
      // Update in-memory store
      const index = this.applications.findIndex(app => app.id === applicationId);
      if (index !== -1) {
        this.applications[index] = {
          ...this.applications[index],
          status,
          updatedAt: new Date()
        };
      }
      
      return result.application;
    } catch (error) {
      console.error('Error updating application status:', error);
      
      // Fall back to in-memory update
      const index = this.applications.findIndex(app => app.id === applicationId);
      if (index === -1) {
        return null;
      }
      
      const updatedApplication = {
        ...this.applications[index],
        status,
        updatedAt: new Date()
      };
      
      this.applications[index] = updatedApplication;
      return updatedApplication;
    }
  }
}

// Export a singleton instance
export const jobApplicationService = new JobApplicationService(); 