"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect,
  useCallback
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
  OnboardingData
} from "@/lib/db-types";

const initialData: OnboardingData = {
  namaLengkap: "",
  email: "",
  nomorTelepon: "",
  tempatLahir: null,
  tanggalLahir: "",
  alamat: {
    kota: "",
    provinsi: "",
    kodePos: "",
    jalan: "",
  },
  levelPengalaman: undefined,
  pendidikan: [],
  pengalamanKerja: [],
  profilePhotoUrl: undefined,
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

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  
  // Reset state when user changes or signs out
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      // Reset state when user signs out
      console.log('User signed out, resetting onboarding state');
      setData(initialData);
      setCurrentStep(1);
    }
    
    // Load onboarding data when the user is authenticated or changes
    if (status === 'authenticated' && userId) {
      // If authenticated, ensure onboarding data is loaded from the API
      loadSavedData();
    }
  }, [status, userId]);

  // Load saved data from API when the context initializes or user changes
  const loadSavedData = async () => {
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
    } catch (error) {
      console.error("Error loading onboarding data:", error);
      // On error, reset to initial state to avoid using stale data
      setData(initialData);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

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
      case 3: // Pendidikan
        if (data.pendidikan.length === 0) {
          errors.pendidikan = "Minimal satu pendidikan harus diisi";
        } else {
          const pendidikanErrors = data.pendidikan.map((p, i) => {
            const itemErrors: Record<string, string> = {};
            // Only jenjangPendidikan and bidangStudi are required
            if (!p.jenjangPendidikan) itemErrors.jenjangPendidikan = "Jenjang pendidikan wajib diisi";
            if (!p.bidangStudi) itemErrors.bidangStudi = "Bidang studi wajib diisi";
            return Object.keys(itemErrors).length > 0 ? { index: i, errors: itemErrors } : null;
          }).filter(Boolean);
          
          if (pendidikanErrors.length > 0) {
            errors.pendidikanDetails = JSON.stringify(pendidikanErrors);
          }
        }
        break;
      case 4: // Level Pengalaman
        if (!data.levelPengalaman) errors.levelPengalaman = "Level pengalaman wajib diisi";
        // Validate against the enum values
        const validLevelValues = ['LULUSAN_BARU', 'SATU_DUA_TAHUN', 'TIGA_LIMA_TAHUN', 'LIMA_SEPULUH_TAHUN', 'LEBIH_SEPULUH_TAHUN'];
        if (data.levelPengalaman && !validLevelValues.includes(data.levelPengalaman)) {
          errors.levelPengalaman = "Level pengalaman tidak valid";
        }
        break;
      case 5: // Pengalaman Kerja - optional
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
      case 6: // CV Upload
        if (!data.cvFileUrl) errors.cvFileUrl = "CV/Resume wajib diunggah";
        break;
    }
    
    return errors;
  };

  // Submit all onboarding data to backend for final processing
  const submitOnboardingData = useCallback(async (): Promise<boolean> => {
    try {
      setSubmissionError(null);
      setIsSubmitting(true);
      
      console.log("Preparing onboarding data for submission...");
      
      // Create a copy of data to submit (excluding non-serializable fields)
      const submissionData = { ...data };
      delete submissionData.cvFile;
      delete submissionData.profilePhotoFile;
      
      // Ensure undefined values are properly handled
      // Normalize pendidikan data
      if (submissionData.pendidikan) {
        submissionData.pendidikan = submissionData.pendidikan.map(pendidikan => ({
          ...pendidikan,
          // Only include required fields and provided optional fields
          jenjangPendidikan: pendidikan.jenjangPendidikan,
          bidangStudi: pendidikan.bidangStudi,
          namaInstitusi: pendidikan.namaInstitusi || undefined,
          lokasi: pendidikan.lokasi || undefined,
          tanggalLulus: pendidikan.tanggalLulus || undefined,
          // Remove deskripsiTambahan field
          // Remove nilaiAkhir as requested
          nilaiAkhir: undefined
        }));
      }
      
      // Normalize pengalaman kerja data
      if (submissionData.pengalamanKerja) {
        submissionData.pengalamanKerja = submissionData.pengalamanKerja.map(pengalaman => ({
          ...pengalaman,
          // Only include required fields and provided optional fields
          namaPerusahaan: pengalaman.namaPerusahaan,
          posisi: pengalaman.posisi,
          tanggalMulai: pengalaman.tanggalMulai,
          tanggalSelesai: pengalaman.tanggalSelesai,
          deskripsiPekerjaan: pengalaman.deskripsiPekerjaan || undefined,
          alasanKeluar: pengalaman.alasanKeluar || undefined,
          lokasiKerja: pengalaman.lokasiKerja || undefined,
          lokasi: pengalaman.lokasi || undefined,
          levelPengalaman: pengalaman.levelPengalaman || undefined
        }));
      }
      
      // Normalize tempatLahir
      submissionData.tempatLahir = submissionData.tempatLahir || null;
      
      // Normalize alamat data
      if (submissionData.alamat) {
        submissionData.alamat = {
          kota: submissionData.alamat.kota || undefined,
          provinsi: submissionData.alamat.provinsi || undefined,
          kodePos: submissionData.alamat.kodePos || undefined,
          jalan: submissionData.alamat.jalan || undefined
        };
      }
      
      // Before sending, convert the data to JSON and back to handle any remaining issues
      const preparedData = JSON.parse(JSON.stringify(submissionData));
      
      // Send the complete data to the backend
      console.log("Submitting onboarding data to /api/job-seeker/onboarding/submit");
      const response = await fetch("/api/job-seeker/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preparedData),
      });
      
      // Parse the response
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error("Error parsing API response:", parseError);
        setSubmissionError("Invalid response from server");
        setIsSubmitting(false);
        return false;
      }
      
      // Handle error responses
      if (!response.ok) {
        console.error(`API error (${response.status}):`, responseData);
        
        // Format and display errors
        if (responseData.errors) {
          const errorMessages = Object.entries(responseData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          
          setSubmissionError(`Validasi gagal: ${errorMessages}`);
        } else if (responseData.error) {
          setSubmissionError(`${responseData.error}: ${responseData.message || response.statusText}`);
        } else {
          setSubmissionError(`Failed to submit data: ${response.statusText}`);
        }
        
        setIsSubmitting(false);
        return false;
      }
      
      // Handle successful submission
      console.log("Onboarding submission successful:", responseData);
      
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
      setCurrentStep(nextStep);
      const path = getStepPath(nextStep);
      if (path) {
        router.push(path);
      }
    }
  }, [currentStep, getStepPath, router]);
  
  const navigateToPreviousStep = useCallback(() => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      const path = getStepPath(prevStep);
      if (path) {
        router.push(path);
      }
    }
  }, [currentStep, getStepPath, router]);
  
  const navigateToStep = useCallback((step: number) => {
    if (step >= 1 && step <= onboardingSteps.length) {
      setCurrentStep(step);
      const path = getStepPath(step);
      if (path) {
        router.push(path);
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
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};