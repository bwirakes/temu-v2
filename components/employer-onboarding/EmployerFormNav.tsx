"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEmployerOnboarding } from "@/lib/context/EmployerOnboardingContext";

// Define routes for consistent navigation
const routes = [
  "/employer/onboarding/informasi-perusahaan",
  "/employer/onboarding/kehadiran-online",
  "/employer/onboarding/penanggung-jawab",
  "/employer/onboarding/konfirmasi",
];

interface EmployerFormNavProps {
  isSubmitting?: boolean;
  disableNext?: boolean;
}

export default function EmployerFormNav({ 
  isSubmitting,
  disableNext 
}: EmployerFormNavProps) {
  const router = useRouter();
  const { 
    currentStep, 
    setCurrentStep,
    isSaving,
    allowedSteps,
    canNavigateToStep
  } = useEmployerOnboarding();

  const handlePrevious = () => {
    if (isSubmitting) {
      return;
    }
    
    const prevStepNumber = currentStep - 1;
    if (prevStepNumber >= 1 && canNavigateToStep(prevStepNumber)) {
      setCurrentStep(prevStepNumber);
      router.push(routes[prevStepNumber - 1]);
    }
  };

  const isLastStep = currentStep === routes.length;
  // For non-final steps, use local isSubmitting state.
  // For the final step (Konfirmasi), use the global isSaving state
  const isButtonDisabled = disableNext || 
    isSubmitting || 
    (isLastStep && isSaving);
  
  const isPrevButtonDisabled = 
    isSubmitting || 
    (isLastStep && isSaving) || 
    currentStep === 1 || 
    !canNavigateToStep(currentStep - 1);

  return (
    <div className="flex flex-col sm:flex-row justify-between mt-8 gap-3">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={isPrevButtonDisabled}
        className="w-full sm:w-auto px-6"
        type="button"
      >
        Sebelumnya
      </Button>
      
      <Button
        type="submit"
        disabled={isButtonDisabled}
        className={`w-full sm:w-auto px-6 ${isLastStep ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {isSubmitting || (isLastStep && isSaving) ? (
          <div className="flex items-center justify-center">
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
  );
} 