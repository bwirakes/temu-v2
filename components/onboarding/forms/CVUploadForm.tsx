"use client";

import { useState, useRef } from "react";
import { Upload, X, Check, RefreshCw, FileText } from "lucide-react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { Button } from "@/components/ui/button";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CVUploadForm() {
  const { data, updateFormValues, navigateToNextStep, currentStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const [filePreview, setFilePreview] = useState<string | null>(data.cvFileUrl || null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 5MB");
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
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file maksimal 5MB");
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
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Use the specific error message from the API if available
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if we're in mock mode (for development)
      if (data.url.includes('mock-vercel-blob.vercel.app')) {
        console.log('Using mock Blob storage in development mode');
      }
      
      return data.url;
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!cvFile && !data.cvFileUrl) {
      // Skip if no file uploaded - this step is optional
      navigateToNextStep();
      return;
    }
    
    setIsSubmitting(true);
    setUploadStatus("uploading");
    setErrorMessage(null);
    
    try {
      // If there's already a file URL and no new file selected, we can skip upload
      let fileUrl = data.cvFileUrl;
      
      // Only upload if there's a new file selected
      if (cvFile) {
        fileUrl = await uploadToBlob(cvFile);
      }
      
      // Update context with file URL
      const updatedValues = {
        cvFileUrl: fileUrl, // Store permanent URL
      };
      
      updateFormValues(updatedValues);
      
      // Save to API
      await saveStep(currentStep, updatedValues);
      
      setUploadStatus("success");
      toast.success("CV berhasil diunggah!");
      
      // Use the centralized navigation function
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
          Unggah CV atau resume Anda untuk meningkatkan peluang menemukan pekerjaan yang sesuai.
        </p>
        
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            filePreview ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
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
              <p className="text-xs text-gray-400">Format: PDF, DOC, atau DOCX (Maks. 5MB)</p>
            </div>
          )}
        </div>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errorMessage}
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
        isSubmitting={isSubmitting || isSaving}
        onSkip={navigateToNextStep}
        saveOnNext={false}
      />
    </div>
  );
} 