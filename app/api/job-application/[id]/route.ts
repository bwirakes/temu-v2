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

// GET endpoint to fetch a specific application by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    
    const applicationId = await params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }
    
    // Get the application using the service
    const application = await jobApplicationService.getApplicationById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this application
    // In a real application, we would have a field linking the application to the user ID
    // For now, we'll use a simplified approach
    let isOwner = false;
    
    // In production, this would be a proper database check
    // Here we just check if the applicant email matches the user's email
    if (application.applicant && application.applicant.email === session.user.email) {
      isOwner = true;
    }
    
    const isEmployer = session.user.userType === 'employer';
    
    if (!isOwner && !isEmployer) {
      return NextResponse.json(
        { error: "You don't have permission to access this application" },
        { status: 403 }
      );
    }
    
    // Return the application data
    return NextResponse.json(
      { 
        success: true, 
        application: {
          id: application.id,
          jobPostingId: application.jobPostingId,
          applicant: {
            fullName: application.applicant.fullName,
            email: application.applicant.email,
            phone: application.applicant.phone,
            // Include other non-sensitive fields
          },
          status: application.status,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching job application:', error);
    
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update application status
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    
    // Only employers should be able to update application status
    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: "Only employers can update application status" },
        { status: 403 }
      );
    }
    
    const applicationId = await params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    // Update the application status using the service
    const updatedApplication = await jobApplicationService.updateApplicationStatus(
      applicationId,
      status
    );
    
    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    
    // Return the updated application data
    return NextResponse.json(
      { 
        success: true, 
        application: {
          id: updatedApplication.id,
          status: updatedApplication.status,
          updatedAt: updatedApplication.updatedAt,
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating job application:', error);
    
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
} 