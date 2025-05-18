export default function JobsLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i}
          className="notion-card overflow-hidden shadow-sm animate-pulse"
        >
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
              </div>
              <div className="flex-grow">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 w-16 h-6 bg-gray-200 rounded"></div>
                  <div className="px-3 py-1 w-20 h-6 bg-gray-200 rounded"></div>
                  <div className="px-3 py-1 w-24 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start mb-3">
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 mt-0.5"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            
            <div className="mt-4 border-t border-notion-border pt-4 flex justify-end">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 