export default function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-md animate-pulse">
            <div className="flex justify-between">
              <div className="w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-start p-4 rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="ml-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}