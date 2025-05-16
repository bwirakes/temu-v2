"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEmployerOnboarding } from "@/lib/context/EmployerOnboardingContext";

const routes = [
  "/employer/onboarding/informasi-perusahaan",    // Step 1: Informasi Dasar Badan Usaha
  "/employer/onboarding/kehadiran-online",        // Step 2: Kehadiran Online dan Identitas Merek
  "/employer/onboarding/penanggung-jawab",        // Step 3: Penanggung Jawab (PIC)
  "/employer/onboarding/konfirmasi",              // Step 4: Konfirmasi dan Langkah Selanjutnya
];

interface EmployerFormNavProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
  disableNext?: boolean;
}

export default function EmployerFormNav({ onSubmit, isSubmitting, disableNext }: EmployerFormNavProps) {
  const router = useRouter();
  const { currentStep, setCurrentStep, isStepComplete, saveCurrentStepData, isSaving } = useEmployerOnboarding();

  const handleNext = async () => {
    if (onSubmit) {
      // This case is used when the form has its own onSubmit handler
      // The onSubmit handler should handle saving and navigation
      onSubmit();
    } else if (currentStep < routes.length) {
      // Default navigation with auto-save
      try {
        // Set the next step locally before saving to ensure it's captured in the API call
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        // Save current step data
        const saveSuccessful = await saveCurrentStepData();
        
        if (!saveSuccessful) {
          console.error("Failed to save data");
          // Revert step change if save failed
          setCurrentStep(currentStep);
          return;
        }
        
        // Navigate to next step - ensure we're using the current step before the increment
        router.push(routes[currentStep]);
      } catch (error) {
        console.error("Error navigating to next step:", error);
        // Revert step change on error
        setCurrentStep(currentStep);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      router.push(routes[prevStep - 1]);
    }
  };

  const isLastStep = currentStep === routes.length;

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 1 || isSubmitting || isSaving}
        className="px-6"
      >
        Sebelumnya
      </Button>
      
      <Button
        onClick={handleNext}
        disabled={disableNext || isSubmitting || isSaving}
        className={`px-6 ${isLastStep ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        {isSubmitting || isSaving ? (
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
  );
} 