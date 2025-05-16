import { JobApplicant, JobApplication, JobApplicationManager } from '../models/JobApplication';

// In a real application, this would be a database or API service
// For now, we'll use an in-memory store
class JobApplicationService {
  private applications: JobApplication[] = [];

  /**
   * Submit a new job application
   */
  async submitApplication(
    jobPostingId: string, 
    applicantData: JobApplicant
  ): Promise<{ application: JobApplication; referenceCode: string }> {
    // Create a new application with a unique ID
    const application = JobApplicationManager.createApplication(jobPostingId, applicantData);
    
    // Generate a reference code for the applicant
    const referenceCode = JobApplicationManager.generateReferenceCode(application);
    
    // In a real application, this would save to a database
    this.applications.push(application);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { application, referenceCode };
  }

  /**
   * Save application via API
   * This method can be used from client components to submit applications
   */
  async saveApplicationViaAPI(
    jobId: string,
    applicantData: Omit<JobApplicant, 'userId'>
  ): Promise<{ application: Partial<JobApplication>; referenceCode: string }> {
    try {
      const response = await fetch('/api/job-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          ...applicantData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save application');
      }

      const result = await response.json();
      return {
        application: result.application,
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
    // In a real application, this would query a database
    const application = this.applications.find(app => app.id === id);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return application || null;
  }

  /**
   * Get applications by job posting ID
   */
  async getApplicationsByJobPosting(jobPostingId: string): Promise<JobApplication[]> {
    // In a real application, this would query a database
    const applications = this.applications.filter(app => app.jobPostingId === jobPostingId);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return applications;
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string, 
    status: JobApplication['status']
  ): Promise<JobApplication | null> {
    // Find the application
    const index = this.applications.findIndex(app => app.id === applicationId);
    
    if (index === -1) {
      return null;
    }
    
    // Update the application
    const updatedApplication = JobApplicationManager.updateStatus(
      this.applications[index], 
      status
    );
    
    // Save the updated application
    this.applications[index] = updatedApplication;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return updatedApplication;
  }
}

// Export a singleton instance
export const jobApplicationService = new JobApplicationService(); 