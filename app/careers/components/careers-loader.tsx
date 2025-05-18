export default function CareersLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i}
          className="notion-card overflow-hidden shadow-sm animate-pulse"
        >
          <div className="p-6 border-b border-notion-border">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
              </div>
              <div>
                <div className="h-5 w-36 mb-2 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 mb-2 bg-gray-200 rounded flex items-center">
                  <div className="h-4 w-4 bg-gray-300 rounded-full mr-1"></div>
                </div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="h-8 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 