import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

interface RevalidateRequest {
  employerId?: string;
  jobId?: string;
}

// Define the custom session type to match what's in lib/auth.ts
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

/**
 * API endpoint for revalidating job listing pages
 * This can be called when job data changes to refresh the static pages
 */
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to revalidate pages' },
        { status: 401 }
      );
    }

    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Forbidden: Only employers can revalidate job pages' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body: RevalidateRequest = await req.json();
    
    // Revalidate specific paths based on provided data
    if (body.jobId) {
      // Revalidate the specific job detail page
      revalidatePath(`/employer/jobs/${body.jobId}`);
      // Also revalidate the public job detail page
      revalidatePath(`/job-detail/${body.jobId}`);
    }
    
    if (body.employerId) {
      // Revalidate all job listings for this employer
      revalidatePath('/employer/jobs');
      // Also revalidate the employer's public jobs page
      revalidatePath(`/careers/${body.employerId}`);
    } else {
      // If no employerId is provided, revalidate all job listings
      revalidatePath('/employer/jobs');
    }
    
    return NextResponse.json({ 
      revalidated: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error revalidating pages:", error);
    return NextResponse.json(
      { error: "Failed to revalidate pages" },
      { status: 500 }
    );
  }
} 