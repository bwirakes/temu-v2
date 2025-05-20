"use client";

import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit, Upload, X, RefreshCw, AlertCircle, Check } from "lucide-react";
import { SectionCard, EmptyState } from "./ProfileComponents";
import { toast } from "sonner";

interface CVProps {
  cvFileUrl?: string | null;
  cvUploadDate?: string | Date | null;
}

export function CV({ cvFileUrl, cvUploadDate }: CVProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
    
    // Set the file
    setNewCvFile(file);
    setEditMode(true);
  };

  const cancelUpload = () => {
    setNewCvFile(null);
    setEditMode(false);
    setErrorMessage(null);
    setUploadStatus("idle");
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const uploadToServer = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Uploading CV file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data?.url) {
        throw new Error('Server response missing URL field');
      }
      
      return data.url;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    }
  };
  
  const updateProfileWithCvUrl = async (cvUrl: string): Promise<void> => {
    try {
      const response = await fetch("/api/job-seeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvFileUrl: cvUrl,
          cvUploadDate: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile with new CV");
      }
    } catch (error) {
      console.error('Error updating profile CV URL:', error);
      throw error;
    }
  };
  
  const handleSaveCV = async () => {
    if (!newCvFile) return;
    
    setIsUploading(true);
    setUploadStatus("uploading");
    setErrorMessage(null);
    
    try {
      // Upload the file to get a URL
      const cvUrl = await uploadToServer(newCvFile);
      
      // Update the user profile with the new CV URL
      await updateProfileWithCvUrl(cvUrl);
      
      setUploadStatus("success");
      toast.success("CV berhasil diperbarui");
      
      // Reload the page to show the updated CV
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error saving CV:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengupload CV. Silakan coba lagi.");
      toast.error("Gagal mengupload CV");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SectionCard 
      title="CV / Resume" 
      icon={<FileText className="h-4 w-4 text-blue-700" />}
      action={
        !editMode ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="transition-colors duration-200 h-7 text-xs"
            onClick={handleUploadClick}
          >
            <Edit className="h-3 w-3 mr-1" />
            {cvFileUrl ? 'Ganti CV' : 'Upload CV'}
          </Button>
        ) : null
      }
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />
      
      {editMode && newCvFile ? (
        // Edit mode with new file selected
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-blue-50 flex items-center">
            <FileText className="h-10 w-10 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="font-medium">{newCvFile.name}</p>
              <p className="text-sm text-gray-500">
                {(newCvFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelUpload}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {uploadStatus === "uploading" && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
              <span>Mengupload CV...</span>
            </div>
          )}
          
          {uploadStatus === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>CV berhasil diupload!</span>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={cancelUpload}>
              Batal
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveCV} 
              disabled={isUploading || uploadStatus === "success"}
            >
              {isUploading ? "Menyimpan..." : "Simpan CV"}
            </Button>
          </div>
        </div>
      ) : cvFileUrl ? (
        // Existing CV view
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3 border rounded-lg flex items-center justify-center p-6 bg-gray-50">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <div className="w-full md:w-2/3">
            <h3 className="font-medium text-gray-900">CV Anda</h3>
            <p className="text-sm text-gray-500 mt-1">
              Diunggah pada: {cvUploadDate ? 
                new Date(cvUploadDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Tidak diketahui'
              }
            </p>
            <p className="text-sm text-gray-500">
              File ini akan dikirim ke pemberi kerja saat Anda melamar pekerjaan
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="h-8 text-sm" asChild>
                <a href={cvFileUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-1" />
                  Lihat CV
                </a>
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-sm" asChild>
                <a href={cvFileUrl} download>
                  <Download className="h-4 w-4 mr-1" />
                  Unduh
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Empty state - no CV
        <EmptyState
          title="Belum ada CV"
          description="Unggah CV Anda untuk meningkatkan peluang mendapatkan pekerjaan"
          action={
            <Button size="sm" className="mt-2" onClick={handleUploadClick}>
              <Upload className="h-4 w-4 mr-1" />
              Unggah CV
            </Button>
          }
        />
      )}
    </SectionCard>
  );
} 