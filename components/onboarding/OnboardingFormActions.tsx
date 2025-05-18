"use client";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useState } from "react";

interface OnboardingFormActionsProps {
  currentStep: number;
  previousStep?: string;
  nextStep?: string;
  isSubmitDisabled?: boolean;
  onBeforeSubmit?: () => Promise<boolean> | boolean;
  isLastStep?: boolean;
}

export default function OnboardingFormActions({
  currentStep,
  previousStep,
  nextStep,
  isSubmitDisabled = false,
  onBeforeSubmit,
  isLastStep = false,
}: OnboardingFormActionsProps) {
  const { 
    saveCurrentStepData, 
    isSaving, 
    saveError: contextSaveError,
    navigateToNextStep,
    navigateToPreviousStep
  } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);

      // Run pre-submit validation if provided
      if (onBeforeSubmit) {
        const isValid = await onBeforeSubmit();
        if (!isValid) return;
      }

      // Save current step data using the context's saveCurrentStepData function
      const saveSuccess = await saveCurrentStepData();
      
      if (!saveSuccess) {
        // If there was an error saving, it will be available in contextSaveError
        setError(contextSaveError || "Failed to save data");
        return;
      }

      // Navigate to next step or success page using the context's navigation functions
      if (nextStep) {
        navigateToNextStep();
      } else if (isLastStep) {
        // For the last step, we still use direct navigation to success page
        // as it might not be part of the standard onboarding flow
        window.location.href = "/job-seeker/onboarding/success";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save data");
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {(error || contextSaveError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || contextSaveError}
        </div>
      )}

      <div className="flex justify-between">
        {previousStep ? (
          <button
            type="button"
            onClick={() => navigateToPreviousStep()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSaving}
          >
            Kembali
          </button>
        ) : (
          <div></div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isSubmitDisabled || isSaving}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </>
          ) : isLastStep ? (
            "Selesai"
          ) : (
            "Lanjutkan"
          )}
        </button>
      </div>
    </div>
  );
} 