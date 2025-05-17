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

// Import for database operations
import { db, jobApplications, applicationStatusEnum } from "@/lib/db";

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
  coverLetter?: string;
  education?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3";
  resume?: File;
  resumeUrl?: string;
  
  // Additional Information
  additionalNotes?: string;
  
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
  coverLetter: z.string().min(50, { message: "Surat lamaran minimal 50 karakter" })
    .max(2000, { message: "Surat lamaran maksimal 2000 karakter" })
    .optional(),
  education: z.enum(["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"], {
    required_error: "Pendidikan terakhir harus dipilih",
  }).optional(),
  additionalNotes: z.string().optional(),
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
  coverLetter: "",
  education: undefined,
  additionalNotes: "",
  agreeToTerms: false,
  shareData: false,
  status: "DRAFT",
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
export const JobApplicationProvider = ({ children, jobId }: { children: ReactNode; jobId: string }) => {
  const router = useRouter();
  const [data, setData] = useState<JobApplicationData>({
    ...initialData,
    jobId: jobId,
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
        coverLetter: data.coverLetter || "",
        resumeUrl: data.resumeUrl || "",
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
      throw new Error("Failed to save application");
    }
  }, [data]);

  // Submit application with database save
  const submitApplication = useCallback(async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      return Promise.reject(errors);
    }

    setIsSubmitting(true);

    try {
      // In a real app with a full database setup, we would use the user's actual profile ID
      // For our current implementation, the API handles linking to the user via session
      // So we'll just pass a placeholder ID that the server will override
      const applicantProfileId = "current-user"; 
      
      // Save to database and get reference code
      const { referenceCode } = await saveApplicationToDatabase(applicantProfileId);
      
      // Navigate to the success page with the reference code
      router.push(`/job-seeker/job-application/success?reference=${referenceCode}`);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error submitting application:", error);
      return Promise.reject({ form: "Failed to submit application. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validate, router, saveApplicationToDatabase]);

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
