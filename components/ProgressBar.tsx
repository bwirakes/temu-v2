"use client";

import { useOnboarding, onboardingSteps } from "@/lib/context/OnboardingContext";

export default function ProgressBar() {
  const { currentStep, completedSteps } = useOnboarding();
  
  // Calculate progress percentage
  const totalSteps = onboardingSteps.length;
  const completedStepsNumber = typeof completedSteps === 'number' ? completedSteps : 0;
  const progress = Math.floor((completedStepsNumber / totalSteps) * 100);

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 
