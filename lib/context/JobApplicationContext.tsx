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
  education?: "SMA" | "Diploma" | "S1" | "S2" | "S3";
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
  education: z.enum(["SMA", "Diploma", "S1", "S2", "S3"], {
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
    if (!data.jobId || !applicantProfileId) {
      throw new Error("Job ID and applicant profile ID are required");
    }

    // Generate a reference code if not already set
    const referenceCode = data.referenceCode || `APP-${Math.floor(Math.random() * 900000) + 100000}`;
    
    try {
      // In a real implementation, this would be a server action
      // For now we'll simulate an API call with the structure
      
      /*
      // In a server component or action, you would use:
      const application = await db
        .insert(jobApplications)
        .values({
          applicantProfileId: applicantProfileId,
          jobId: data.jobId,
          status: "SUBMITTED", // Using applicationStatusEnum.SUBMITTED would be better
          coverLetter: data.coverLetter || "",
          resumeUrl: data.resumeUrl || "",
          // Reference code would be stored in a metadata field or separate table
        })
        .returning();
        
      return { id: application.id, referenceCode };
      */
      
      // Mock implementation for client component
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Saved application to database:", {
        applicantProfileId,
        jobId: data.jobId,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
        referenceCode,
      });
      
      // Update local state
      setData(prev => ({
        ...prev,
        status: "SUBMITTED",
        submittedAt: new Date(),
        referenceCode,
      }));
      
      // Return mock data
      return { id: `job-app-${Date.now()}`, referenceCode };
      
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
      // In a real app, we'd get the user's profile ID from auth context
      // For now, we'll use a placeholder
      const applicantProfileId = "mock-profile-id"; 
      
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
