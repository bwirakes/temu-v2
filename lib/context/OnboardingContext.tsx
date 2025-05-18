"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect
} from "react";
import { useRouter } from "next/navigation";

// Define types for our form data
export type PengalamanKerja = {
  id: string;
  levelPengalaman: "Baru lulus" | "Pengalaman magang" | "Kurang dari 1 tahun" | "1-2 tahun" | "3-5 tahun" | "5-10 tahun" | "10 tahun lebih";
  namaPerusahaan: string;
  posisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsiPekerjaan?: string;
  lokasiKerja?: "WFH" | "WFO" | "Hybrid";
  lokasi?: string;
  gajiTerakhir?: string;
  alasanKeluar?: "Kontrak tidak diperpanjang" | "Gaji terlalu kecil" | "Tidak cocok dengan atasan / rekan kerja" | "Lokasi terlalu jauh" | "Pekerjaan terlalu berat" | "Lainnya" | string;
  alasanKeluarLainnya?: string;
};

export type Pendidikan = {
  id: string;
  namaInstitusi: string;
  lokasi: string;
  jenjangPendidikan: string;
  bidangStudi: string;
  tanggalLulus: string;
  deskripsiTambahan?: string;
  nilaiAkhir?: string;
};

export type WillingToTravel = "local_only" | "jabodetabek" | "anywhere";
export type LokasiKerja = "WFH" | "WFO" | "Hybrid";

export interface EkspektasiKerja {
  jobTypes: string;
  idealSalary: number;
  willingToTravel: "not_willing" | "local_only" | "domestic" | "international";
  preferensiLokasiKerja: "WFH" | "WFO" | "Hybrid";
}

// Define onboarding steps configuration
export const onboardingSteps = [
  { id: 1, path: "/job-seeker/onboarding/informasi-dasar", title: "Informasi Dasar" },
  { id: 2, path: "/job-seeker/onboarding/informasi-lanjutan", title: "Informasi Lanjutan" },
  { id: 3, path: "/job-seeker/onboarding/alamat", title: "Alamat" },
  { id: 4, path: "/job-seeker/onboarding/pendidikan", title: "Pendidikan" },
  { id: 5, path: "/job-seeker/onboarding/level-pengalaman", title: "Level Pengalaman" },
  { id: 6, path: "/job-seeker/onboarding/pengalaman-kerja", title: "Pengalaman Kerja" },
  { id: 7, path: "/job-seeker/onboarding/ekspektasi-kerja", title: "Ekspektasi Kerja" },
  { id: 8, path: "/job-seeker/onboarding/cv-upload", title: "CV Upload" },
  { id: 9, path: "/job-seeker/onboarding/foto-profile", title: "Foto Profil" },
  { id: 10, path: "/job-seeker/onboarding/ringkasan", title: "Ringkasan" },
];

// Define which steps are optional
export const optionalSteps = [6, 7, 8, 9]; // Pengalaman Kerja, Ekspektasi Kerja, CV Upload, and Foto Profile are optional

export type OnboardingData = {
  // Step 1: Informasi Dasar
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  
  // Step 2: Informasi Lanjutan
  tanggalLahir: string;
  tempatLahir: string;
  jenisKelamin?: "Laki-laki" | "Perempuan" | "Lainnya";
  
  // Step 3: Alamat
  alamat?: {
    kota?: string;
    provinsi?: string;
    kodePos?: string;
    jalan?: string;
  };
  
  // Step 4: Pendidikan
  pendidikan: Pendidikan[];
  
  // Step 5: Level Pengalaman
  levelPengalaman?: string;
  
  // Step 6: Pengalaman Kerja
  pengalamanKerja: PengalamanKerja[];
  
  // Step 7: Ekspektasi Kerja
  ekspektasiKerja?: EkspektasiKerja;
  
  // Step 8: CV Upload
  cvFile?: File;
  cvFileUrl?: string;
  
  // Step 9: Profile Photo
  profilePhotoFile?: File;
  profilePhotoUrl?: string;
};

const initialData: OnboardingData = {
  namaLengkap: "",
  email: "",
  nomorTelepon: "",
  tempatLahir: "",
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
  ekspektasiKerja: undefined,
  profilePhotoUrl: undefined,
};

type OnboardingContextType = {
  data: OnboardingData;
  setFormValues: (stepName: keyof OnboardingData, values: any) => void;
  updateFormValues: (values: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  getStepValidationErrors: (step: number) => Record<string, string>;
  isLoading: boolean;
  completedSteps: number[];
  navigateToNextStep: () => void;
  navigateToPreviousStep: () => void;
  navigateToStep: (step: number) => void;
  getStepById: (id: number) => typeof onboardingSteps[0] | undefined;
  getStepPath: (id: number) => string | undefined;
  isOptionalStep: (step: number) => boolean;
  saveCurrentStepData: () => Promise<boolean>;
  isSaving: boolean;
  saveError: string | null;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  // Load saved data from API when the context initializes
  useEffect(() => {
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
            ...prevData,
            ...result.data
          }));
        }
        
        // Use the completedSteps from whichever source is more complete
        const fromStatus = statusResult.completedSteps || [];
        const fromOnboarding = result.completedSteps || [];
        
        // Choose the array with more completed steps to ensure we don't lose progress
        const mergedCompletedSteps = fromStatus.length >= fromOnboarding.length 
          ? fromStatus 
          : fromOnboarding;
          
        if (mergedCompletedSteps.length > 0) {
          setCompletedSteps(mergedCompletedSteps);
        }
        
        // Set the current step based on the check-onboarding response
        // This ensures consistent step navigation
        if (statusResult.currentStep) {
          setCurrentStep(statusResult.currentStep);
        } else {
          // Fallback to calculating the step from completed steps
          // Find the first incomplete required step
          for (let i = 1; i <= 5; i++) {
            if (!mergedCompletedSteps.includes(i)) {
              setCurrentStep(i);
              return;
            }
          }
          
          // If all required steps are complete, look for incomplete optional steps
          for (let i = 6; i <= 9; i++) {
            if (!mergedCompletedSteps.includes(i)) {
              setCurrentStep(i);
              return;
            }
          }
          
          // If all steps are completed, go to the last step (summary)
          setCurrentStep(onboardingSteps.length);
        }
      } catch (error) {
        console.error("Error loading onboarding data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, []);

  const setFormValues = (stepName: keyof OnboardingData, values: any) => {
    setData((prev) => ({
      ...prev,
      [stepName]: values,
    }));
  };

  const updateFormValues = (values: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const isStepComplete = (step: number): boolean => {
    // First check if step is already in completedSteps
    if (completedSteps.includes(step)) {
      return true;
    }
    
    switch (step) {
      case 1: // Informasi Dasar
        return !!data.namaLengkap && !!data.email && !!data.nomorTelepon;
      case 2: // Informasi Lanjutan
        return !!data.tanggalLahir && !!data.tempatLahir;
      case 3: // Alamat
        return !!data.alamat?.kota;
      case 4: // Pendidikan
        return data.pendidikan.length > 0 && 
          data.pendidikan.every(p => !!p.namaInstitusi && !!p.lokasi && !!p.jenjangPendidikan && !!p.bidangStudi && !!p.tanggalLulus);
      case 5: // Level Pengalaman
        return !!data.levelPengalaman;
      case 6: // Pengalaman Kerja
        // Optional step - it's valid to have no experience if the preceding step is complete
        return isStepComplete(5);
      case 7: // Ekspektasi Kerja
        // Optional step
        return isStepComplete(5);
      case 8: // CV Upload
        return isStepComplete(5); // Optional but depends on level pengalaman
      case 9: // Profile Photo
        return isStepComplete(5); // Optional but depends on level pengalaman
      case 10: // Ringkasan
        // All required steps must be completed
        return [1, 2, 3, 4, 5].every(s => isStepComplete(s));
      default:
        return false;
    }
  };

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
        if (!data.tempatLahir) errors.tempatLahir = "Tempat lahir wajib diisi";
        break;
      case 3: // Alamat
        if (!data.alamat?.kota) errors.kota = "Kota wajib diisi";
        if (!data.alamat?.provinsi) errors.provinsi = "Provinsi wajib diisi";
        break;
      case 4: // Pendidikan
        if (data.pendidikan.length === 0) {
          errors.pendidikan = "Minimal satu pendidikan harus diisi";
        } else {
          const pendidikanErrors = data.pendidikan.map((p, i) => {
            const itemErrors: Record<string, string> = {};
            if (!p.namaInstitusi) itemErrors.namaInstitusi = "Nama institusi wajib diisi";
            if (!p.lokasi) itemErrors.lokasi = "Lokasi wajib diisi";
            if (!p.jenjangPendidikan) itemErrors.jenjangPendidikan = "Jenjang pendidikan wajib diisi";
            if (!p.bidangStudi) itemErrors.bidangStudi = "Bidang studi wajib diisi";
            if (!p.tanggalLulus) itemErrors.tanggalLulus = "Tanggal lulus wajib diisi";
            return Object.keys(itemErrors).length > 0 ? { index: i, errors: itemErrors } : null;
          }).filter(Boolean);
          
          if (pendidikanErrors.length > 0) {
            errors.pendidikanDetails = JSON.stringify(pendidikanErrors);
          }
        }
        break;
      case 5: // Level Pengalaman
        if (!data.levelPengalaman) errors.levelPengalaman = "Level pengalaman wajib diisi";
        break;
      case 6: // Pengalaman Kerja (optional)
        if (data.pengalamanKerja.length > 0) {
          const pengalamanErrors = data.pengalamanKerja.map((p, i) => {
            const itemErrors: Record<string, string> = {};
            if (!p.namaPerusahaan) itemErrors.namaPerusahaan = "Nama perusahaan wajib diisi";
            if (!p.posisi) itemErrors.posisi = "Posisi wajib diisi";
            if (!p.tanggalMulai) itemErrors.tanggalMulai = "Tanggal mulai wajib diisi";
            if (!p.tanggalSelesai) itemErrors.tanggalSelesai = "Tanggal selesai wajib diisi";
            return Object.keys(itemErrors).length > 0 ? { index: i, errors: itemErrors } : null;
          }).filter(Boolean);
          
          if (pengalamanErrors.length > 0) {
            errors.pengalamanDetails = JSON.stringify(pengalamanErrors);
          }
        }
        break;
    }
    
    return errors;
  };

  // Save current step data to the backend
  const saveCurrentStepData = async (): Promise<boolean> => {
    try {
      // Clear any previous errors
      setSaveError(null);
      setIsSaving(true);
      
      // Get step-specific data to save
      let stepData: Record<string, any> = {};
      
      switch (currentStep) {
        case 1: // Informasi Dasar
          stepData = {
            namaLengkap: data.namaLengkap,
            email: data.email,
            nomorTelepon: data.nomorTelepon
          };
          break;
          
        case 2: // Informasi Lanjutan
          stepData = {
            tanggalLahir: data.tanggalLahir,
            tempatLahir: data.tempatLahir,
            jenisKelamin: data.jenisKelamin
          };
          break;
          
        case 3: // Alamat
          stepData = {
            alamat: data.alamat
          };
          break;
          
        case 4: // Pendidikan
          stepData = {
            pendidikan: data.pendidikan
          };
          break;
          
        case 5: // Level Pengalaman
          stepData = {
            levelPengalaman: data.levelPengalaman
          };
          break;
          
        case 6: // Pengalaman Kerja
          stepData = {
            pengalamanKerja: data.pengalamanKerja
          };
          break;
          
        case 7: // Ekspektasi Kerja
          stepData = {
            ekspektasiKerja: data.ekspektasiKerja
          };
          break;
          
        case 8: // CV Upload
          stepData = {
            cvFileUrl: data.cvFileUrl
          };
          break;
          
        case 9: // Profile Photo
          stepData = {
            profilePhotoUrl: data.profilePhotoUrl
          };
          break;
          
        case 10: // Ringkasan
          // For the final step, include all data
          stepData = { ...data };
          // Remove non-serializable files
          delete stepData.cvFile;
          delete stepData.profilePhotoFile;
          break;
      }
      
      // Validate the data before sending - ONLY validate current step data
      const errors = getStepValidationErrors(currentStep);
      
      // For non-optional steps, prevent saving if there are validation errors
      if (Object.keys(errors).length > 0 && !isOptionalStep(currentStep)) {
        setSaveError(`Harap perbaiki kesalahan berikut: ${Object.values(errors).join(', ')}`);
        setIsSaving(false);
        return false;
      }
      
      // For optional steps, if it's empty, consider it valid
      if (isOptionalStep(currentStep) && Object.keys(stepData).length === 0) {
        setIsSaving(false);
        return true;
      }
      
      // Validate required fields before sending to the API
      if (currentStep === 1) {
        if (!stepData.namaLengkap || !stepData.email || !stepData.nomorTelepon) {
          setSaveError("Nama lengkap, email, dan nomor telepon wajib diisi");
          setIsSaving(false);
          return false;
        }
        
        // Basic email validation before sending to API
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(stepData.email)) {
          setSaveError("Format email tidak valid");
          setIsSaving(false);
          return false;
        }
        
        // Basic phone number validation before sending to API
        const phonePattern = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
        if (!phonePattern.test(stepData.nomorTelepon)) {
          setSaveError("Format nomor telepon Indonesia tidak valid");
          setIsSaving(false);
          return false;
        }
      }
      
      // Make the API call
      try {
        console.log(`Sending data for step ${currentStep}:`, stepData);
        const response = await fetch("/api/job-seeker/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            step: currentStep,
            data: stepData
          }),
        });
        
        // Get the response data regardless of status code
        let responseData;
        try {
          responseData = await response.json();
        } catch (parseError) {
          console.error("Error parsing API response:", parseError);
          setSaveError("Invalid response from server");
          setIsSaving(false);
          return false;
        }
        
        if (!response.ok) {
          console.error(`API error (${response.status}):`, responseData);
          
          // Check if the error is due to specific validation issues
          if (responseData.error && typeof responseData.error === 'string') {
            if (responseData.error.includes("validation")) {
              setSaveError(`Validasi gagal: ${responseData.message || "Silakan periksa data Anda"}`);
            } else {
              setSaveError(`${responseData.error}: ${responseData.message || response.statusText}`);
            }
          } else {
            setSaveError(`Failed to save data: ${response.statusText}`);
          }
          
          setIsSaving(false);
          return false;
        }
        
        // Parse and handle the response
        if (!responseData) {
          setSaveError("No data received from the server");
          setIsSaving(false);
          return false;
        }
        
        // Update the completed steps if provided
        if (responseData.completedSteps) {
          setCompletedSteps(responseData.completedSteps);
        }
        
        // Update current step if provided and it's different
        if (responseData.currentStep && responseData.currentStep !== currentStep) {
          setCurrentStep(responseData.currentStep);
          
          // Navigate to the new step
          const nextStepConfig = getStepById(responseData.currentStep);
          if (nextStepConfig) {
            setTimeout(() => {
              router.push(nextStepConfig.path);
            }, 100);
          }
        }
        
        // Update the data store if updated data is provided
        if (responseData.data) {
          setData(prevData => ({
            ...prevData,
            ...responseData.data
          }));
        }
        
        setIsSaving(false);
        return true;
      } catch (error: any) {
        console.error("Network error saving data:", error);
        setSaveError(error.message || "Network error occurred. Please check your connection.");
        setIsSaving(false);
        return false;
      }
    } catch (error: any) {
      console.error("Error in saveCurrentStepData:", error);
      setSaveError(error.message || "An unknown error occurred while saving your data");
      setIsSaving(false);
      return false;
    }
  };

  const getStepById = (id: number) => {
    return onboardingSteps.find(step => step.id === id);
  };
  
  const getStepPath = (id: number) => {
    const step = getStepById(id);
    return step?.path;
  };
  
  const isOptionalStep = (step: number) => {
    return optionalSteps.includes(step);
  };
  
  const navigateToNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= onboardingSteps.length) {
      setCurrentStep(nextStep);
      const path = getStepPath(nextStep);
      if (path) {
        router.push(path);
      }
    }
  };
  
  const navigateToPreviousStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      const path = getStepPath(prevStep);
      if (path) {
        router.push(path);
      }
    }
  };
  
  const navigateToStep = (step: number) => {
    if (step >= 1 && step <= onboardingSteps.length) {
      // Only allow navigation to completed steps or the current step + 1
      const canNavigate = step <= Math.max(...completedSteps, 1) + 1 || isOptionalStep(step);
      
      if (canNavigate) {
        setCurrentStep(step);
        const path = getStepPath(step);
        if (path) {
          router.push(path);
        }
      }
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setFormValues,
        updateFormValues,
        currentStep,
        setCurrentStep,
        isStepComplete,
        getStepValidationErrors,
        isLoading,
        completedSteps,
        navigateToNextStep,
        navigateToPreviousStep,
        navigateToStep,
        getStepById,
        getStepPath,
        isOptionalStep,
        saveCurrentStepData,
        isSaving,
        saveError
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