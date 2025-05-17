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
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const router = useRouter();

  // Load saved data from API when the context initializes
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
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
          
          if (result.completedSteps) {
            setCompletedSteps(result.completedSteps);
          }
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
    switch (step) {
      case 1: // Informasi Dasar
        return !!data.namaLengkap && !!data.email && !!data.nomorTelepon;
      case 2: // Informasi Lanjutan
        return !!data.tanggalLahir && !!data.tempatLahir;
      case 3: // Alamat
        return !!data.alamat?.kota;
      case 4: // Pendidikan
        return data.pendidikan.length > 0 && 
          data.pendidikan.every(p => !!p.namaInstitusi && !!p.lokasi && !!p.jenjangPendidikan && !!p.tanggalLulus);
      case 5: // Level Pengalaman
        return !!data.levelPengalaman;
      case 6: // Pengalaman Kerja
        // Optional step - it's valid to have no experience
        return true;
      case 7: // Ekspektasi Kerja
        // Optional step
        return true;
      case 8: // CV Upload
        return true; // Optional
      case 9: // Profile Photo
        return true; // Optional
      case 10: // Ringkasan
        return true; // The final summary page
      default:
        return false;
    }
  };

  // Update completedSteps when steps are completed
  useEffect(() => {
    const newCompletedSteps = [];
    for (let i = 1; i <= 10; i++) {
      if (isStepComplete(i)) {
        newCompletedSteps.push(i);
      }
    }
    
    // Only update if there's a change in completedSteps
    if (JSON.stringify(newCompletedSteps.sort()) !== JSON.stringify(completedSteps.sort())) {
      setCompletedSteps(newCompletedSteps);
    }
  }, [data, isStepComplete]);

  const getStepValidationErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Informasi Dasar
        if (!data.namaLengkap) errors.namaLengkap = "Nama lengkap wajib diisi";
        if (!data.email) errors.email = "Alamat email wajib diisi";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) 
          errors.email = "Format email tidak valid";
        
        if (!data.nomorTelepon) errors.nomorTelepon = "Nomor telepon wajib diisi";
        else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(data.nomorTelepon)) 
          errors.nomorTelepon = "Format nomor telepon tidak valid";
        break;
        
      case 2: // Informasi Lanjutan
        if (!data.tanggalLahir) errors.tanggalLahir = "Tanggal lahir wajib diisi";
        if (!data.tempatLahir) errors.tempatLahir = "Tempat lahir wajib diisi";
        break;
        
      case 3: // Alamat
        if (!data.alamat?.kota) errors.kota = "Kota wajib diisi";
        break;
    }
    
    return errors;
  };

  // Helper function to get step by ID
  const getStepById = (id: number) => {
    return onboardingSteps.find(step => step.id === id);
  };

  // Helper function to get step path by ID
  const getStepPath = (id: number) => {
    const step = getStepById(id);
    return step?.path;
  };

  // Helper function to check if step is optional
  const isOptionalStep = (step: number) => {
    return optionalSteps.includes(step);
  };

  // Navigation functions
  const navigateToNextStep = () => {
    if (currentStep < onboardingSteps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextPath = getStepPath(nextStep);
      if (nextPath) {
        router.push(nextPath);
      }
    }
  };

  const navigateToPreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevPath = getStepPath(prevStep);
      if (prevPath) {
        router.push(prevPath);
      }
    }
  };

  const navigateToStep = (step: number) => {
    if (step >= 1 && step <= onboardingSteps.length) {
      setCurrentStep(step);
      const stepPath = getStepPath(step);
      if (stepPath) {
        router.push(stepPath);
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
        isOptionalStep
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