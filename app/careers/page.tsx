import { Suspense } from 'react';
import CareersView from './components/careers-view';
import CareersLoader from './components/careers-loader';

// Define the correct props type for the page component
interface CareersPageProps {
  params?: Promise<{ [key: string]: string }>;
  searchParams?: Promise<{ q?: string; limit?: string; [key: string]: string | string[] | undefined }>;
}

export default async function CareersPage({ searchParams }: CareersPageProps) {
  // No need to await searchParams here as we're not using it directly
  // The client component CareersView uses useSearchParams() hook instead
  
  return (
    <Suspense fallback={<CareersLoader />}>
      <CareersView />
    </Suspense>
  );
} 