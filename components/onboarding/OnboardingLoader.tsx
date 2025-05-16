"use client";

import { useOnboarding } from "@/lib/context/OnboardingContext";

export default function OnboardingLoader() {
  const { isLoading } = useOnboarding();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Memuat data...</p>
      </div>
    </div>
  );
} 