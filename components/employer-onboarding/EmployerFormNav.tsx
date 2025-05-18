"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEmployerOnboarding } from "@/lib/context/EmployerOnboardingContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const { 
    currentStep, 
    setCurrentStep, 
    saveCurrentStepData, 
    isSaving, 
    allowedSteps,
    canNavigateToStep
  } = useEmployerOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Reset processing state if external submission state changes
  useEffect(() => {
    if (!isSubmitting && !isSaving) {
      setIsProcessing(false);
    }
  }, [isSubmitting, isSaving]);

  const handleNext = async () => {
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      if (onSubmit) {
        // This case is used when the form has its own onSubmit handler
        onSubmit();
      } else if (currentStep < routes.length) {
        // Save current step data - the backend will handle advancing to the next step if appropriate
        const saveSuccessful = await saveCurrentStepData();
        
        if (!saveSuccessful) {
          toast.error("Gagal menyimpan data. Silakan coba lagi.");
          setIsProcessing(false);
          return;
        }
        
        toast.success("Perubahan berhasil disimpan");
        
        // The step advancement and navigation is now handled by the context's saveCurrentStepData function
        // which receives this information from the backend
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsProcessing(false);
    }
  };

  const handlePrevious = () => {
    if (isProcessing) {
      return;
    }
    
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      
      // Check if we're allowed to navigate to the previous step
      if (canNavigateToStep(prevStep)) {
        setCurrentStep(prevStep);
        
        setTimeout(() => {
          const prevRoute = routes[prevStep - 1];
          router.push(prevRoute);
        }, 100);
      } else {
        toast.error("Anda tidak dapat kembali ke langkah sebelumnya");
      }
    }
  };

  const isLastStep = currentStep === routes.length;
  const isDisabled = disableNext || isSubmitting || isSaving || isProcessing;

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStep === 1 || isDisabled || !canNavigateToStep(currentStep - 1)}
        className="px-6"
      >
        Sebelumnya
      </Button>
      
      <Button
        onClick={handleNext}
        disabled={isDisabled}
        className={`px-6 ${isLastStep ? 'bg-green-600 hover:bg-green-700' : ''}`}
      >
        {isSubmitting || isSaving || isProcessing ? (
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