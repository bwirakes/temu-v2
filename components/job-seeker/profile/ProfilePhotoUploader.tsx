"use client";

import { useState, useRef, ChangeEvent } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string | null;
  userName: string;
  onPhotoUploaded: (url: string) => void;
}

export default function ProfilePhotoUploader({
  currentPhotoUrl,
  userName,
  onPhotoUploaded
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user initials for fallback
  const initials = userName
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP)");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowDialog(true);

    // Reset file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadPhoto = async () => {
    if (!previewUrl) return;

    try {
      setIsUploading(true);

      // Convert preview URL back to file
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });

      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Upload to the server
      const uploadResponse = await fetch("/api/job-seeker/profile/photo", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload photo");
      }

      const data = await uploadResponse.json();

      // Call the callback with the new photo URL
      onPhotoUploaded(data.url);
      toast.success("Profile photo updated successfully");

      // Close dialog and clean up
      setShowDialog(false);
      revokePreviewUrl();
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const revokePreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const cancelUpload = () => {
    setShowDialog(false);
    revokePreviewUrl();
  };

  return (
    <>
      <div className="relative group">
        <div className="h-24 w-24 rounded-full overflow-hidden transition-transform duration-200 hover:scale-[1.03]">
          {currentPhotoUrl ? (
            <Image src={currentPhotoUrl} alt={userName} width={96} height={96} className="h-full w-full object-cover" priority={false} loading="lazy" />
          ) : (
            <div className="bg-blue-100 h-full w-full flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-700">{initials}</span>
            </div>
          )}
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 rounded-full shadow-sm hover:shadow transition-shadow duration-200 h-7 w-7"
        >
          <Camera className="h-3 w-3" />
        </Button>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>Update profile photo</DialogTitle>
          <DialogDescription>
            Preview your new profile photo before saving.
          </DialogDescription>

          <div className="py-4 flex flex-col items-center">
            {previewUrl && (
              <div className="relative">
                <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-blue-100">
                  <Image src={previewUrl} alt="Preview" width={128} height={128} className="h-full w-full object-cover" priority={false} loading="lazy" />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={cancelUpload}
                  className="absolute -top-2 -right-2 rounded-full h-6 w-6 bg-red-50 hover:bg-red-100 text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelUpload} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={uploadPhoto} disabled={!previewUrl || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
