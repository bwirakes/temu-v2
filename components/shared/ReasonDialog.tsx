"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';

interface ReasonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  title: string;
  description?: string;
  isLoading?: boolean;
  initialReason?: string;
}

export function ReasonDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  title,
  description,
  isLoading = false,
  initialReason = "",
}: ReasonDialogProps) {
  const [reasonText, setReasonText] = useState(initialReason);

  useEffect(() => {
    if (isOpen) {
      setReasonText(initialReason); // Reset/set reason when dialog opens
    }
  }, [isOpen, initialReason]);

  const handleSubmit = () => {
    onSubmit(reasonText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="reason"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="Masukkan alasan (opsional)..."
            className="min-h-[100px]"
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 