"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";

export function useOnboardingApi() {
  const { data, updateFormValues, currentStep } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedStep, setLastSavedStep] = useState<number | null>(null);

  /**
   * Save data for a specific step
   * @param step The step number to save data for
   * @param stepData Optional specific data to save for this step (defaults to current context data)
   */
  const saveStep = async (step: number, stepData?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // If no specific data is provided, use the current context data
      const dataToSave = stepData || data;
      
      // Extract only the relevant data for this step
      const relevantData = extractStepData(step, dataToSave);

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

      if (!response.ok) {
        // Handle different error response formats
        let errorMessage = "Failed to save data";
        try {
          const errorData = await response.json();
          // Check if error exists in different possible formats
          errorMessage = 
            errorData.error || 
            errorData.message || 
            errorData.errorMessage || 
            `Server error: ${response.status}`;
        } catch (parseError) {
          // If JSON parsing fails, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setLastSavedStep(step);
      return await response.json();
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
          cvFile: fullData.cvFile,
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
   */
  const autoSaveCurrentStep = async () => {
    return saveStep(currentStep);
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

      if (!response.ok) {
        // Handle different error response formats
        let errorMessage = "Failed to load data";
        try {
          const errorData = await response.json();
          // Check if error exists in different possible formats
          errorMessage = 
            errorData.error || 
            errorData.message || 
            errorData.errorMessage || 
            `Server error: ${response.status}`;
        } catch (parseError) {
          // If JSON parsing fails, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const { data: onboardingData } = await response.json();
      
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
    isLoading,
    error,
    lastSavedStep,
  };
} 