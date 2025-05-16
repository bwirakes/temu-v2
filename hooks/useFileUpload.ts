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

      // Step 1: Get presigned URL from server
      const presignedUrlResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileCategory,
        }),
      });

      if (!presignedUrlResponse.ok) {
        const error = await presignedUrlResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { uploadUrl, fileUrl } = await presignedUrlResponse.json();

      // Step 2: Upload file to S3 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Update state on success
      setUploadState((prev) => ({
        ...prev,
        [fileId]: { isUploading: false, progress: 100, error: null },
      }));

      // Call success callback
      if (onSuccess) {
        onSuccess(fileUrl, file.name);
      }

      return { fileUrl, fileName: file.name };
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