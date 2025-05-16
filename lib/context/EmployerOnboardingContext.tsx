"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect 
} from "react";
import { z } from "zod";
import { usePathname } from "next/navigation";

// Define types for our form data
export type SocialMedia = {
  website?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
};

export type PIC = {
  nama: string;
  nomorTelepon: string;
};

// Schema for validation
export const informasiPerusahaanSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  merekUsaha: z.string().optional(),
  industri: z.string().min(1, "Industri wajib diisi"),
  alamatKantor: z.string().min(1, "Alamat kantor wajib diisi"),
});

export const kehadiranOnlineSchema = z.object({
  website: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
});

export const logoPerusahaanSchema = z.object({
  logo: z.instanceof(File).optional(),
});

export const picSchema = z.object({
  nama: z.string().min(1, "Nama PIC wajib diisi"),
  nomorTelepon: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor telepon Indonesia tidak valid"
    ),
});

export type EmployerOnboardingData = {
  // Step 1: Informasi Dasar Badan Usaha
  namaPerusahaan: string;
  merekUsaha?: string;
  industri: string;
  alamatKantor: string;
  
  // Step 2: Kehadiran Online dan Identitas Merek
  website?: string;
  socialMedia?: SocialMedia;
  logo?: File;
  logoUrl?: string;
  
  // Step 3: Penanggung Jawab (PIC)
  pic: PIC;
  
  // Step 4: Konfirmasi (review)
  isConfirmed?: boolean;
};

const initialData: EmployerOnboardingData = {
  namaPerusahaan: "",
  merekUsaha: "",
  industri: "",
  alamatKantor: "",
  website: "",
  socialMedia: {
    instagram: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    tiktok: "",
  },
  pic: {
    nama: "",
    nomorTelepon: "",
  },
  isConfirmed: false,
};

type EmployerOnboardingContextType = {
  data: EmployerOnboardingData;
  setFormValues: (stepName: keyof EmployerOnboardingData, values: any) => void;
  updateFormValues: (values: Partial<EmployerOnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  getStepValidationErrors: (step: number) => Record<string, string>;
  saveCurrentStepData: () => Promise<boolean>;
  isSaving: boolean;
};

// Path to step mapping
const pathToStepMap: Record<string, number> = {
  "/employer/onboarding/informasi-perusahaan": 1,
  "/employer/onboarding/kehadiran-online": 2,
  "/employer/onboarding/penanggung-jawab": 3,
  "/employer/onboarding/konfirmasi": 4
};

const EmployerOnboardingContext = createContext<EmployerOnboardingContextType | undefined>(undefined);

export const EmployerOnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<EmployerOnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();

  // Load saved data from localStorage on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('employerOnboardingData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Only update file-related fields if they exist in localStorage
          if (!parsedData.logo && data.logo) {
            parsedData.logo = data.logo;
          }
          setData(prevData => ({
            ...prevData,
            ...parsedData
          }));
        } catch (error) {
          console.error('Error parsing saved onboarding data:', error);
        }
      }

      // Set current step based on the current path
      if (pathname && pathToStepMap[pathname]) {
        setCurrentStep(pathToStepMap[pathname]);
      }
    }
  }, [pathname]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a copy of data without the File object (not serializable)
      const dataToSave = { ...data };
      if (dataToSave.logo instanceof File) {
        delete dataToSave.logo;
      }
      localStorage.setItem('employerOnboardingData', JSON.stringify(dataToSave));
    }
  }, [data]);

  const setFormValues = (stepName: keyof EmployerOnboardingData, values: any) => {
    setData((prev) => ({
      ...prev,
      [stepName]: values,
    }));
  };

  const updateFormValues = (values: Partial<EmployerOnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Informasi Dasar Badan Usaha
        return !!data.namaPerusahaan && !!data.industri && !!data.alamatKantor;
      case 2: // Kehadiran Online dan Identitas Merek (optional, some fields)
        return true;
      case 3: // Penanggung Jawab (PIC)
        return !!data.pic?.nama && !!data.pic?.nomorTelepon;
      case 4: // Konfirmasi (review)
        return true;
      default:
        return false;
    }
  };

  const getStepValidationErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Informasi Dasar Badan Usaha
        if (!data.namaPerusahaan) errors.namaPerusahaan = "Nama perusahaan wajib diisi";
        if (!data.industri) errors.industri = "Industri wajib diisi";
        if (!data.alamatKantor) errors.alamatKantor = "Alamat kantor wajib diisi";
        break;
      case 2: // Kehadiran Online dan Identitas Merek (optional)
        // URL validation removed - accepting any format now
        break;
      case 3: // Penanggung Jawab (PIC)
        if (!data.pic?.nama) errors.nama = "Nama PIC wajib diisi";
        if (!data.pic?.nomorTelepon) {
          errors.nomorTelepon = "Nomor telepon PIC wajib diisi";
        } else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(data.pic.nomorTelepon)) {
          errors.nomorTelepon = "Format nomor telepon Indonesia tidak valid";
        }
        break;
      case 4: // Konfirmasi (review)
        break;
      default:
        break;
    }
    
    return errors;
  };

  // Save current step data to API
  const saveCurrentStepData = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Create a base data object that always includes currentStep
      const baseData = { currentStep };
      
      // Determine which form data to save based on current step
      let formData: Partial<EmployerOnboardingData> = {};
      
      if (currentStep === 1) {
        formData = {
          namaPerusahaan: data.namaPerusahaan,
          merekUsaha: data.merekUsaha,
          industri: data.industri,
          alamatKantor: data.alamatKantor,
        };
      } else if (currentStep === 2) {
        formData = {
          website: data.website,
          socialMedia: data.socialMedia,
          logoUrl: data.logoUrl,
        };
      } else if (currentStep === 3) {
        formData = {
          pic: data.pic,
        };
      } else if (currentStep === 4) {
        // For the final step, include all data
        formData = { ...data };
      }

      // Combine the form data with the base data that includes currentStep
      const dataToSave = {
        ...formData,
        ...baseData
      };

      // Only proceed if we have data to save
      if (Object.keys(formData).length > 0) {
        console.log(`Saving data for step ${currentStep}:`, dataToSave);
        
        // Determine endpoint based on current step
        const endpoint = currentStep < 4 
          ? '/api/employer/onboarding/save-progress'
          : '/api/employer/onboarding';
          
        // Make the API call
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          setIsSaving(false);
          
          // Allow flow to continue despite API errors in development
          return true;
        }
        
        // Parse and log the response data
        const result = await response.json();
        console.log('Save response:', result);
        
        setIsSaving(false);
        return true;
      }
      
      console.warn('No data to save for current step:', currentStep);
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error('Error saving employer onboarding data:', error);
      setIsSaving(false);
      
      // Allow flow to continue despite errors in development
      return true;
    }
  };

  return (
    <EmployerOnboardingContext.Provider
      value={{
        data,
        setFormValues,
        updateFormValues,
        currentStep,
        setCurrentStep,
        isStepComplete,
        getStepValidationErrors,
        saveCurrentStepData,
        isSaving
      }}
    >
      {children}
    </EmployerOnboardingContext.Provider>
  );
};

export const useEmployerOnboarding = () => {
  const context = useContext(EmployerOnboardingContext);
  if (context === undefined) {
    throw new Error("useEmployerOnboarding must be used within an EmployerOnboardingProvider");
  }
  return context;
}; 