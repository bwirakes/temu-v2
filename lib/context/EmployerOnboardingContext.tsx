"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect 
} from "react";
import { z } from "zod";
import { usePathname, useRouter } from "next/navigation";

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
  industri: z.string().optional(),
  alamatKantor: z.string().optional(),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
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
  industri?: string;
  alamatKantor?: string;
  email: string;
  
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
  email: "",
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
  saveError: string | null;
  allowedSteps: number[];
  canNavigateToStep: (step: number) => boolean;
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [allowedSteps, setAllowedSteps] = useState<number[]>([1]);
  const pathname = usePathname();
  const router = useRouter();

  // Load saved data from API on initial mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const loadDataFromAPI = async () => {
        try {
          console.log('EmployerOnboardingContext: Fetching onboarding data from API');
          
          // First try to fetch from API
          const response = await fetch('/api/employer/check-onboarding', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          });
          
          if (response.ok) {
            const apiData = await response.json();
            console.log('EmployerOnboardingContext: Loaded data from API:', apiData);
            
            // If API returns saved onboarding data, use it
            if (apiData.data) {
              console.log('EmployerOnboardingContext: Setting form data from API');
              // Deep clone the data to avoid reference issues
              const apiDataCopy = JSON.parse(JSON.stringify(apiData.data));
              setData(prevData => ({
                ...prevData,
                ...apiDataCopy
              }));
            }
            
            // Update current step based on API response
            if (apiData.currentStep) {
              console.log(`EmployerOnboardingContext: Setting current step to ${apiData.currentStep}`);
              setCurrentStep(apiData.currentStep);
            }
            
            // Update allowed steps if provided
            if (apiData.allowedSteps && Array.isArray(apiData.allowedSteps)) {
              console.log(`EmployerOnboardingContext: Setting allowed steps to ${apiData.allowedSteps.join(', ')}`);
              setAllowedSteps(apiData.allowedSteps);
            }
            
            // Handle redirection if needed
            if (apiData.redirectTo && pathname) {
              // Check if we should redirect based on path/step mismatch
              if (pathname !== apiData.redirectTo && !pathname.includes(apiData.redirectTo)) {
                console.log(`EmployerOnboardingContext: Path mismatch - current: ${pathname}, should be: ${apiData.redirectTo}`);
                
                // This allows the effect to run and update local state before redirecting
                setTimeout(() => {
                  console.log(`EmployerOnboardingContext: Redirecting to ${apiData.redirectTo}`);
                  router.push(apiData.redirectTo);
                }, 100);
              } else {
                console.log(`EmployerOnboardingContext: URL already matches step, no redirect needed`);
              }
            }
            
            return; // Successfully loaded from API
          } else {
            // Handle API errors
            console.error('EmployerOnboardingContext: API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error(errorText);
            
            // Fall back to localStorage on error
            fallbackToLocalStorage();
          }
          
        } catch (error) {
          console.error('EmployerOnboardingContext: Error loading onboarding data from API:', error);
          // Fall back to localStorage on error
          fallbackToLocalStorage();
        }
      };
      
      const fallbackToLocalStorage = () => {
        console.log('EmployerOnboardingContext: Falling back to localStorage');
        const savedData = localStorage.getItem('employerOnboardingData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('EmployerOnboardingContext: Data found in localStorage:', parsedData);
            
            // Only update file-related fields if they exist in localStorage
            if (!parsedData.logo && data.logo) {
              parsedData.logo = data.logo;
            }
            
            setData(prevData => ({
              ...prevData,
              ...parsedData
            }));
            
            // Also try to infer current step from the URL
            if (pathname && pathToStepMap[pathname]) {
              console.log(`EmployerOnboardingContext: Setting step to ${pathToStepMap[pathname]} based on URL`);
              setCurrentStep(pathToStepMap[pathname]);
              setAllowedSteps([pathToStepMap[pathname]]);
            }
          } catch (error) {
            console.error('EmployerOnboardingContext: Error parsing saved onboarding data:', error);
          }
        } else {
          console.log('EmployerOnboardingContext: No data found in localStorage');
        }
      };
      
      // Load data from API or fallback to localStorage
      loadDataFromAPI();
    }
  }, [pathname, router, data.logo]);

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
        return !!data.namaPerusahaan && !!data.email;
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
        if (!data.email) {
          errors.email = "Email wajib diisi";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.email = "Format email tidak valid";
        }
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
    setSaveError(null);
    
    try {
      // Deep clone the data object to avoid reference issues
      const currentData = JSON.parse(JSON.stringify(data));
      
      // Determine which form data to save based on current step
      let formData: Record<string, any> = {};
      
      if (currentStep === 1) {
        formData = {
          namaPerusahaan: currentData.namaPerusahaan,
          merekUsaha: currentData.merekUsaha,
          industri: currentData.industri || "",
          alamatKantor: currentData.alamatKantor || "",
          email: currentData.email,
        };
      } else if (currentStep === 2) {
        formData = {
          website: currentData.website,
          socialMedia: currentData.socialMedia,
          logoUrl: currentData.logoUrl,
        };
      } else if (currentStep === 3) {
        formData = {
          pic: currentData.pic,
        };
      } else if (currentStep === 4) {
        // For the final step, include all data
        formData = { ...currentData };
        delete formData.logo; // Remove non-serializable file
      }

      // Include the current step in the data being sent
      const dataToSave = {
        ...formData,
        currentStep
      };

      // Perform basic validation before saving
      const errors: Record<string, string> = getStepValidationErrors(currentStep);
      
      if (Object.keys(errors).length > 0) {
        // Use setSaveError instead of console.error
        setSaveError(`Harap perbaiki kesalahan berikut: ${Object.values(errors).join(', ')}`);
        setIsSaving(false);
        return false;
      }

      // Only proceed if we have data to save
      if (Object.keys(formData).length > 0) {
        // Determine endpoint based on current step
        const endpoint = currentStep < 4 
          ? '/api/employer/onboarding/save-progress'
          : '/api/employer/onboarding';
          
        // Make the API call
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave),
            signal: controller.signal,
            cache: 'no-store'
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            setSaveError(`Failed to save data: ${response.status} ${response.statusText}`);
            
            setIsSaving(false);
            return false;
          }
          
          // Parse and handle the response
          const result = await response.json();
          
          // Check if we should advance to the next step
          if (result.data?.shouldAdvance && result.data.currentStep > currentStep) {
            setCurrentStep(result.data.currentStep);
            
            // Update allowed steps if provided
            if (result.data.allowedSteps) {
              setAllowedSteps(result.data.allowedSteps);
            } else {
              // Default to adding the new step to allowed steps
              setAllowedSteps(prev => Array.from(new Set([...prev, result.data.currentStep])).sort());
            }
            
            // Redirect to the next step
            const nextStepPaths = [
              '/employer/onboarding/informasi-perusahaan',
              '/employer/onboarding/kehadiran-online',
              '/employer/onboarding/penanggung-jawab',
              '/employer/onboarding/konfirmasi'
            ];
            
            if (result.data.currentStep <= nextStepPaths.length) {
              setTimeout(() => {
                router.push(nextStepPaths[result.data.currentStep - 1]);
              }, 100);
            }
          }
          
          setIsSaving(false);
          return true;
        } catch (fetchError: any) {
          // Handle network errors
          if (fetchError.name === 'AbortError') {
            setSaveError('Request timed out. Please try again.');
          } else {
            setSaveError(fetchError.message || 'Network error occurred. Please check your connection.');
          }
          
          setIsSaving(false);
          return false;
        }
      }
      
      setIsSaving(false);
      return true;
    } catch (error: any) {
      setSaveError(error.message || 'An unknown error occurred');
      setIsSaving(false);
      
      return false;
    }
  };

  // Check if a step is allowed to be navigated to
  const canNavigateToStep = (step: number): boolean => {
    return allowedSteps.includes(step);
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
        isSaving,
        saveError,
        allowedSteps,
        canNavigateToStep
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