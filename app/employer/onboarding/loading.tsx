export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
        <h2 className="mt-6 text-xl font-medium text-gray-700">Loading onboarding...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your onboarding experience.</p>
      </div>
    </div>
  );
} 