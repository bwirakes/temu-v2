"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Upload, X, Check, RefreshCw } from "lucide-react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";

export default function UploadFotoForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  
  // Clean up camera stream when component unmounts or tab changes
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
    }
  }, [activeTab]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset states
    setErrorMessage(null);
    setUploadStatus("idle");
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("File harus berupa gambar");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 5MB");
      return;
    }
    
    // Set the file and create a preview
    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
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
      if (!file.type.startsWith("image/")) {
        setErrorMessage("File harus berupa gambar");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file maksimal 5MB");
        return;
      }
      
      // Set the file and create a preview
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setErrorMessage(null);
    }
  };

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrorMessage("Tidak dapat mengakses kamera. Pastikan kamera diizinkan.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob and then to File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
            const imageUrl = URL.createObjectURL(blob);
            setImagePreview(imageUrl);
            stopCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const resetImage = () => {
    setImagePreview(null);
    setImageFile(null);
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
    if (!imageFile) {
      // Skip if no image uploaded - this step is optional
      setCurrentStep(6);
      router.push("/onboarding/level-pengalaman");
      return;
    }
    
    setIsSubmitting(true);
    setUploadStatus("uploading");
    setErrorMessage(null);
    
    try {
      // Upload image to Vercel Blob
      const imageUrl = await uploadToBlob(imageFile);
      
      // Update context with image URL
      updateFormValues({
        fotoProfil: imageFile, // Store file object in memory
        fotoProfilUrl: imageUrl, // Store permanent URL
      });
      
      setUploadStatus("success");
      
      // Navigate to next step
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(6);
        router.push("/onboarding/level-pengalaman");
      }, 1000);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengunggah gambar. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    setCurrentStep(6);
    router.push("/onboarding/level-pengalaman");
  };
  
  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="upload" 
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          if (value === "camera") {
            startCamera();
          }
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Unggah Foto
          </TabsTrigger>
          <TabsTrigger value="camera">
            <Camera className="h-4 w-4 mr-2" />
            Ambil Foto
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
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
              accept="image/*"
              onChange={handleFileChange}
            />
            
            {imagePreview ? (
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetImage();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Klik untuk mengganti gambar</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <p className="font-medium text-gray-700 mb-1">Unggah Foto Profil</p>
                <p className="text-sm text-gray-500 mb-2">Tarik dan lepas gambar di sini atau klik untuk unggah</p>
                <p className="text-xs text-gray-400">Format: JPG, PNG, atau WebP (Maks. 5MB)</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="camera" className="mt-6">
          <div className="border-2 border-dashed rounded-lg p-2 text-center">
            {!imagePreview ? (
              <div className="relative">
                <video 
                  ref={videoRef} 
                  className="w-full h-64 object-cover bg-black rounded-md"
                  autoPlay 
                  playsInline
                />
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={capturePhoto}
                    disabled={!isCameraActive}
                    className="mx-2"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Ambil Foto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center p-4">
                <div className="relative w-40 h-40 mb-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetImage();
                      startCamera();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Foto telah diambil</p>
              </div>
            )}
            
            {/* Hidden canvas for capturing photos */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </TabsContent>
      </Tabs>
      
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
          Foto berhasil diunggah!
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
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Memproses..." : "Lanjutkan"}
        </Button>
      </div>
    </div>
  );
} 