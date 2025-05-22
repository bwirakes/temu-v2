import { Suspense } from 'react';
import JobsView from './components/jobs-view';
import JobsLoader from './components/jobs-loader';

// Define the correct props type for the page component
interface JobsPageProps {
  params?: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ q?: string; [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  // No need to await searchParams here as we're not using it directly
  // The client component JobsView uses useSearchParams() hook instead
  
  return (
    <Suspense fallback={<JobsLoader />}>
      <JobsView />
    </Suspense>
  );
} 