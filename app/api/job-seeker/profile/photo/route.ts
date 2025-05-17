import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { db, getUserProfileByUserId, updateUserProfile } from "@/lib/db";

// Define allowed image types and size limits
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max for profile photos

// Check if we're in mock mode for development
const isMockMode = () => {
  return process.env.NEXT_PUBLIC_MOCK_BLOB === 'true' || 
         process.env.BLOB_READ_WRITE_TOKEN === 'your_vercel_blob_token_here' ||
         process.env.BLOB_READ_WRITE_TOKEN === 'vercel_blob_development_token';
};

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }
    
    // Verify user is a job seeker
    const userType = (session.user as any).userType;
    if (userType !== "job_seeker") {
      return NextResponse.json(
        { error: "Unauthorized", code: "INVALID_USER_TYPE" },
        { status: 403 }
      );
    }
    
    // Get user profile
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "Profile not found", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be an image (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }
    
    // Generate a unique filename using nanoid and user ID
    const uniqueId = nanoid(10);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `profile-photos/${session.user.id}-${uniqueId}.${fileExtension}`;
    
    // Check if we're in mock mode for development
    if (isMockMode()) {
      console.log("Using mock mode for Vercel Blob uploads");
      const mockUrl = `https://mock-vercel-blob.vercel.app/${fileName}`;
      
      // Update the user profile with the mock URL
      await updateUserProfile(userProfile.id, {
        profilePhotoUrl: mockUrl,
        updatedAt: new Date()
      });
      
      return NextResponse.json({ 
        success: true,
        url: mockUrl 
      });
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
      
      // Get the previous profile photo URL, if any
      const previousPhotoUrl = userProfile.profilePhotoUrl;
      
      // Update the user profile with the new photo URL
      await updateUserProfile(userProfile.id, {
        profilePhotoUrl: url,
        updatedAt: new Date()
      });
      
      // Return the uploaded file's URL and success message
      return NextResponse.json({ 
        success: true,
        url,
        previousUrl: previousPhotoUrl
      });
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
    console.error("Error uploading profile photo:", error);
    return NextResponse.json(
      { error: "Failed to upload profile photo. Please try again later." },
      { status: 500 }
    );
  }
}

// Set the maximum allowed request body size (5MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
}; 