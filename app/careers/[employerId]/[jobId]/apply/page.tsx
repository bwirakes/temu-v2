import { redirect } from 'next/navigation';

// Define proper param interface
interface PageParams {
  params: Promise<{ employerId: string; jobId: string }>;
}

/**
 * Career job application redirect page
 */
export default async function JobApplyPage({ params }: PageParams) {
  // In Next.js 15, await dynamic params before use
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;
  
  // Redirect to the job application page
  return redirect(`/job-seeker/job-application/${jobId}`);
} 
