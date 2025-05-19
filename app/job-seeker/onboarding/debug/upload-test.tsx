"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
    responseDetails?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const resetFile = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);

      // Log request details
      console.log("Preparing to upload file:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      // Make the API request
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));

      // Clone response for multiple reads
      const responseClone = response.clone();

      try {
        // Try to parse as JSON
        const responseData = await response.json();
        console.log("Response data:", responseData);

        if (response.ok) {
          setUploadResult({
            success: true,
            message: "File uploaded successfully!",
            url: responseData.url,
            responseDetails: JSON.stringify(responseData, null, 2)
          });
        } else {
          setUploadResult({
            success: false,
            message: responseData.error || "Upload failed",
            responseDetails: JSON.stringify(responseData, null, 2)
          });
        }
      } catch (parseError) {
        console.error("Error parsing response as JSON:", parseError);
        
        // Try to get the text response instead
        try {
          const textResponse = await responseClone.text();
          console.log("Text response:", textResponse);
          
          setUploadResult({
            success: false,
            message: "Failed to parse response as JSON",
            responseDetails: textResponse.substring(0, 500)
          });
        } catch (textError) {
          console.error("Error getting text response:", textError);
          setUploadResult({
            success: false,
            message: "Could not read response",
            responseDetails: "Failed to parse response"
          });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6">Upload API Test Tool</h1>
      
      <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-6"
        onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-full mb-4 p-4 bg-gray-50 rounded-md border flex items-center">
              <div className="flex-1 truncate">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {`${file.type} • ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetFile();
                }}
                className="ml-2 bg-red-100 text-red-600 rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-4 mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <p className="font-medium text-gray-700 mb-1">Click to select a file</p>
            <p className="text-sm text-gray-500">or drag and drop</p>
          </div>
        )}
      </div>

      <Button
        onClick={handleUpload}
        className="w-full mb-6"
        disabled={!file || isUploading}
      >
        {isUploading ? (
          <div className="flex items-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span>Uploading...</span>
          </div>
        ) : (
          <span>Upload File</span>
        )}
      </Button>

      {uploadResult && (
        <div className={`border rounded-lg p-4 mb-6 ${
          uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        }`}>
          <div className="flex items-center mb-3">
            {uploadResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <h3 className={`font-medium ${
              uploadResult.success ? "text-green-800" : "text-red-800"
            }`}>
              {uploadResult.message}
            </h3>
          </div>
          
          {uploadResult.url && (
            <div className="mb-3">
              <p className="text-sm font-semibold mb-1">URL:</p>
              <a 
                href={uploadResult.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 break-all"
              >
                {uploadResult.url}
              </a>
            </div>
          )}
          
          {uploadResult.responseDetails && (
            <div>
              <p className="text-sm font-semibold mb-1">Response Details:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                {uploadResult.responseDetails}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700 mb-2">Debugging Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Select a file to upload (preferably a small PDF or image)</li>
          <li>Click the Upload button</li>
          <li>Check the upload result and response details</li>
          <li>If there are errors, check the browser console for more information</li>
          <li>Test with different file types and sizes to diagnose issues</li>
        </ol>
      </div>
    </div>
  );
} 