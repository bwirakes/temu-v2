"use client";

import { Button } from "@/components/ui/button";
import { useOnboarding, onboardingSteps, optionalSteps } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { useState } from "react";
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
  saveOnNext = true
}: FormNavProps) {
  const { 
    currentStep, 
    navigateToNextStep,
    navigateToPreviousStep,
    isOptionalStep
  } = useOnboarding();
  const { saveStep, isLoading: apiLoading } = useOnboardingApi();
  const [isSaving, setIsSaving] = useState(false);
  
  const isSubmitting = formSubmitting || apiLoading || isSaving;

  const handleNext = async () => {
    if (onSubmit) {
      // If there's a custom submit handler, use it
      onSubmit();
    } else {
      // Otherwise, handle navigation and data saving
      if (saveOnNext && !isOptionalStep(currentStep)) {
        try {
          setIsSaving(true);
          await saveStep(currentStep);
          toast.success("Data berhasil disimpan");
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Gagal menyimpan data");
          // Continue with navigation even if save fails
        } finally {
          setIsSaving(false);
        }
      }
      
      // Use the centralized navigation function
      navigateToNextStep();
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