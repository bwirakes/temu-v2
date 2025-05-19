"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, RefreshCw, FileText, AlertCircle } from "lucide-react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CVUploadForm() {
  const { data, updateFormValues, navigateToNextStep, getStepValidationErrors } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(data.cvFileUrl || null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check validation errors
  const validationErrors = getStepValidationErrors(8);

  // Compute if form can be submitted
  const canSubmit = filePreview !== null || cvFile !== null;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setErrorMessage(null);
    setUploadStatus("idle");
    
    // Validate file type
    if (!file.type.match('application/pdf') && !file.type.match('application/msword') && !file.type.match('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setErrorMessage("File harus berupa dokumen (PDF atau Word)");
      return;
    }
    
    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 3MB");
      return;
    }
    
    // Set the file and update preview info
    setCvFile(file);
    // For documents, we don't have a visual preview, just show the filename
    setFilePreview(file.name);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.match('application/pdf') && !file.type.match('application/msword') && !file.type.match('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        setErrorMessage("File harus berupa dokumen (PDF atau Word)");
        return;
      }
      
      // Validate file size (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage("Ukuran file maksimal 3MB");
        return;
      }
      
      // Set the file and update preview info
      setCvFile(file);
      setFilePreview(file.name);
      setErrorMessage(null);
    }
  };

  const resetFile = () => {
    setFilePreview(null);
    setCvFile(null);
    setUploadStatus("idle");
    setErrorMessage(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const uploadToBlob = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      setErrorMessage(null); // Reset error message before attempting upload
      
      console.log(`Uploading file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Use the upload endpoint instead of direct-upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log(`Upload response status: ${response.status}`);
      
      // First check the response status
      if (!response.ok) {
        // If response is not OK, try to parse the error message
        const responseClone = response.clone(); // Clone the response before reading
        
        try {
          const errorData = await responseClone.json();
          throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
        } catch (parseError) {
          // If parsing fails, it's likely not JSON, use text instead
          try {
            const textError = await response.text();
            console.error('Response is not JSON:', textError);
            throw new Error(`Upload failed with status: ${response.status}. Server returned: ${textError.substring(0, 100)}...`);
          } catch (textError) {
            // If even text extraction fails
            throw new Error(`Upload failed with status: ${response.status}. Could not read server response.`);
          }
        }
      }

      // If response is OK, try to parse the JSON
      try {
        const data = await response.json();
        console.log(`Upload successful, received URL: ${data.url}`);
        
        if (!data?.url) {
          throw new Error('Server response missing URL field. Please try again.');
        }
        
        return data.url;
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        
        // Try to get the raw text to see what's being returned
        try {
          const responseClone = response.clone();
          const text = await responseClone.text();
          console.error('Raw response:', text);
          throw new Error(`Server returned invalid JSON. Raw response: ${text.substring(0, 100)}...`);
        } catch (textError) {
          throw new Error('Server returned invalid JSON response. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!cvFile && !data.cvFileUrl) {
      setErrorMessage("CV/Resume wajib diunggah. Silakan unggah file CV atau resume Anda.");
      return;
    }
    
    setIsSubmitting(true);
    setUploadStatus("uploading");
    setErrorMessage(null);
    
    // Retry logic
    const maxRetries = 2;
    let retryCount = 0;
    // Make sure fileUrl is initialized as string
    let fileUrl: string = data.cvFileUrl || '';
    
    const attemptUpload = async (): Promise<string> => {
      try {
        if (cvFile) {
          console.log(`Upload attempt ${retryCount + 1}/${maxRetries + 1} for file ${cvFile.name}`);
          const url = await uploadToBlob(cvFile);
          console.log("Upload successful, URL:", url);
          return url;
        }
        return fileUrl;
      } catch (error) {
        console.error(`Upload attempt ${retryCount + 1} failed:`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying upload (${retryCount}/${maxRetries})...`);
          // Wait a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptUpload();
        }
        throw error; // Re-throw if all retries failed
      }
    };
    
    try {
      // If there's a new file selected, upload it
      if (cvFile) {
        console.log("Uploading new CV file...");
        fileUrl = await attemptUpload();
        if (!fileUrl) {
          throw new Error("Upload failed: No URL returned from server");
        }
      } else {
        console.log("Using existing CV URL:", fileUrl);
      }
      
      // Update context with file URL
      updateFormValues({
        cvFileUrl: fileUrl,
      });
      
      setUploadStatus("success");
      toast.success("CV berhasil diunggah!");
      
      // Navigate to next step
      setTimeout(() => {
        navigateToNextStep();
      }, 500);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengunggah CV. Silakan coba lagi.");
      toast.error("Gagal mengunggah CV");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Unggah CV/Resume</h2>
        <p className="text-gray-500">
          Unggah CV atau resume Anda untuk meningkatkan peluang mendapatkan pekerjaan yang sesuai.
          CV/Resume ini akan dilihat oleh perekrut saat Anda melamar pekerjaan.
        </p>
        
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            filePreview ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-blue-50",
            validationErrors.cvFileUrl && !filePreview ? "border-red-300" : ""
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          
          {filePreview ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full mb-4 p-4 bg-white rounded-md border flex items-center">
                <FileText className="h-10 w-10 text-blue-600 mr-3" />
                <div className="flex-1 truncate">
                  <p className="font-medium">{typeof filePreview === 'string' ? filePreview : 'CV Document'}</p>
                  <p className="text-sm text-gray-500">
                    {cvFile ? `${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFile();
                  }}
                  className="ml-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">Klik untuk mengganti dokumen</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Unggah CV/Resume Anda</p>
              <p className="text-sm text-gray-500 mb-2">Tarik dan lepas dokumen di sini atau klik untuk unggah</p>
              <p className="text-xs text-gray-400">Format: PDF, DOC, atau DOCX (Maks. 3MB)</p>
            </div>
          )}
        </div>
      </div>
      
      {validationErrors.cvFileUrl && !filePreview && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{validationErrors.cvFileUrl}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {uploadStatus === "uploading" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span>Mengunggah CV...</span>
        </div>
      )}
      
      {uploadStatus === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2" />
          <span>CV berhasil diunggah!</span>
        </div>
      )}
      
      <FormNav 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        disableNext={!canSubmit}
      />
      
      <p className="text-sm text-gray-500 text-center">
        CV/Resume wajib diunggah untuk melamar pekerjaan.
      </p>
    </div>
  );
} 