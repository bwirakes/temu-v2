import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { jobApplicationService } from '@/lib/services/JobApplicationService';

// Define the session type to match what's in lib/auth.ts
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

// GET endpoint to fetch all applications for a specific job
export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  try {
    // Check authentication
    const session = await auth() as CustomSession;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Only employers should be able to view all applications for a job
    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: "Only employers can view all applications for a job" },
        { status: 403 }
      );
    }
    
    const jobId = params.jobId;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // TODO: In a real app, verify the employer owns this job posting
    
    // Get all applications for the job using the service
    const applications = await jobApplicationService.getApplicationsByJobPosting(jobId);
    
    // Return the applications data, with limited information for security
    return NextResponse.json(
      { 
        success: true, 
        applications: applications.map(app => ({
          id: app.id,
          applicant: {
            fullName: app.applicant.fullName,
            email: app.applicant.email,
          },
          status: app.status,
          createdAt: app.createdAt,
        }))
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching job applications:', error);
    
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
} 