import { redirect } from 'next/navigation';

// Define interface for params
interface PageParams {
  params: Promise<{ jobId: string }>;
}

/**
 * Job application redirect - handles dynamic params with await pattern
 */
export default async function JobApplicationRedirectPage({ params }: PageParams) {
  // In Next.js 15, dynamic params must be awaited before use
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;
  
  // Redirect to the job seeker application page
  return redirect(`/job-seeker/job-application/${jobId}`);
} 