"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback
} from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Import for database operations - using db-types for client safety
import { applicationStatusEnum } from "@/lib/db-types";

// Import job application service
import { jobApplicationService } from "@/lib/services/JobApplicationService";

/**
 * Job Application Types
 */
export type JobApplicationData = {
  // Job-related information
  jobId: string;
  
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  
  // Application Details
  education?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3";
  resume?: File;
  resumeUrl?: string;
  cvFileUrl?: string; // URL to the job seeker's CV file
  
  // Additional Information
  additionalNotes: string;
  
  // Application preferences
  agreeToTerms: boolean;
  shareData?: boolean; // Whether to use saved CV data
  
  // Application status
  status?: "DRAFT" | "SUBMITTED" | "REVIEWING" | "INTERVIEW" | "OFFERED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  
  // Submission information
  submittedAt?: Date;
  referenceCode?: string;
};

// Validation schema for job application
export const jobApplicationSchema = z.object({
  jobId: z.string().min(1, { message: "Job ID is required" }),
  fullName: z.string().min(3, { message: "Nama lengkap harus diisi minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  phone: z.string().min(10, { message: "Nomor telepon minimal 10 digit" }),
  education: z.enum(["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"], {
    required_error: "Pendidikan terakhir harus dipilih",
  }).optional(),
  additionalNotes: z.string()
    .max(2000, { message: "Informasi tambahan maksimal 2000 karakter" })
    .optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "Anda harus menyetujui syarat dan ketentuan",
  }),
  shareData: z.boolean().optional(),
});

// Initial data structure
const initialData: JobApplicationData = {
  jobId: "",
  fullName: "",
  email: "",
  phone: "",
  education: undefined,
  additionalNotes: "",
  agreeToTerms: false,
  shareData: false,
  status: "DRAFT",
  cvFileUrl: "", // Initialize with empty string
};

// Context type definition
type JobApplicationContextType = {
  data: JobApplicationData;
  isSubmitting: boolean;
  updateForm: (values: Partial<JobApplicationData>) => void;
  validate: () => Record<string, string>;
  submitApplication: () => Promise<void>;
  clearForm: () => void;
  saveApplicationToDatabase: (applicantProfileId: string) => Promise<{ id: string, referenceCode: string }>;
};

// Create the context
const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

// Context provider component
export const JobApplicationProvider = ({ 
  children, 
  jobId,
  profileData 
}: { 
  children: ReactNode; 
  jobId: string;
  profileData?: {
    fullName?: string;
    email?: string;
    phone?: string;
    cvFileUrl?: string;
    education?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3";
  }
}) => {
  const router = useRouter();
  const [data, setData] = useState<JobApplicationData>({
    ...initialData,
    jobId: jobId,
    // Initialize with profile data if available
    ...(profileData ? {
      fullName: profileData.fullName || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      cvFileUrl: profileData.cvFileUrl || "",
      education: profileData.education,
      // If profile data is provided, default shareData to true
      shareData: profileData.cvFileUrl ? true : false,
    } : {})
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values
  const updateForm = useCallback((values: Partial<JobApplicationData>) => {
    setData((prev) => ({
      ...prev,
      ...values,
    }));
  }, []);

  // Validate form data
  const validate = useCallback((): Record<string, string> => {
    try {
      jobApplicationSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to key-value pairs
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            const path = err.path.join('.');
            formattedErrors[path] = err.message;
          }
        });
        return formattedErrors;
      }
      return { form: "Form validation failed" };
    }
  }, [data]);

  // Save application to database
  const saveApplicationToDatabase = useCallback(async (applicantProfileId: string) => {
    if (!data.jobId) {
      throw new Error("Job ID is required");
    }

    try {
      // Use our JobApplicationService to save the application via API
      const result = await jobApplicationService.saveApplicationViaAPI(data.jobId, {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        additionalNotes: data.additionalNotes || " ", // Ensure we always have some value
        education: data.education,
        resumeUrl: data.resumeUrl || "",
        cvFileUrl: data.cvFileUrl || "", // Explicitly include cvFileUrl
      });
      
      // Update local state with the response from the API
      setData(prev => ({
        ...prev,
        status: "SUBMITTED",
        submittedAt: new Date(),
        referenceCode: result.referenceCode,
      }));
      
      return { 
        id: result.application.id as string, 
        referenceCode: result.referenceCode 
      };
      
    } catch (error) {
      console.error("Error saving application to database:", error);
      // Preserve the original error for better debugging
      throw error instanceof Error 
        ? error 
        : new Error("Failed to save application");
    }
  }, [data]);

  // Submit application with database save
  const submitApplication = useCallback(async () => {
    // Validate form
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      return Promise.reject(errors);
    }

    try {
      setIsSubmitting(true);
      
      // Get profile ID
      const res = await fetch('/api/job-seeker/profile');
      if (!res.ok) {
        throw new Error("Failed to get profile");
      }
      
      const { id: applicantProfileId } = await res.json();
      
      // Save application
      const { referenceCode } = await saveApplicationToDatabase(applicantProfileId);
      
      // DIRECT NAVIGATION: Most reliable way to navigate without router interference
      if (typeof window !== 'undefined') {
        // Use location.replace to ensure no history entry is created
        window.location.replace(`/job-seeker/job-application/success?reference=${referenceCode}`);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error:", error);
      return Promise.reject({ 
        form: error instanceof Error ? error.message : "Failed to submit"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, saveApplicationToDatabase]);

  // Clear form data
  const clearForm = useCallback(() => {
    setData({
      ...initialData,
      jobId: data.jobId, // Preserve the job ID
    });
  }, [data.jobId]);

  return (
    <JobApplicationContext.Provider
      value={{
        data,
        isSubmitting,
        updateForm,
        validate,
        submitApplication,
        clearForm,
        saveApplicationToDatabase,
      }}
    >
      {children}
    </JobApplicationContext.Provider>
  );
};

// Custom hook to use the context
export const useJobApplication = () => {
  const context = useContext(JobApplicationContext);
  if (context === undefined) {
    throw new Error("useJobApplication must be used within a JobApplicationProvider");
  }
  return context;
}; 
