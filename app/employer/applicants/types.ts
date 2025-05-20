export type ApplicationStatus = 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface ApplicantRow {
  applicationId: string;
  applicantName: string | null;
  applicantEmail: string | null;
  jobId: string;
  jobTitle: string | null;
  applicationDate: string; // ISO string from jobApplications.createdAt
  status: ApplicationStatus;
  cvFileUrl?: string | null;
} 