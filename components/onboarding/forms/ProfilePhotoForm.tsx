"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Check, RefreshCw, Camera } from "lucide-react";
import Image from "next/image";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { Button } from "@/components/ui/button";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProfilePhotoForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const [imagePreview, setImagePreview] = useState<string | null>(data.profilePhotoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Define uploadToBlob before handleSubmit
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

  // Define handleSubmit before the useEffect that references it
  const handleSubmit = async () => {
    if (!photoFile && !data.profilePhotoUrl) {
      // Skip if no file uploaded - this step is optional
      setCurrentStep(10);
      router.push("/job-seeker/onboarding/ringkasan");
      return;
    }
    
    setIsSubmitting(true);
    setUploadStatus("uploading");
    setErrorMessage(null);
    
    try {
      // If there's already a photo URL and no new file selected, we can skip upload
      let photoUrl = data.profilePhotoUrl;
      
      // Only upload if there's a new file selected
      if (photoFile) {
        photoUrl = await uploadToBlob(photoFile);
      }
      
      // Update context with photo URL
      const updatedValues = {
        profilePhotoUrl: photoUrl,
      };
      
      updateFormValues(updatedValues);
      
      // Save to API
      await saveStep(9, updatedValues);
      
      setUploadStatus("success");
      toast.success("Foto profil berhasil diunggah!");
      
      // Don't automatically navigate to the next step after upload
      // Let the user manually continue or skip
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengunggah foto. Silakan coba lagi.");
      toast.error("Gagal mengunggah foto profil");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-upload when a file is selected - Now handleSubmit is defined before this useEffect
  useEffect(() => {
    if (photoFile) {
      // Automatically trigger the upload process when a file is selected
      handleSubmit();
    }
  }, [photoFile, handleSubmit]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setErrorMessage(null);
    setUploadStatus("idle");
    
    // Validate file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
      setErrorMessage("File harus berupa gambar (JPEG, PNG, atau JPG)");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 5MB");
      return;
    }
    
    // Set the file and update preview
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/jpg')) {
        setErrorMessage("File harus berupa gambar (JPEG, PNG, atau JPG)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file maksimal 5MB");
        return;
      }
      
      // Set the file and update preview
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage(null);
    }
  };

  const resetFile = () => {
    setImagePreview(null);
    setPhotoFile(null);
    setUploadStatus("idle");
    setErrorMessage(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleNext = () => {
    // Navigate to next step
    setCurrentStep(10);
    router.push("/job-seeker/onboarding/ringkasan");
  };
  
  const handleSkip = () => {
    // Make sure to set the correct step number before redirecting
    setCurrentStep(10);
    // Use a timeout to ensure state updates have time to complete
    setTimeout(() => {
      router.push("/job-seeker/onboarding/ringkasan");
    }, 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Unggah Foto Profil</h2>
        <p className="text-gray-500">
          Unggah foto profil Anda untuk meningkatkan personalitas profil Anda.
        </p>
        
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            imagePreview ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-blue-50"
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
          />
          
          {imagePreview ? (
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4 rounded-full overflow-hidden border-4 border-white shadow-md">
                <Image 
                  src={imagePreview} 
                  alt="Profile preview"
                  width={192}
                  height={192}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://placehold.co/200x200/e2e8f0/64748b?text=Profile";
                  }}
                  priority={false}
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFile();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">Klik untuk mengganti foto</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Unggah Foto Profil Anda</p>
              <p className="text-sm text-gray-500 mb-2">Tarik dan lepas gambar di sini atau klik untuk unggah</p>
              <p className="text-xs text-gray-400">Format: JPEG, PNG, atau JPG (Maks. 5MB)</p>
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
          <div className="animate-spin mr-2">
            <RefreshCw className="h-4 w-4" />
          </div>
          Mengunggah foto...
        </div>
      )}
      
      {uploadStatus === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2" />
          Foto profil berhasil diunggah!
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleSkip}
          className="w-full sm:w-auto"
        >
          Lewati Langkah Ini
        </Button>
        
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || isSaving}
          className="w-full sm:w-auto"
        >
          {isSubmitting || isSaving ? "Memproses..." : "Lanjutkan"}
        </Button>
      </div>
    </div>
  );
} 