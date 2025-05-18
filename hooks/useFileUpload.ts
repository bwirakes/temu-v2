"use client";

import { useState } from "react";

interface UploadOptions {
  fileCategory?: "image" | "document";
  onSuccess?: (fileUrl: string, fileName: string) => void;
  onError?: (error: Error) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<Record<string, UploadState>>({});

  const uploadFile = async (file: File, options: UploadOptions = {}) => {
    const { fileCategory = "document", onSuccess, onError } = options;
    const fileId = `${file.name}-${Date.now()}`;

    try {
      // Initialize upload state
      setUploadState((prev) => ({
        ...prev,
        [fileId]: { isUploading: true, progress: 0, error: null },
      }));

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", file);
      
      // If needed, we can add additional metadata
      if (fileCategory) {
        formData.append("fileCategory", fileCategory);
      }

      // Send the file to our API route that uses Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const { url } = await response.json();

      // Update state on success
      setUploadState((prev) => ({
        ...prev,
        [fileId]: { isUploading: false, progress: 100, error: null },
      }));

      // Call success callback
      if (onSuccess) {
        onSuccess(url, file.name);
      }

      return { fileUrl: url, fileName: file.name };
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Update state on error
      setUploadState((prev) => ({
        ...prev,
        [fileId]: { 
          isUploading: false, 
          progress: 0, 
          error: error instanceof Error ? error : new Error("Unknown error") 
        },
      }));

      // Call error callback
      if (onError && error instanceof Error) {
        onError(error);
      }

      throw error;
    }
  };

  const getUploadState = (fileId: string): UploadState => {
    return uploadState[fileId] || { isUploading: false, progress: 0, error: null };
  };

  return {
    uploadFile,
    getUploadState,
    uploadState,
  };
} 