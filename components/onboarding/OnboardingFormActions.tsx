"use client";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useState } from "react";
import { toast } from "sonner";

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
    navigateToNextStep,
    navigateToPreviousStep,
    submitOnboardingData,
    isSubmitting: contextIsSubmitting
  } = useOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isProcessing || (isLastStep && contextIsSubmitting);

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Run pre-submit validation if provided
      if (onBeforeSubmit) {
        const isValid = await onBeforeSubmit();
        if (!isValid) {
          setIsProcessing(false);
          return;
        }
      }

      // If it's the last step, trigger final submission
      if (isLastStep) {
        const success = await submitOnboardingData();
        
        if (success) {
          toast.success("Pendaftaran berhasil diselesaikan!");
          // The redirect will be handled by the submitOnboardingData function
        } else {
          // The submission error will be displayed by the context
          toast.error("Gagal menyelesaikan pendaftaran");
        }
      } 
      // Otherwise, navigate to next step
      else if (nextStep) {
        navigateToNextStep();
      }
      
      setIsProcessing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        {previousStep ? (
          <button
            type="button"
            onClick={() => navigateToPreviousStep()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
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
          disabled={isSubmitDisabled || isLoading}
        >
          {isLoading ? (
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
              Sedang Diproses...
            </>
          ) : isLastStep ? (
            "Selesaikan Pendaftaran"
          ) : (
            "Lanjutkan"
          )}
        </button>
      </div>
    </div>
  );
} 