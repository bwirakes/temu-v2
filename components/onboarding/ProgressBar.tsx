"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { onboardingSteps } from "@/lib/db-types";

interface ProgressBarProps {
  forceCurrentStep?: number;
}

export default function ProgressBar({ forceCurrentStep }: ProgressBarProps) {
  const { 
    currentStep: contextCurrentStep, 
    setCurrentStep
  } = useOnboarding();
  const pathname = usePathname();
  
  // Use forceCurrentStep if provided, otherwise use the context value
  const currentStep = forceCurrentStep !== undefined ? forceCurrentStep : contextCurrentStep;
  
  // Ensure displayed step doesn't exceed total steps
  const totalSteps = onboardingSteps.length;
  const displayStep = Math.min(currentStep, totalSteps);

  // Synchronize the current step with the URL path, only if forceCurrentStep is not provided
  useEffect(() => {
    if (forceCurrentStep !== undefined) return;
    
    const currentPath = pathname.split("/").pop();
    const matchedStep = onboardingSteps.find(step => {
      return step.path.endsWith(currentPath || "");
    });
    
    if (matchedStep && matchedStep.id !== contextCurrentStep) {
      setCurrentStep(matchedStep.id);
    }
  }, [pathname, contextCurrentStep, setCurrentStep, forceCurrentStep]);

  // Calculate progress percentage based on the current step position
  const progressPercentage = Math.min(
    100, // Cap at 100%
    Math.max(5, Math.floor((displayStep / totalSteps) * 100))
  );

  return (
    <div className="w-full py-4 px-2 sm:px-0">
      <div>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-blue-600">
            Langkah {displayStep} dari {totalSteps}
          </p>
          <p className="text-xs text-gray-500">
            {Math.max(0, displayStep - 1)} langkah telah dilalui
          </p>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 