"use client";

import { useOnboarding, onboardingSteps } from "@/lib/context/OnboardingContext";

export default function ProgressBar() {
  // Get the current step from context
  const { currentStep } = useOnboarding();
  
  // Total number of steps in the onboarding process
  const totalSteps = onboardingSteps.length;
  
  // Calculate progress based on current step
  // Adjust the formula to show visible progress even at step 1
  const progress = Math.max(5, Math.floor((currentStep / totalSteps) * 100));

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      />
    </div>
  );
} 
