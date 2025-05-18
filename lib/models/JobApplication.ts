import { v4 as uuidv4 } from 'uuid';

export interface JobApplicant {
  fullName: string;
  email: string;
  phone: string;
  additionalNotes?: string;
  education?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3";
  resumeUrl?: string;
  cvFileUrl?: string; // URL to the job seeker's CV file
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  applicant: JobApplicant;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus = 
  | 'SUBMITTED'  // Initial state when application is first submitted
  | 'REVIEWING'  // Application is being reviewed by HR/hiring manager
  | 'INTERVIEW'  // Applicant has been selected for interview
  | 'OFFERED'    // Job offer has been extended
  | 'ACCEPTED'   // Applicant has accepted the offer
  | 'REJECTED'   // Application has been rejected
  | 'WITHDRAWN'; // Applicant has withdrawn their application

export class JobApplicationManager {
  /**
   * Creates a new job application with a unique ID
   */
  static createApplication(jobPostingId: string, applicant: JobApplicant): JobApplication {
    const now = new Date();
    
    return {
      id: uuidv4(),
      jobPostingId,
      applicant,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Updates the status of an application
   */
  static updateStatus(application: JobApplication, status: ApplicationStatus): JobApplication {
    return {
      ...application,
      status,
      updatedAt: new Date()
    };
  }
  
  /**
   * Generates a human-readable application reference code
   * Format: JA-{YEAR}{MONTH}{DAY}-{FIRST 6 CHARS OF UUID}
   */
  static generateReferenceCode(application: JobApplication): string {
    const date = application.createdAt;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const shortId = application.id.substring(0, 6).toUpperCase();
    
    return `JA-${year}${month}${day}-${shortId}`;
  }
} 