import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { 
  db, 
  jobApplications, 
  jobs,
  employers, 
  getUserProfileByUserId 
} from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { CustomSession } from "@/lib/types";

import DashboardClient from "@/components/job-seeker-dashboard/DashboardClient";
import DashboardSkeleton from "@/components/job-seeker-dashboard/DashboardSkeleton";

// Define the type for job application data
interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  status: string;
  date: string;
}

// Maximum number of recent applications to fetch
const MAX_RECENT_APPLICATIONS = 5;

export default async function JobSeekerDashboard() {
  // Server-side auth check
  const session = await auth() as CustomSession;
  
  // If not authenticated, redirect to login with callback
  if (!session?.user) {
    const callbackUrl = encodeURIComponent("/job-seeker/dashboard");
    redirect(`/auth/signin?callbackUrl=${callbackUrl}`);
  }
  
  // If not a job seeker, redirect to home
  if (session.user.userType !== 'job_seeker') {
    redirect('/');
  }
  
  // Get user profile for username
  const userId = session.user.id;
  if (!userId) {
    redirect('/auth/signin');
  }
  
  const userProfile = await getUserProfileByUserId(userId);
  const userName = userProfile?.namaLengkap || session.user.name || "Pencari Kerja";
  
  // Fetch recent job applications with job and employer details
  let recentApplications: JobApplication[] = [];
  
  try {
    if (userProfile) {
      // Use SQL expressions for date fields that might not exist directly on the table
      const applications = await db
        .select({
          id: jobApplications.id,
          jobTitle: jobs.jobTitle,
          companyName: employers.namaPerusahaan,
          status: jobApplications.status,
          // Use postedDate as fallback since createdAt might not exist
          date: jobs.postedDate,
        })
        .from(jobApplications)
        .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
        .innerJoin(employers, eq(jobs.employerId, employers.id))
        .where(eq(jobApplications.applicantProfileId, userProfile.id))
        .orderBy(desc(jobs.postedDate))
        .limit(MAX_RECENT_APPLICATIONS);
      
      // Format dates for display
      recentApplications = applications.map(app => ({
        ...app,
        date: app.date ? format(new Date(app.date), 'yyyy-MM-dd') : ''
      }));
    }
  } catch (error) {
    console.error("Error fetching recent applications:", error);
    // Continue with empty applications list on error
  }
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient 
        userName={userName} 
        initialRecentApplications={recentApplications} 
      />
    </Suspense>
  );
} 