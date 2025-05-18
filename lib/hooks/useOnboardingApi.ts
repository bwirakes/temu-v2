"use client";

/**
 * @deprecated Most functionality has been moved to OnboardingContext.
 * This hook is kept for backward compatibility. New code should use useOnboarding() 
 * from '@/lib/context/OnboardingContext' instead.
 * 
 * For saving data, use saveCurrentStepData() from useOnboarding()
 * For navigation, use navigateToNextStep(), navigateToPreviousStep() or navigateToStep()
 */

import { useState, useEffect } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";

export function useOnboardingApi() {
  const { 
    data, 
    updateFormValues, 
    currentStep, 
    saveCurrentStepData, 
    isSaving: contextIsSaving,
    navigateToNextStep
  } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedStep, setLastSavedStep] = useState<number | null>(null);

  // Log deprecation warning when hook is used
  useEffect(() => {
    console.warn(
      "useOnboardingApi is deprecated and will be removed in a future version. " +
      "Please use useOnboarding() from '@/lib/context/OnboardingContext' instead.\n" +
      "For saving data: use saveCurrentStepData()\n" +
      "For navigation: use navigateToNextStep(), navigateToPreviousStep() or navigateToStep()"
    );
  }, []);

  /**
   * Save data for a specific step
   * @deprecated Use saveCurrentStepData from useOnboarding() instead
   * @param step The step number to save data for
   * @param stepData Optional specific data to save for this step (defaults to current context data)
   * @returns Promise with the API response
   */
  const saveStep = async (step: number, stepData?: any) => {
    console.warn(
      "useOnboardingApi.saveStep is deprecated. Use useOnboarding().saveCurrentStepData instead. " +
      "This method will redirect to the context method if saving the current step."
    );
    
    setIsLoading(true);
    setError(null);

    try {
      // If no specific data is provided, use the current context data
      const dataToSave = stepData || data;
      
      // Extract only the relevant data for this step
      const relevantData = extractStepData(step, dataToSave);

      // Update the context data first
      updateFormValues(relevantData);
      
      // Use the context's saveCurrentStepData if the step matches current step
      if (step === currentStep) {
        const success = await saveCurrentStepData();
        setLastSavedStep(step);
        setIsLoading(false);
        return { success, data: relevantData };
      }

      console.log(`Saving step ${step} data:`, relevantData);

      const response = await fetch("/api/job-seeker/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step,
          data: relevantData,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = 
          responseData.message || 
          responseData.error || 
          `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
        
        throw new Error(errorMessage);
      }

      setLastSavedStep(step);
      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Extract only the relevant data for a specific step
   * @private Internal utility function
   */
  const extractStepData = (step: number, fullData: any) => {
    switch (step) {
      case 1: // Informasi Dasar
        return {
          namaLengkap: fullData.namaLengkap,
          email: fullData.email,
          nomorTelepon: fullData.nomorTelepon
        };
      
      case 2: // Informasi Lanjutan
        return {
          tanggalLahir: fullData.tanggalLahir,
          tempatLahir: fullData.tempatLahir,
          jenisKelamin: fullData.jenisKelamin
        };
      
      case 3: // Alamat
        // Return only the simplified address structure
        if (fullData.alamat) {
          const alamat = fullData.alamat;
          return {
            alamat: {
              kota: alamat.kota,
              provinsi: alamat.provinsi,
              kodePos: alamat.kodePos,
              jalan: alamat.jalan
            }
          };
        }
        return { alamat: {} };
      
      case 4: // Pendidikan
        return {
          pendidikan: fullData.pendidikan
        };
      
      case 5: // Level Pengalaman
        return {
          levelPengalaman: fullData.levelPengalaman
        };
      
      case 6: // Pengalaman Kerja
        return {
          pengalamanKerja: fullData.pengalamanKerja
        };
      
      case 7: // Ekspektasi Kerja
        if (fullData.ekspektasiKerja) {
          const ekspektasiData = fullData.ekspektasiKerja;
          
          // Ensure we have the proper data structure and types
          return {
            ekspektasiKerja: {
              jobTypes: ekspektasiData.jobTypes || null,
              idealSalary: ekspektasiData.idealSalary ? Number(ekspektasiData.idealSalary) : null,
              willingToTravel: ekspektasiData.willingToTravel || null,
              preferensiLokasiKerja: ekspektasiData.preferensiLokasiKerja || null
            }
          };
        }
        return { ekspektasiKerja: {} };
      
      case 8: // CV Upload
        return {
          cvFileUrl: fullData.cvFileUrl
        };

      case 9: // Profile Photo Upload
        return {
          profilePhotoUrl: fullData.profilePhotoUrl
        };
      
      default:
        return fullData;
    }
  };

  /**
   * Auto-save the current step data
   * @deprecated Use saveCurrentStepData from useOnboarding() instead
   */
  const autoSaveCurrentStep = async () => {
    console.warn(
      "useOnboardingApi.autoSaveCurrentStep is deprecated. " +
      "Using useOnboarding().saveCurrentStepData instead."
    );
    return saveCurrentStepData();
  };

  /**
   * Load all onboarding data from the API
   */
  const loadOnboardingData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/job-seeker/onboarding", {
        method: "GET",
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = 
          responseData.message || 
          responseData.error || 
          `Error ${response.status}: ${response.statusText || 'Unknown error'}`;
        
        throw new Error(errorMessage);
      }

      const { data: onboardingData } = responseData;
      
      if (onboardingData) {
        updateFormValues(onboardingData);
      }

      return onboardingData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveStep,
    autoSaveCurrentStep,
    loadOnboardingData,
    isLoading: isLoading || contextIsSaving,
    error,
    lastSavedStep,
    
    // Forward key methods from the context as well
    saveCurrentStepData,
    navigateToNextStep
  };
} 