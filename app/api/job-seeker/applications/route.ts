import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  db, 
  getUserProfileByUserId,
  jobApplications,
  jobs,
  employers
} from "@/lib/db";
import { eq, desc } from "drizzle-orm";

// Export as dynamic to ensure the data is always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for API routes

export async function GET() {
  try {
    // Get the authenticated session
    const session = await auth();
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
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

    // Fetch all job applications for the current user
    const applicationsData = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        additionalNotes: jobApplications.additionalNotes,
        education: jobApplications.education,
        resumeUrl: jobApplications.resumeUrl,
        cvFileUrl: jobApplications.cvFileUrl,
        jobId: jobs.id,
        jobTitle: jobs.jobTitle,
        companyName: employers.namaPerusahaan
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .innerJoin(employers, eq(jobs.employerId, employers.id))
      .where(eq(jobApplications.applicantProfileId, userProfile.id))
      .orderBy(desc(jobApplications.id)); // Order by ID as a fallback since createdAt might not be available

    // Format the data for the frontend
    const formattedApplications = applicationsData.map((application) => {
      // Generate a reference code for each application
      const referenceCode = `JA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${application.id.substring(0, 6).toUpperCase()}`;
      
      return {
        id: application.id,
        jobPostingId: application.jobId,
        jobTitle: application.jobTitle,
        companyName: application.companyName,
        status: application.status,
        createdAt: new Date().toISOString(), // Use current date as a fallback
        updatedAt: new Date().toISOString(), // Use current date as a fallback
        education: application.education,
        additionalNotes: application.additionalNotes,
        resumeUrl: application.resumeUrl,
        cvFileUrl: application.cvFileUrl,
        referenceCode: referenceCode // Add the generated reference code
      };
    });

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
    });
  } catch (error) {
    console.error("[JOB_APPLICATIONS_GET]", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch applications",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
} 
