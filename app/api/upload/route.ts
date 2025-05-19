import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

// This route shouldn't have any middleware config
// The size limits should be set in next.config.js instead

export async function POST(request: NextRequest) {
  try {
    // Log the request being received
    console.log("Upload API called");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json(
        { error: "No file provided" },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Check file type - allow images and documents
    const isImage = file.type.startsWith("image/");
    const isDocument = file.type === "application/pdf" || 
                      file.type === "application/msword" || 
                      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    
    if (!isImage && !isDocument) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "File must be an image (JPG, PNG, WebP) or document (PDF, DOC, DOCX)" },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Check file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      console.log(`File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: "File size exceeds 3MB limit" },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Generate a unique filename using nanoid
    const uniqueId = nanoid();
    const fileName = `${uniqueId}-${file.name.replace(/\s+/g, "-")}`;
    console.log(`Preparing to upload: ${fileName}`);
    
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error: Storage token not configured" },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    try {
      // Upload file to Vercel Blob
      const { url } = await put(fileName, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      // Log successful upload
      console.log(`File uploaded successfully: ${fileName} -> ${url}`);
      
      // Return the uploaded file's URL with explicit headers
      return new NextResponse(
        JSON.stringify({ url }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } catch (error: any) {
      console.error("Vercel Blob upload error:", error);
      
      // Provide more specific error messages based on common issues
      if (typeof error.message === 'string' && 
          (error.message.includes("Access denied") || 
           error.message.includes("invalid token"))) {
        return new NextResponse(
          JSON.stringify({ error: "Invalid or expired Blob token. Please check your BLOB_READ_WRITE_TOKEN." }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
      
      return new NextResponse(
        JSON.stringify({ error: "Failed to upload to storage service. Please try again later." }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    
    return new NextResponse(
      JSON.stringify({ error: "Failed to upload file. Please try again later." }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 