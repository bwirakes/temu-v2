import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const allowedFileTypes = {
  image: ["image/jpeg", "image/png", "image/webp"],
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  all: ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
};

export const maxFileSize = {
  image: 2 * 1024 * 1024, // 2MB
  document: 5 * 1024 * 1024, // 5MB
};

/**
 * Generate a presigned URL for uploading a file to S3
 * @param fileType The MIME type of the file
 * @param fileName Original filename
 * @param fileCategory 'image' or 'document'
 * @returns Object with upload URL and the final file URL
 */
export async function generatePresignedUrl(
  fileType: string,
  fileName: string,
  fileCategory: "image" | "document" = "document"
) {
  // Validate file type
  if (!allowedFileTypes[fileCategory].includes(fileType)) {
    throw new Error(`File type ${fileType} not allowed for ${fileCategory}`);
  }

  // Generate a unique file name to prevent collisions
  const fileExtension = fileName.split(".").pop();
  const randomId = crypto.randomBytes(16).toString("hex");
  const key = `uploads/${fileCategory}/${randomId}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  // Create the command
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  try {
    // Generate the presigned URL
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    // Construct the final URL where the file will be accessible
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      uploadUrl: signedUrl,
      fileUrl,
      fileName: fileName,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

/**
 * Validate file size
 * @param fileSize Size of the file in bytes
 * @param fileCategory 'image' or 'document'
 * @returns Boolean indicating if file size is valid
 */
export function validateFileSize(fileSize: number, fileCategory: "image" | "document") {
  return fileSize <= maxFileSize[fileCategory];
} 