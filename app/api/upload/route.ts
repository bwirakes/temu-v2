import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

// Check if we're in mock mode for development
const isMockMode = () => {
  return process.env.NEXT_PUBLIC_MOCK_BLOB === 'true' || 
         process.env.BLOB_READ_WRITE_TOKEN === 'your_vercel_blob_token_here' ||
         process.env.BLOB_READ_WRITE_TOKEN === 'vercel_blob_development_token';
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Check file type - allow images and documents
    const isImage = file.type.startsWith("image/");
    const isDocument = file.type === "application/pdf" || 
                      file.type === "application/msword" || 
                      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    
    if (!isImage && !isDocument) {
      return NextResponse.json(
        { error: "File must be an image (JPG, PNG, WebP) or document (PDF, DOC, DOCX)" },
        { status: 400 }
      );
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }
    
    // Generate a unique filename using nanoid
    const uniqueId = nanoid();
    const fileName = `${uniqueId}-${file.name.replace(/\s+/g, "-")}`;
    
    // Check if we're in mock mode for development
    if (isMockMode()) {
      console.log("Using mock mode for Vercel Blob uploads");
      // Return a fake URL for development purposes
      const mockUrl = `https://mock-vercel-blob.vercel.app/${fileName}`;
      return NextResponse.json({ url: mockUrl });
    }
    
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error: Storage token not configured" },
        { status: 500 }
      );
    }
    
    try {
      // Upload file to Vercel Blob
      const { url } = await put(fileName, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      // Return the uploaded file's URL
      return NextResponse.json({ url });
    } catch (error: any) {
      console.error("Vercel Blob upload error:", error);
      
      // Provide more specific error messages based on common issues
      if (typeof error.message === 'string' && 
          (error.message.includes("Access denied") || 
           error.message.includes("invalid token"))) {
        return NextResponse.json(
          { error: "Invalid or expired Blob token. Please check your BLOB_READ_WRITE_TOKEN." },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to upload to storage service. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again later." },
      { status: 500 }
    );
  }
}

// Set the maximum allowed request body size (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 