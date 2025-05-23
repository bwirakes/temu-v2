"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect,
  useCallback,
  useRef
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  PengalamanKerja,
  Pendidikan,
  WillingToTravel,
  LokasiKerja,
  EkspektasiKerja,
  onboardingSteps,
  optionalSteps,
  OnboardingData,
  levelPengalamanEnum
} from "@/lib/db-types";

const initialData: OnboardingData = {
  namaLengkap: "",
  email: "",
  nomorTelepon: "",
  tempatLahir: null,
  tanggalLahir: "",
  jenisKelamin: null,
  alamat: {
    kota: null,
    provinsi: null,
    kodePos: null,
    jalan: null,
  },
  levelPengalaman: null,
  pendidikan: [],
  pengalamanKerja: [],
  profilePhotoUrl: undefined,
  cvFileUrl: undefined,
};

type OnboardingContextType = {
  data: OnboardingData;
  setFormValues: (stepName: keyof OnboardingData, values: any) => void;
  updateFormValues: (values: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  getStepValidationErrors: (step: number) => Record<string, string>;
  isLoading: boolean;
  navigateToNextStep: () => void;
  navigateToPreviousStep: () => void;
  navigateToStep: (step: number) => void;
  getStepById: (id: number) => typeof onboardingSteps[0] | undefined;
  getStepPath: (id: number) => string | undefined;
  isOptionalStep: (step: number) => boolean;
  isSubmitting: boolean;
  submissionError: string | null;
  submitOnboardingData: () => Promise<boolean>;
};

// Create a default context with no-op functions to avoid null checks
const defaultContextValue: OnboardingContextType = {
  data: initialData,
  setFormValues: () => {},
  updateFormValues: () => {},
  currentStep: 1,
  setCurrentStep: () => {},
  getStepValidationErrors: () => ({}),
  isLoading: false,
  navigateToNextStep: () => {},
  navigateToPreviousStep: () => {},
  navigateToStep: () => {},
  getStepById: () => undefined,
  getStepPath: () => undefined,
  isOptionalStep: () => false,
  isSubmitting: false,
  submissionError: null,
  submitOnboardingData: async () => false,
};

// Use default context value to prevent null errors during SSR
const OnboardingContext = createContext<OnboardingContextType>(defaultContextValue);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  
  // Track the previous userId to detect changes
  const prevUserIdRef = useRef<string | undefined>(undefined);
  
  // Load saved data from API when the context initializes or user changes
  const loadSavedData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // First, check the onboarding status to get the correct step
      const statusResponse = await fetch("/api/job-seeker/check-onboarding");
      if (!statusResponse.ok) {
        throw new Error("Failed to check onboarding status");
      }
      
      const statusResult = await statusResponse.json();
      
      // Then load the actual onboarding data
      const response = await fetch("/api/job-seeker/onboarding");
      if (!response.ok) {
        throw new Error("Failed to load onboarding data");
      }
      
      const result = await response.json();
      
      if (result.data) {
        setData(prevData => ({
          ...initialData, // Reset to initial data first
          ...result.data  // Then apply saved data
        }));
      } else {
        // No data found, reset to initial state
        setData(initialData);
      }
      
      // Set the current step based on the check-onboarding response
      if (statusResult.currentStep) {
        setCurrentStep(statusResult.currentStep);
      } else {
        // If no currentStep provided, default to first step
        setCurrentStep(1);
      }

      // Mark that initial data has been loaded
      setInitialDataLoaded(true);
    } catch (error) {
      console.error("Error loading onboarding data:", error);
      // On error, reset to initial state to avoid using stale data
      setData(initialData);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
      // Reset programmatic navigation flag after data is loaded
      if (isProgrammaticNavigation) {
        setIsProgrammaticNavigation(false);
      }
    }
  }, [isProgrammaticNavigation, initialData, setData, setCurrentStep, setIsLoading, setInitialDataLoaded]);
  
  // Reset state when user changes or signs out, or load data on initial authentication
  useEffect(() => {
    // Skip if we're still loading the session
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      // Reset state when user signs out
      console.log('User signed out, resetting onboarding state');
      setData(initialData);
      setCurrentStep(1);
      setInitialDataLoaded(false);
      prevUserIdRef.current = undefined;
      return;
    }
    
    // Load onboarding data when the user is authenticated
    if (status === 'authenticated' && userId) {
      const userIdChanged = prevUserIdRef.current !== userId;
      
      // Only load data if:
      // 1. It hasn't been loaded yet, or
      // 2. The userId has changed
      // But NEVER load if we're in programmatic navigation mode
      if ((!initialDataLoaded || userIdChanged) && !isProgrammaticNavigation) {
        console.log('Loading onboarding data for user:', userId);
        
        // Store in a variable to be able to abort if component unmounts
        let isMounted = true;
        const loadData = async () => {
          try {
            await loadSavedData();
            if (isMounted) {
              // Update the previous userId reference
              prevUserIdRef.current = userId;
            }
          } catch (error) {
            if (isMounted) {
              console.error("Failed to load onboarding data:", error);
            }
          }
        };
        
        loadData();
        
        // Cleanup function to prevent state updates after unmounting
        return () => {
          isMounted = false;
        };
      } else {
        // Always update the previous userId reference even if we don't load data
        prevUserIdRef.current = userId;
      }
    }
  }, [status, userId, initialDataLoaded, isProgrammaticNavigation, loadSavedData]);

  const setFormValues = useCallback((stepName: keyof OnboardingData, values: any) => {
    setData((prev) => ({
      ...prev,
      [stepName]: values,
    }));
  }, []);

  const updateFormValues = useCallback((values: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...values,
    }));
  }, []);

  const getStepValidationErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Informasi Dasar
        if (!data.namaLengkap) errors.namaLengkap = "Nama lengkap wajib diisi";
        if (!data.email) errors.email = "Alamat email wajib diisi";
        if (!data.nomorTelepon) errors.nomorTelepon = "Nomor telepon wajib diisi";
        break;
      case 2: // Informasi Lanjutan
        if (!data.tanggalLahir) errors.tanggalLahir = "Tanggal lahir wajib diisi";
        // tempatLahir is now optional
        break;
      case 3: // Pendidikan (was Step 4)
        if (data.pendidikan.length === 0) {
          errors.pendidikan = "Minimal satu pendidikan harus diisi";
        } else {
          const pendidikanErrors = data.pendidikan.map((p, i) => {
            const itemErrors: Record<string, string> = {};
            // Only jenjangPendidikan is required
            if (!p.jenjangPendidikan) itemErrors.jenjangPendidikan = "Jenjang pendidikan wajib diisi";
            return Object.keys(itemErrors).length > 0 ? { index: i, errors: itemErrors } : null;
          }).filter(Boolean);
          
          if (pendidikanErrors.length > 0) {
            errors.pendidikan = `Ada ${pendidikanErrors.length} pendidikan yang belum lengkap`;
          }
        }
        break;
      case 4: // Level Pengalaman (was Step 5)
        if (!data.levelPengalaman) {
          errors.levelPengalaman = "Level pengalaman wajib diisi";
        } else if (!levelPengalamanEnum.enumValues.includes(data.levelPengalaman)) {
          errors.levelPengalaman = "Level pengalaman tidak valid";
        }
        break;
      case 5: // Pengalaman Kerja - optional (was Step 6)
        if (data.pengalamanKerja.length > 0) {
          const pengalamanErrors = data.pengalamanKerja.map((p, i) => {
            const itemErrors: Record<string, string> = {};
            if (!p.namaPerusahaan) itemErrors.namaPerusahaan = "Nama perusahaan wajib diisi";
            if (!p.posisi) itemErrors.posisi = "Posisi wajib diisi";
            if (!p.tanggalMulai) itemErrors.tanggalMulai = "Tanggal mulai wajib diisi";
            if (!p.tanggalSelesai && p.tanggalSelesai !== "Sekarang") {
              itemErrors.tanggalSelesai = "Tanggal selesai wajib diisi";
            }
            return Object.keys(itemErrors).length > 0 ? { index: i, errors: itemErrors } : null;
          }).filter(Boolean);
          
          if (pengalamanErrors.length > 0) {
            errors.pengalamanDetails = JSON.stringify(pengalamanErrors);
          }
        }
        break;
      case 6: // CV Upload (was Step 7)
        if (!data.cvFileUrl) errors.cvFileUrl = "CV/Resume wajib diunggah";
        break;
    }
    
    return errors;
  };

  // Submit all onboarding data to backend for final processing
  const submitOnboardingData = useCallback(async (): Promise<boolean> => {
    if (!data) return false;

    try {
      setIsSubmitting(true);

      // Normalize pendidikan data based on Pendidikan type from db-types.ts
      const normalizedPendidikan = data.pendidikan.map((pendidikan) => {
        // Create a clean object with only the fields we need
        const pendidikanObj = {
          id: pendidikan.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          namaInstitusi: pendidikan.namaInstitusi || '',
          jenjangPendidikan: pendidikan.jenjangPendidikan || '',
          bidangStudi: pendidikan.bidangStudi || '',
          lokasi: pendidikan.lokasi || '',
          tanggalLulus: pendidikan.tanggalLulus || null,
          tidakLulus: pendidikan.tidakLulus || false,
          // Explicitly exclude deskripsiTambahan and nilaiAkhir
        };
        
        return pendidikanObj;
      });

      // Normalize pengalaman kerja data based on PengalamanKerja type from db-types.ts
      const normalizedPengalamanKerja = data.pengalamanKerja.map(pengalaman => ({
        id: pengalaman.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        namaPerusahaan: pengalaman.namaPerusahaan || '',
        posisi: pengalaman.posisi || '',
        tanggalMulai: pengalaman.tanggalMulai || '',
        tanggalSelesai: pengalaman.tanggalSelesai || '',
        deskripsiPekerjaan: pengalaman.deskripsiPekerjaan || '',
        lokasiKerja: pengalaman.lokasiKerja as LokasiKerja,
        lokasi: pengalaman.lokasi || '',
        gajiTerakhir: pengalaman.gajiTerakhir,
        alasanKeluar: pengalaman.alasanKeluar,
        levelPengalaman: pengalaman.levelPengalaman
      }));
      
      // Normalize tempatLahir
      const normalizedTempatLahir = data.tempatLahir || null;
      
      // Normalize alamat data
      const normalizedAlamat = data.alamat ? {
        kota: data.alamat.kota || undefined,
        provinsi: data.alamat.provinsi || undefined,
        kodePos: data.alamat.kodePos || undefined,
        jalan: data.alamat.jalan || undefined
      } : undefined;
      
      // Create the complete submission data
      const submissionData = {
        ...data,
        pendidikan: normalizedPendidikan,
        pengalamanKerja: normalizedPengalamanKerja,
        tempatLahir: normalizedTempatLahir,
        alamat: normalizedAlamat,
      };
      
      // Remove non-serializable fields that should be uploaded separately
      delete submissionData.cvFile;
      delete submissionData.profilePhotoFile;

      console.log("Submitting onboarding data:", JSON.stringify(submissionData));
      
      // Send the data to the API
      const res = await fetch('/api/job-seeker/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      // Parse the response
      let responseData;
      try {
        responseData = await res.json();
      } catch (parseError) {
        console.error("Error parsing API response:", parseError);
        setSubmissionError("Invalid response from server");
        setIsSubmitting(false);
        return false;
      }
      
      // Handle error responses
      if (!res.ok) {
        console.error(`API error (${res.status}):`, responseData);
        
        // Format and display errors
        if (responseData.errors) {
          const errorMessages = Object.entries(responseData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          
          setSubmissionError(`Validasi gagal: ${errorMessages}`);
        } else if (responseData.error) {
          setSubmissionError(`${responseData.error}: ${responseData.message || res.statusText}`);
        } else {
          setSubmissionError(`Failed to submit data: ${res.statusText}`);
        }
        
        setIsSubmitting(false);
        return false;
      }
      
      // Handle successful submission
      console.log("Onboarding submission successful:", responseData);
      
      // Set programmatic navigation flag before redirecting
      setIsProgrammaticNavigation(true);
      setIsSubmitting(false);
      return true;
    } catch (error: any) {
      console.error("Error in submitOnboardingData:", error);
      setSubmissionError(error.message || "An unknown error occurred while submitting your data");
      setIsSubmitting(false);
      return false;
    }
  }, [data]);

  const getStepById = useCallback((id: number) => {
    return onboardingSteps.find(step => step.id === id);
  }, []);
  
  const getStepPath = useCallback((id: number) => {
    const step = getStepById(id);
    return step?.path;
  }, [getStepById]);
  
  const isOptionalStep = useCallback((step: number) => {
    return optionalSteps.includes(step);
  }, []);
  
  // Simplified navigation functions - only handle client-side state
  const navigateToNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep <= onboardingSteps.length) {
      // Set navigation flag before changing state
      setIsProgrammaticNavigation(true);
      setCurrentStep(nextStep);
      const path = getStepPath(nextStep);
      if (path) {
        router.push(path);
        // Reset the flag after the current synchronous code block finishes
        Promise.resolve().then(() => {
          setIsProgrammaticNavigation(false);
        });
      }
    }
  }, [currentStep, getStepPath, router]);
  
  const navigateToPreviousStep = useCallback(() => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      // Set navigation flag before changing state
      setIsProgrammaticNavigation(true);
      setCurrentStep(prevStep);
      const path = getStepPath(prevStep);
      if (path) {
        router.push(path);
        // Reset the flag after the current synchronous code block finishes
        Promise.resolve().then(() => {
          setIsProgrammaticNavigation(false);
        });
      }
    }
  }, [currentStep, getStepPath, router]);
  
  const navigateToStep = useCallback((step: number) => {
    if (step >= 1 && step <= onboardingSteps.length) {
      // Set navigation flag before changing state
      setIsProgrammaticNavigation(true);
      setCurrentStep(step);
      const path = getStepPath(step);
      if (path) {
        router.push(path);
        // Reset the flag after the current synchronous code block finishes
        Promise.resolve().then(() => {
          setIsProgrammaticNavigation(false);
        });
      }
    }
  }, [getStepPath, router]);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setFormValues,
        updateFormValues,
        currentStep,
        setCurrentStep,
        getStepValidationErrors,
        isLoading,
        navigateToNextStep,
        navigateToPreviousStep,
        navigateToStep,
        getStepById,
        getStepPath,
        isOptionalStep,
        isSubmitting,
        submissionError,
        submitOnboardingData
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  // This check is no longer needed as we're providing default values
  return context;
};