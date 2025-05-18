import { Skeleton } from '@/components/ui/skeleton';

export default function JobDetailSkeleton() {
  return (
    <div className="bg-notion-background min-h-screen">
      <div className="notion-container max-w-4xl mx-auto py-8">
        {/* Back button skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-48" />
        </div>
        
        {/* Job header skeleton */}
        <div className="notion-card mb-8 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-grow">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-4" />
              
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-24 rounded-notion" />
                  <Skeleton className="h-6 w-32 rounded-notion" />
                  <Skeleton className="h-6 w-40 rounded-notion" />
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Skeleton className="w-24 h-24 rounded-notion" />
              </div>
            </div>
          </div>
              
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
            </div>
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