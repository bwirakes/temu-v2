export default function EmployerDetailLoader() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-4 w-36 bg-gray-200 rounded"></div>
      </div>
      
      {/* Company header skeleton */}
      <div className="notion-card mb-8 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-notion-border bg-notion-background-gray">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
            </div>
            
            <div className="flex-grow">
              <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-36 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mb-4"></div>
              
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Company stats skeleton */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-notion-background-gray rounded-notion">
                <div className="flex justify-center mb-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
                <div className="h-4 w-24 mx-auto bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-16 mx-auto bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Job listings skeleton */}
      <div className="mb-12">
        <div className="flex justify-between mb-6">
          <div className="h-6 w-36 bg-gray-200 rounded"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="notion-card overflow-hidden shadow-sm">
              <div className="p-6 border-b border-notion-border bg-notion-background-gray">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex">
                    <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
                    <div className="h-5 w-36 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-notion-border pt-4 flex justify-end">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 