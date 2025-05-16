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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save data");
      }

      setLastSavedStep(step);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Extract only the relevant data for a specific step
   */
  const extractStepData = (step: number, fullData: any) => {
    switch (step) {
      case 1: // Informasi Pribadi
        return {
          namaLengkap: fullData.namaLengkap,
          email: fullData.email,
          nomorTelepon: fullData.nomorTelepon,
          tempatLahir: fullData.tempatLahir,
          statusPernikahan: fullData.statusPernikahan
        };
      
      case 2: // Informasi Lanjutan
        return {
          tanggalLahir: fullData.tanggalLahir,
          jenisKelamin: fullData.jenisKelamin,
          beratBadan: fullData.beratBadan,
          tinggiBadan: fullData.tinggiBadan,
          agama: fullData.agama
        };
      
      case 3: // Alamat
        return {
          alamat: fullData.alamat
        };
      
      case 4: // Social Media
        return {
          socialMedia: fullData.socialMedia
        };
      
      case 5: // Upload Foto
        return {
          fotoProfilUrl: fullData.fotoProfilUrl
        };
      
      case 6: // Level Pengalaman
        // This might be handled in pengalaman kerja
        return {};
      
      case 7: // Pengalaman Kerja
        return {
          pengalamanKerja: fullData.pengalamanKerja
        };
      
      case 8: // Pendidikan
        return {
          pendidikan: fullData.pendidikan
        };
      
      case 9: // Keahlian
        return {
          keahlian: fullData.keahlian
        };
      
      case 10: // Sertifikasi
        return {
          sertifikasi: fullData.sertifikasi
        };
      
      case 11: // Bahasa
        return {
          bahasa: fullData.bahasa
        };
      
      case 12: // Informasi Tambahan
        return {
          informasiTambahan: fullData.informasiTambahan
        };
      
      case 13: // Ekspektasi Kerja
        return {
          ekspektasiKerja: fullData.ekspektasiKerja
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
      const response = await fetch("/api/onboarding", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load data");
      }

      const { data: onboardingData } = await response.json();
      
      if (onboardingData) {
        updateFormValues(onboardingData);
      }

      return onboardingData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
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