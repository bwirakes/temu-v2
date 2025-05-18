export default function JobDetailLoader() {
  return (
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="h-4 w-36 bg-gray-200 rounded"></div>
      </div>
      
      {/* Job header skeleton */}
      <div className="notion-card mb-8 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-notion-border bg-notion-background-gray">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Apply button skeleton */}
        <div className="border-t border-notion-border p-4">
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Job details skeleton */}
      <div className="notion-card mb-8">
        {/* Sections */}
        {[1, 2, 3].map((section) => (
          <div key={section} className="p-6 border-b border-notion-border">
            <div className="flex items-center mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Company info skeleton */}
      <div className="notion-card">
        <div className="p-6 border-b border-notion-border bg-notion-background-gray">
          <div className="flex items-center mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
            
            <div className="flex-grow">
              <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
              
              <div className="flex gap-4">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-notion-border p-4">
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
} 