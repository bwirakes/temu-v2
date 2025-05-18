"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding, onboardingSteps } from "@/lib/context/OnboardingContext";

interface ProgressBarProps {
  forceCurrentStep?: number;
}

export default function ProgressBar({ forceCurrentStep }: ProgressBarProps) {
  const { 
    currentStep: contextCurrentStep, 
    setCurrentStep, 
    completedSteps
  } = useOnboarding();
  const pathname = usePathname();
  
  // Use forceCurrentStep if provided, otherwise use the context value
  const currentStep = forceCurrentStep !== undefined ? forceCurrentStep : contextCurrentStep;

  // Synchronize the current step with the URL path, only if forceCurrentStep is not provided
  useEffect(() => {
    if (forceCurrentStep !== undefined) return;
    
    const currentPath = pathname.split("/").pop();
    const matchedStep = onboardingSteps.find(step => step.path.endsWith(currentPath || ""));
    
    if (matchedStep && matchedStep.id !== contextCurrentStep) {
      setCurrentStep(matchedStep.id);
    }
  }, [pathname, contextCurrentStep, setCurrentStep, forceCurrentStep]);

  // Calculate progress percentage based on the current step position
  const progressPercentage = Math.min(
    100, // Cap at 100%
    Math.max(5, Math.floor((currentStep / onboardingSteps.length) * 100))
  );

  return (
    <div className="w-full py-4 px-2 sm:px-0">
      <div>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-blue-600">
            Langkah {currentStep} dari {onboardingSteps.length}
          </p>
          <p className="text-xs text-gray-500">
            {completedSteps.length} langkah selesai
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