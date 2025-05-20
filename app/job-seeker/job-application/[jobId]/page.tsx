import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CustomSession } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import JobApplicationClientShell from './components/job-application-client-shell';
import { getJobApplicationPageData } from './actions';

// Define proper params interface
interface PageParams {
  params: Promise<{ jobId: string }>;
}

/**
 * Job Application Page - Server Component
 */
export default async function JobSeekerApplicationPage({ params }: PageParams) {
  // In Next.js 15, params must be awaited
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;
  
  // Get authentication
  const session = await auth() as CustomSession;
  
  // If not authenticated, redirect to sign-in
  if (!session?.user) {
    const callbackUrl = `/job-seeker/job-application/${jobId}`;
    return redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  // If wrong user type, show error
  if (session.user.userType !== 'job_seeker') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="mb-4">Anda harus masuk sebagai pencari kerja.</p>
        <Button asChild><Link href="/careers">Kembali</Link></Button>
      </div>
    );
  }
  
  try {
    // Get application data
    const { jobDetails, profileData } = await getJobApplicationPageData(jobId);
    
    // Format profile data
    const applicationProfileData = profileData ? {
      fullName: profileData.namaLengkap,
      email: profileData.email,
      phone: profileData.nomorTelepon,
      cvFileUrl: profileData.cvFileUrl || undefined,
      education: profileData.pendidikanTerakhir as any
    } : undefined;
    
    // Render application form
    return (
      <div className="bg-white">
        <div className="p-4 border-b">
          <Button variant="ghost" asChild>
            <Link href="/job-seeker/jobs">
              <ArrowLeft className="mr-2" /> Kembali
            </Link>
          </Button>
        </div>
        
        <JobApplicationClientShell 
          jobId={jobId}
          jobDetails={jobDetails as any}
          applicationProfileData={applicationProfileData}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading application:", error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-4">Terjadi kesalahan saat memuat aplikasi.</p>
        <Button asChild><Link href="/careers">Kembali</Link></Button>
      </div>
    );
  }
} 