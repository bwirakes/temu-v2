"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "../hooks/useOnboardingApi";
import { useState } from "react";
import { toast } from "sonner";

const routes = [
  "/job-seeker/onboarding/informasi-pribadi",    // Step 1: Informasi Dasar
  "/job-seeker/onboarding/informasi-lanjutan",   // Step 2: Informasi Lanjutan
  "/job-seeker/onboarding/alamat",               // Step 3: Alamat
  "/job-seeker/onboarding/social-media",         // Step 4: Social Media
  "/job-seeker/onboarding/upload-foto",          // Step 5: Upload Foto Profil
  "/job-seeker/onboarding/level-pengalaman",     // Step 6: Level Pengalaman
  "/job-seeker/onboarding/pengalaman-kerja",     // Step 7: Pengalaman Kerja
  "/job-seeker/onboarding/pendidikan",           // Step 8: Pendidikan
  "/job-seeker/onboarding/keahlian",             // Step 9: Keahlian
  "/job-seeker/onboarding/sertifikasi",          // Step 10: Sertifikasi
  "/job-seeker/onboarding/bahasa",               // Step 11: Bahasa
  "/job-seeker/onboarding/informasi-tambahan",   // Step 12: Informasi Tambahan
  "/job-seeker/onboarding/ekspektasi-kerja",     // Step 13: Ekspektasi Kerja
  "/job-seeker/onboarding/ringkasan",            // Step 14: Ringkasan
];

// Define which steps are optional
const optionalSteps = [4, 5, 10, 11, 12]; // Social Media, Upload Foto, Sertifikasi, Bahasa, Informasi Tambahan

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
  const router = useRouter();
  const { currentStep, setCurrentStep, isStepComplete } = useOnboarding();
  const { saveStep, isLoading: apiLoading } = useOnboardingApi();
  const [isSaving, setIsSaving] = useState(false);
  
  const isSubmitting = formSubmitting || apiLoading || isSaving;

  const handleNext = async () => {
    if (onSubmit) {
      // If there's a custom submit handler, use it
      onSubmit();
    } else {
      // Otherwise, handle navigation and data saving
      if (saveOnNext && !optionalSteps.includes(currentStep)) {
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
      
      if (currentStep < routes.length) {
        setCurrentStep(currentStep + 1);
        router.push(routes[currentStep]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      router.push(routes[currentStep - 2]);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (currentStep < routes.length) {
      setCurrentStep(currentStep + 1);
      router.push(routes[currentStep]);
    }
  };

  const isLastStep = currentStep === routes.length;
  const isOptionalStep = optionalSteps.includes(currentStep);

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
        {isOptionalStep && (
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