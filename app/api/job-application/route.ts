import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, jobApplications, getUserProfileByUserId } from '@/lib/db';

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
  education: z.enum(["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"]).optional(),
  additionalNotes: z.string().min(50, { message: "Additional notes must be at least 50 characters" })
    .max(2000, { message: "Additional notes must not exceed 2000 characters" }),
  resumeUrl: z.string().optional(),
  cvFileUrl: z.string().optional(),
});

/**
 * Generate a human-readable application reference code
 * Format: JA-{YEAR}{MONTH}{DAY}-{FIRST 6 CHARS OF UUID}
 */
function generateReferenceCode(id: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const shortId = id.substring(0, 6).toUpperCase();
  
  return `JA-${year}${month}${day}-${shortId}`;
}

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
    
    // Get user profile
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
    
    // Generate a unique ID for the application
    const applicationId = uuidv4();
    
    // Save the application to the database
    const [savedApplication] = await db
      .insert(jobApplications)
      .values({
        id: applicationId,
        applicantProfileId: userProfile.id,
        jobId: data.jobId,
        status: 'SUBMITTED',
        additionalNotes: data.additionalNotes,
        education: data.education || null,
        resumeUrl: data.resumeUrl || null,
        cvFileUrl: data.cvFileUrl || null,
      })
      .returning();
    
    console.log("Application saved to database:", savedApplication);
    
    // Generate a reference code
    const referenceCode = generateReferenceCode(applicationId);
    
    // Revalidate the job detail pages to update applicant counts
    revalidatePath(`/employer/jobs/${data.jobId}`);
    revalidatePath(`/job-detail/${data.jobId}`);
    revalidatePath(`/job-seeker/applications`);
    
    // Return success response with the application data and reference code
    return NextResponse.json(
      { 
        success: true, 
        application: {
          id: savedApplication.id,
          jobPostingId: savedApplication.jobId,
          status: savedApplication.status,
          createdAt: new Date(),
        },
        referenceCode,
        revalidated: true
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error submitting job application:', error);
    
    return NextResponse.json(
      { error: "Failed to submit application", message: error instanceof Error ? error.message : "Unknown error" },
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