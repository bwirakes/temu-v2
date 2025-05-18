import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  db, 
  getUserProfileByUserId,
  jobApplications,
  jobs,
  employers
} from "@/lib/db";
import { eq, and } from "drizzle-orm";

// Export as dynamic to ensure the data is always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for API routes

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const applicationId = params.id;
    
    // Get the authenticated session
    const session = await auth();
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Check user type for additional security
    const userType = (session.user as any).userType;
    if (userType !== 'job_seeker') {
      return NextResponse.json(
        { error: "Unauthorized", code: "INVALID_USER_TYPE" },
        { status: 403 }
      );
    }

    // Get user profile
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Fetch the specific job application
    const [applicationData] = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        additionalNotes: jobApplications.additionalNotes,
        education: jobApplications.education,
        resumeUrl: jobApplications.resumeUrl,
        jobId: jobs.id,
        jobTitle: jobs.jobTitle,
        companyName: employers.namaPerusahaan
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .where(
        and(
          eq(jobApplications.id, applicationId),
          eq(jobApplications.applicantProfileId, userProfile.id)
        )
      );

    if (!applicationData) {
      return NextResponse.json(
        { error: "Application not found", code: "APPLICATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Generate a reference code based on the application ID
    const referenceCode = `JA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${applicationData.id.substring(0, 6).toUpperCase()}`;

    // Format the application data
    const formattedApplication = {
      id: applicationData.id,
      jobPostingId: applicationData.jobId,
      jobTitle: applicationData.jobTitle,
      companyName: applicationData.companyName,
      status: applicationData.status,
      createdAt: new Date().toISOString(), // Default to current date
      updatedAt: new Date().toISOString(), // Default to current date
      education: applicationData.education,
      additionalNotes: applicationData.additionalNotes,
      cvFileUrl: applicationData.resumeUrl,
      referenceCode: referenceCode // Add a generated reference code
    };

    return NextResponse.json({
      success: true,
      application: formattedApplication,
    });
  } catch (error) {
    console.error("[JOB_APPLICATION_GET]", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch application details",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
} 