"use client";

import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Define the available status options
const statusOptions = [
  { value: "SUBMITTED", label: "Diajukan" },
  { value: "REVIEWING", label: "Sedang Ditinjau" },
  { value: "INTERVIEW", label: "Wawancara" },
  { value: "OFFERED", label: "Ditawari" },
  { value: "ACCEPTED", label: "Diterima" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "WITHDRAWN", label: "Dicabut" }
];

interface ApplicantStatusUpdateProps {
  applicationId: string;
  currentStatus: string;
}

export default function ApplicantStatusUpdate({ 
  applicationId, 
  currentStatus 
}: ApplicantStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setHasChanged(value !== currentStatus);
  };

  // Update status via API
  const updateStatus = async () => {
    if (!hasChanged) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Show success message
      toast({
        title: "Status diperbarui",
        description: `Status lamaran berhasil diubah menjadi ${getStatusLabel(status)}.`,
      });
      
      // Reset the hasChanged flag since we've saved the changes
      setHasChanged(false);
    } catch (error) {
      console.error("Error updating status:", error);
      
      // Show error message
      toast({
        title: "Gagal memperbarui status",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get the label for a status value
  const getStatusLabel = (value: string) => {
    return statusOptions.find(option => option.value === value)?.label || value;
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={updateStatus} 
        disabled={!hasChanged || isUpdating}
        variant={hasChanged ? "default" : "outline"}
        size="sm"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan
          </>
        ) : (
          "Simpan"
        )}
      </Button>
    </div>
  );
} 