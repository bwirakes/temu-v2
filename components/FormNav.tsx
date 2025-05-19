"use client";

import { Button } from "@/components/ui/button";
import { useOnboarding  } from "@/lib/context/OnboardingContext";
import { onboardingSteps } from "@/lib/db-types";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FormNavProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
  disableNext?: boolean;
  onSkip?: () => void;
  saveOnNext?: boolean;
}

export default function FormNav({ 
  onSubmit, 
  isSubmitting: formSubmitting, 
  disableNext, 
  onSkip,
  saveOnNext = false
}: FormNavProps) {
  const { 
    currentStep, 
    navigateToNextStep,
    navigateToPreviousStep,
    isOptionalStep,
    getStepPath
  } = useOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const isSubmitting = formSubmitting || isProcessing;

  useEffect(() => {
    // Log current step info for debugging navigation issues
    console.log(`[FormNav] Current step: ${currentStep}`);
    console.log(`[FormNav] Next step path: ${getStepPath(currentStep + 1)}`);
  }, [currentStep, getStepPath]);

  const handleNext = async () => {
    if (onSubmit) {
      // If there's a custom submit handler, use it
      console.log("[FormNav] Using custom onSubmit handler");
      onSubmit();
    } else {
      // Just handle navigation - we no longer save per step
      setIsProcessing(true);
      try {
        console.log(`[FormNav] Navigating to next step from step ${currentStep}`);
        navigateToNextStep();
      } catch (error) {
        console.error(`[FormNav] Error navigating from step ${currentStep}:`, error);
        toast.error("Terjadi kesalahan saat navigasi");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePrevious = () => {
    navigateToPreviousStep();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      // Use the centralized navigation function
      navigateToNextStep();
    }
  };

  const isLastStep = currentStep === onboardingSteps.length;
  const isCurrentStepOptional = isOptionalStep(currentStep);

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 1 || isSubmitting}
        className="px-6"
      >
        Sebelumnya
      </Button>
      
      <div className="flex space-x-2">
        {isCurrentStepOptional && (
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="px-6"
          >
            Lewati
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          disabled={disableNext || isSubmitting}
          className={`px-6 ${isLastStep ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </div>
          ) : isLastStep ? (
            "Selesaikan Pendaftaran"
          ) : (
            "Berikutnya"
          )}
        </Button>
      </div>
    </div>
  );
}