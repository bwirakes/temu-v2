import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

// Import server action
import { getJobApplicationPageData, JobDetails, JobSeekerProfileData } from './actions';

// Import the client shell component
import JobApplicationClientShell from './components/job-application-client-shell';

// Use proper type definition for the page component with Promise<params>
export default async function JobSeekerApplicationPage({ 
  params 
}: { 
  params: Promise<{ jobId: string }> 
}) {
  const resolvedParams = await params;
  const { jobId } = resolvedParams;
  
  // Use the server action to fetch all necessary data
  // This will handle authentication, profile checks, and redirects as needed
  // If getJobApplicationPageData() calls notFound(), it will automatically propagate up
  const { jobDetails, profileData } = await getJobApplicationPageData(jobId);
  
  // Prepare profile data for the JobApplicationProvider
  const applicationProfileData = profileData ? {
    fullName: profileData.namaLengkap,
    email: profileData.email,
    phone: profileData.nomorTelepon,
    cvFileUrl: profileData.cvFileUrl || undefined,
    education: profileData.pendidikanTerakhir as "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | undefined
  } : undefined;
  
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="w-full">
        {/* Back button in top-left */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <Button variant="ghost" asChild className="p-2 -ml-2">
            <Link href="/job-seeker/jobs">
              <ArrowLeft className="h-5 w-5" />
              <span className="ml-1">Kembali</span>
            </Link>
          </Button>
        </div>
        
        {/* Client-side component with all the necessary data */}
        <JobApplicationClientShell 
          jobId={jobId}
          jobDetails={jobDetails}
          applicationProfileData={applicationProfileData}
        />
      </div>
    </div>
  );
} 