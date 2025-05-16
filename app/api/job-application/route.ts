import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { jobApplicationService } from '@/lib/services/JobApplicationService';
import { z } from 'zod';

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

// Define the validation schema for job applications
const applicationSchema = z.object({
  jobId: z.string().min(1, { message: "Job ID is required" }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  coverLetter: z.string().optional(),
  education: z.enum(["SMA", "Diploma", "S1", "S2", "S3"]).optional(),
  additionalNotes: z.string().optional(),
  resumeUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth() as CustomSession;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Verify user is a job seeker
    if (session.user.userType !== 'job_seeker') {
      return NextResponse.json(
        { error: "Only job seekers can submit applications" },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data
    const validationResult = applicationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid application data", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Create applicant data object
    const applicantData = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      coverLetter: data.coverLetter,
      resumeUrl: data.resumeUrl,
    };
    
    // Submit the application using the service
    const { application, referenceCode } = await jobApplicationService.submitApplication(
      data.jobId,
      applicantData
    );
    
    // Return success response with the application data and reference code
    return NextResponse.json(
      { 
        success: true, 
        application: {
          id: application.id,
          jobPostingId: application.jobPostingId,
          status: application.status,
          createdAt: application.createdAt,
        },
        referenceCode 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error submitting job application:', error);
    
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all applications for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth() as CustomSession;
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // In a real app, we would fetch applications based on user ID or email
    // For job seekers: their own applications
    // For employers: applications for their job postings
    
    if (session.user.userType === 'job_seeker') {
      // Mock response for job seekers
      return NextResponse.json(
        { 
          success: true,
          message: "This endpoint would return the job seeker's applications",
          applications: []
        },
        { status: 200 }
      );
    } else if (session.user.userType === 'employer') {
      // Mock response for employers
      return NextResponse.json(
        { 
          success: true,
          message: "This endpoint would return applications for the employer's job postings",
          applications: []
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Unknown user type" },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching job applications:', error);
    
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
} 