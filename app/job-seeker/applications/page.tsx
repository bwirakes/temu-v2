import { Suspense } from "react";
import { getJobApplications } from "./actions";
import ApplicationsClient from "@/components/job-seeker/applications/ApplicationsClient";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Mark this page as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

// Define the ApplicationsSkeleton component in-place
function ApplicationsSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="-m-1.5 overflow-x-auto">
        <div className="p-1.5 min-w-full inline-block align-middle">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header Skeleton */}
            <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-10 w-[150px]" />
              </div>
            </div>
            
            {/* Loading Content */}
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Memuat data lamaran...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function JobApplicationsPage() {
  // Fetch applications using the server action
  // This handles auth, authorization, and data fetching
  const initialApplications = await getJobApplications();
  
  return (
    <div className="max-w-[85rem] mx-auto space-y-6 px-4 sm:px-6 py-6 md:py-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lamaran Saya</h1>
        <p className="text-gray-500">Pantau dan kelola lamaran kerja Anda</p>
      </div>
      
      <Suspense fallback={<ApplicationsSkeleton />}>
        <ApplicationsClient initialApplications={initialApplications} />
      </Suspense>
    </div>
  );
}