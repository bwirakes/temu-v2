"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect,
  useCallback
} from "react";
import { z } from "zod";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

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

// Define step paths for navigation
const stepPaths = [
  "/employer/onboarding/informasi-perusahaan",
  "/employer/onboarding/kehadiran-online",
  "/employer/onboarding/penanggung-jawab",
  "/employer/onboarding/konfirmasi",
];

// Zod schemas by step for validation
const stepSchemas = [
  informasiPerusahaanSchema,
  kehadiranOnlineSchema,
  picSchema,
  z.object({}).optional(), // No validation for confirmation step
];

// LocalStorage key for saving form data
const STORAGE_KEY = "employer_onboarding_data";

interface EmployerOnboardingContextType {
  data: Partial<EmployerOnboardingData>;
  setFormValues: (values: Partial<EmployerOnboardingData>) => void;
  updateFormValues: (values: Partial<EmployerOnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  proceedToNextStep: (stepData: Partial<EmployerOnboardingData>) => Promise<boolean>;
  isSaving: boolean;
  saveError: string | null;
  allowedSteps: number[];
  canNavigateToStep: (step: number) => boolean;
  isLoadingInitialData: boolean;
}

const EmployerOnboardingContext = createContext<EmployerOnboardingContextType | undefined>(undefined);

export const EmployerOnboardingProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize with localStorage data if available
  const [data, setData] = useState<Partial<EmployerOnboardingData>>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : {};
    }
    return {};
  });
  
  const [currentStep, setCurrentStepState] = useState<number>(1);
  const [allowedSteps, setAllowedSteps] = useState<number[]>([1]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(data).length > 0) {
      const dataToSave = { ...data };
      // Remove File objects which can't be serialized
      if (dataToSave.logo instanceof File) {
        delete dataToSave.logo;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [data]);

  // Get the current step from the pathname
  const getCurrentStepFromPath = useCallback((path: string): number => {
    const index = stepPaths.findIndex(stepPath => path === stepPath);
    return index !== -1 ? index + 1 : 0; // Return 0 if not found
  }, []);

  // Fetch initial onboarding status - only check if onboarding is completed
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      setIsLoadingInitialData(true);
      try {
        const response = await fetch("/api/employer/check-onboarding");
        if (!response.ok) {
          throw new Error("Failed to fetch onboarding status");
        }
        const status = await response.json();

        // If onboarding is completed and user is on an onboarding page, redirect to dashboard
        if (status.completed && pathname.startsWith("/employer/onboarding")) {
          router.replace("/employer/dashboard");
          return; 
        }
        
        // If onboarding is not completed, initialize the form state
        // Get the current step from the pathname or use the default
        let initialStep = 1;
        const currentPathStep = getCurrentStepFromPath(pathname);
        if (currentPathStep > 0) {
          initialStep = currentPathStep;
        }
        
        // Initialize allowedSteps based on form data we have
        let initialAllowedSteps = [1];
        
        // If we have data for step 1, allow step 2
        if (data.namaPerusahaan && data.email) {
          initialAllowedSteps.push(2);
        }
        
        // If we have data for step 2 (optional), allow step 3
        if (initialAllowedSteps.includes(2)) {
          initialAllowedSteps.push(3);
        }
        
        // If we have data for step 3, allow step 4
        if (data.pic?.nama && data.pic?.nomorTelepon) {
          initialAllowedSteps.push(4);
        }
        
        // Update state
        setCurrentStepState(initialStep);
        setAllowedSteps(initialAllowedSteps);
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        toast.error("Gagal memuat status pendaftaran Anda.");
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchOnboardingStatus();
  }, [router, pathname, getCurrentStepFromPath, data]);

  // Update form values (partial update)
  const updateFormValues = useCallback((values: Partial<EmployerOnboardingData>) => {
    setData(prevData => ({ ...prevData, ...values }));
  }, []);

  // Set form values (complete replacement)
  const setFormValues = useCallback((values: Partial<EmployerOnboardingData>) => {
    setData(values);
  }, []);

  // Set current step
  const setCurrentStep = useCallback((step: number) => {
    if (step >= 1 && step <= stepPaths.length) {
      setCurrentStepState(step);
    }
  }, []);

  // Validate current step data before proceeding
  const validateStepData = (stepNumber: number, stepData: Partial<EmployerOnboardingData>): boolean => {
    try {
      if (stepNumber < 1 || stepNumber > stepSchemas.length) {
        return true; // No validation for unknown steps
      }
      
      const schema = stepSchemas[stepNumber - 1];
      if (!schema) return true;
      
      // Special case for PIC validation (step 3)
      if (stepNumber === 3 && stepData.pic) {
        try {
          console.log("Validating PIC data:", stepData.pic);
          // Validate the PIC data directly using the picSchema
          picSchema.parse({
            nama: stepData.pic.nama,
            nomorTelepon: stepData.pic.nomorTelepon
          });
          return true;
        } catch (error) {
          if (error instanceof z.ZodError) {
            const errorMessage = error.errors[0]?.message || "Validasi data PIC gagal";
            toast.error(errorMessage);
            console.error("PIC validation error:", error);
            return false;
          }
          throw error; // Re-throw unexpected errors
        }
      }
      
      // For other steps, validate normally
      schema.parse(stepData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Validasi gagal";
        toast.error(errorMessage);
        console.error("Validation error:", error);
        return false;
      }
      console.error("Unexpected validation error:", error);
      return false;
    }
  };

  // Updated proceedToNextStep - only handles client-side validation and navigation
  const proceedToNextStep = async (stepData: Partial<EmployerOnboardingData>): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);

    try {
      console.log("Proceeding to next step with data:", stepData);
      
      // Validate the current step data
      if (!validateStepData(currentStep, stepData)) {
        setIsSaving(false);
        return false;
      }
      
      // Update the form data with the new step data
      const updatedData = { ...data, ...stepData };
      setData(updatedData);
      
      // Update allowed steps - allow next step if not already allowed
      const nextStep = currentStep + 1;
      if (nextStep <= stepPaths.length && !allowedSteps.includes(nextStep)) {
        const newAllowedSteps = [...allowedSteps, nextStep];
        setAllowedSteps(newAllowedSteps);
      }
      
      // If not on last step, navigate to next step
      if (currentStep < stepPaths.length) {
        const nextStepPath = stepPaths[currentStep]; // Current step index is already next step's index in the array
        setCurrentStepState(nextStep);
        router.push(nextStepPath);
        toast.success("Data disimpan sementara!");
      }
      
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error("Error in proceedToNextStep:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
      toast.error(message);
      setSaveError(message);
      setIsSaving(false);
      return false;
    }
  };

  // Check if a step can be navigated to
  const canNavigateToStep = useCallback((step: number): boolean => {
    return allowedSteps.includes(step);
  }, [allowedSteps]);

  // Show loading state while fetching initial data
  if (isLoadingInitialData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Memuat data pendaftaran...</div>
      </div>
    );
  }

  return (
    <EmployerOnboardingContext.Provider
      value={{
        data,
        setFormValues,
        updateFormValues,
        currentStep,
        setCurrentStep,
        proceedToNextStep,
        isSaving,
        saveError,
        allowedSteps,
        canNavigateToStep,
        isLoadingInitialData,
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