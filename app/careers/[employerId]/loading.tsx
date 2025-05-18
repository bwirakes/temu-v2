import { Skeleton } from '@/components/ui/skeleton';

export default function EmployerDetailLoading() {
  return (
    <div className="bg-notion-background min-h-screen">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      <div className="notion-container py-12 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back button skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-36" />
        </div>
        
        {/* Company header skeleton */}
        <div className="notion-card mb-8 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-notion" />
              
              <div className="text-center md:text-left flex-grow">
                <Skeleton className="h-8 w-64 mb-2 mx-auto md:mx-0" />
                <Skeleton className="h-6 w-48 mb-2 mx-auto md:mx-0" />
                <Skeleton className="h-6 w-40 mb-4 mx-auto md:mx-0" />
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Company stats */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-notion-background-gray rounded-notion">
                  <Skeleton className="h-6 w-6 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-6 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Job listings skeleton */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <Skeleton className="h-6 w-48 mb-2 sm:mb-0" />
            <Skeleton className="h-6 w-36" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="notion-card overflow-hidden shadow-sm animate-pulse">
                <div className="p-6 border-b border-notion-border bg-notion-background-gray">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  
                  <div className="mt-4 border-t border-notion-border pt-4 flex justify-end">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 