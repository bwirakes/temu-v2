import { Skeleton } from '@/components/ui/skeleton';

export default function JobDetailLoading() {
  return (
    <div className="min-h-screen bg-notion-background">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      <div className="notion-container py-12 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back button skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-36" />
        </div>
        
        {/* Job header skeleton */}
        <div className="notion-card mb-8 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="w-full">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <Skeleton className="w-24 h-24 rounded-notion" />
            </div>
          </div>
          
          <div className="p-6">
            <Skeleton className="h-6 w-full" />
          </div>
          
          <div className="border-t border-notion-border p-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        {/* Job details skeleton */}
        <div className="notion-card mb-8">
          <div className="p-6 border-b border-notion-border">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <div className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        
        {/* Company info skeleton */}
        <div className="notion-card">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <Skeleton className="h-6 w-48 mb-4" />
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-notion" />
              
              <div className="flex-grow space-y-4">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 