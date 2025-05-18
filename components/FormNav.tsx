"use client";

import { Button } from "@/components/ui/button";
import { useOnboarding, onboardingSteps, optionalSteps } from "@/lib/context/OnboardingContext";
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
  saveOnNext = false
}: FormNavProps) {
  const { 
    currentStep, 
    navigateToNextStep,
    navigateToPreviousStep,
    isOptionalStep,
    saveCurrentStepData,
    isSaving: contextIsSaving,
    saveError
  } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  
  const isSubmitting = formSubmitting || contextIsSaving || isSaving;

  const handleNext = async () => {
    if (onSubmit) {
      // If there's a custom submit handler, use it
      console.log("[FormNav] Using custom onSubmit handler");
      onSubmit();
    } else {
      // Otherwise, handle navigation and data saving
      if (saveOnNext && !isOptionalStep(currentStep)) {
        try {
          console.log(`[FormNav] Saving data for required step ${currentStep}`);
          setIsSaving(true);
          const saveSuccess = await saveCurrentStepData();
          
          if (saveSuccess) {
            toast.success("Data berhasil disimpan");
            // Use the centralized navigation function
            console.log(`[FormNav] Data saved successfully, navigating to next step from step ${currentStep}`);
            navigateToNextStep();
          } else {
            // Check if there's a specific error message from the context
            if (saveError) {
              console.error(`[FormNav] Failed to save data for step ${currentStep}: ${saveError}`);
              toast.error(saveError);
            } else {
              toast.error("Gagal menyimpan data");
              console.error(`[FormNav] Failed to save data for step ${currentStep} - no specific error provided`);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[FormNav] Error saving data for step ${currentStep}:`, error);
          toast.error(`Gagal menyimpan data: ${errorMessage}`);
          // Don't continue with navigation if save fails
        } finally {
          setIsSaving(false);
        }
      } else {
        // For optional steps or when saveOnNext is false, just navigate
        console.log(`[FormNav] Skipping save for optional step ${currentStep} or saveOnNext=${saveOnNext}`);
        
        // For optional steps, try to save anyway if saveOnNext is true
        if (saveOnNext && isOptionalStep(currentStep)) {
          try {
            console.log(`[FormNav] Attempting to save optional step ${currentStep} data`);
            setIsSaving(true);
            const saveSuccess = await saveCurrentStepData();
            
            if (saveSuccess) {
              console.log(`[FormNav] Optional step ${currentStep} data saved successfully`);
            } else {
              console.log(`[FormNav] Optional step ${currentStep} data save skipped or failed (this is OK for optional steps)`);
            }
          } catch (error) {
            console.error(`[FormNav] Error saving optional step ${currentStep} data:`, error);
            // Don't show error toast for optional steps
          } finally {
            setIsSaving(false);
          }
        }
        
        navigateToNextStep();
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