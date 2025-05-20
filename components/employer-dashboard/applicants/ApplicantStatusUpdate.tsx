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
import { ReasonDialog } from "@/components/shared/ReasonDialog";

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
  currentReason?: string | null;
}

export default function ApplicantStatusUpdate({ 
  applicationId, 
  currentStatus,
  currentReason
}: ApplicantStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  
  // State for reason dialog
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [statusChangeReasonText, setStatusChangeReasonText] = useState("");
  const [pendingStatusValue, setPendingStatusValue] = useState<string | null>(null);
  
  // Define statuses that require a reason
  const DIALOG_STATUSES = ["REJECTED", "ACCEPTED", "WITHDRAWN"];

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatus(value);
    setHasChanged(value !== currentStatus);
    
    if (DIALOG_STATUSES.includes(value)) {
      setPendingStatusValue(value);
      setStatusChangeReasonText(currentReason || "");
      setIsReasonDialogOpen(true);
    }
  };
  
  // Handle submission from the reason dialog
  const handleSubmitWithReason = (reasonFromDialog: string) => {
    if (pendingStatusValue) {
      setStatusChangeReasonText(reasonFromDialog);
      // Set the new status
      setStatus(pendingStatusValue);
      // Mark as changed if it's not the original status
      const hasStatusChanged = pendingStatusValue !== currentStatus;
      setHasChanged(hasStatusChanged);
      
      // Automatically save the change when dialog is submitted
      updateStatusWithReason(pendingStatusValue, reasonFromDialog);
    }
  };

  // New function to update status with reason
  const updateStatusWithReason = async (newStatus: string, reason: string) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Show success message
      toast({
        title: "Status diperbarui",
        description: `Status lamaran berhasil diubah menjadi ${getStatusLabel(newStatus)}.`,
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
      
      // Revert to previous status if there's an error
      setStatus(currentStatus);
      setHasChanged(false);
    } finally {
      setIsUpdating(false);
      // Reset dialog state
      setIsReasonDialogOpen(false);
      setPendingStatusValue(null);
    }
  };

  // Update status via API (used for non-dialog statuses and manual button click)
  const updateStatus = async () => {
    if (!hasChanged) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status,
          reason: DIALOG_STATUSES.includes(status) ? statusChangeReasonText : undefined
        })
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
      
      // Revert to original status
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get the label for a status value
  const getStatusLabel = (value: string) => {
    return statusOptions.find(option => option.value === value)?.label || value;
  };

  return (
    <>
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
      
      {/* Reason Dialog */}
      {pendingStatusValue && (
        <ReasonDialog
          isOpen={isReasonDialogOpen}
          onOpenChange={(open) => {
            setIsReasonDialogOpen(open);
            if (!open) {
              // Reset pending status if dialog is closed without submitting
              setPendingStatusValue(null);
            }
          }}
          onSubmit={handleSubmitWithReason}
          title={`Alasan untuk ${getStatusLabel(pendingStatusValue)}`}
          description="Silakan berikan alasan untuk perubahan status ini (opsional)."
          isLoading={isUpdating}
          initialReason={statusChangeReasonText}
        />
      )}
    </>
  );
} 