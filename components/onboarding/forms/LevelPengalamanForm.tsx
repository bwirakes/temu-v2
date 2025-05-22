"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormNav from "@/components/FormNav";
import { toast } from "sonner";
import { OnboardingData, levelPengalamanEnum } from "@/lib/db-types";

// Define a mapping for display labels
const levelPengalamanDisplayMap: Record<typeof levelPengalamanEnum.enumValues[number], string> = {
  'LULUSAN_BARU': 'Lulusan Baru / Fresh Graduate',
  'SATU_DUA_TAHUN': '1-2 Tahun Pengalaman',
  'TIGA_LIMA_TAHUN': '3-5 Tahun Pengalaman',
  'LIMA_SEPULUH_TAHUN': '5-10 Tahun Pengalaman',
  'LEBIH_SEPULUH_TAHUN': 'Lebih dari 10 Tahun Pengalaman'
};

const levelPengalamanOptions = levelPengalamanEnum.enumValues.map(value => ({
  value: value, // Machine-readable value, e.g., 'LULUSAN_BARU'
  label: levelPengalamanDisplayMap[value] || value, // Human-readable label
}));

// Define the type for levelPengalaman based on the enum values
type LevelPengalamanValueType = typeof levelPengalamanEnum.enumValues[number];

type LevelPengalamanFormData = {
  levelPengalaman: LevelPengalamanValueType;
};

export default function LevelPengalamanForm() {
  const onboarding = useOnboarding();

  // Initialize with a valid machine-readable enum value
  const initialState: LevelPengalamanFormData = {
    levelPengalaman: onboarding.data?.levelPengalaman || levelPengalamanEnum.enumValues[0],
  };
  
  const [formData, setFormData] = useState<LevelPengalamanFormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (onboarding.data?.levelPengalaman) {
      // Ensure the value from context is a valid enum member
      if ((levelPengalamanEnum.enumValues as readonly string[]).includes(onboarding.data.levelPengalaman)) {
        setFormData({ levelPengalaman: onboarding.data.levelPengalaman as LevelPengalamanValueType });
      } else {
        // Fallback if context data is somehow invalid
        setFormData({ levelPengalaman: levelPengalamanEnum.enumValues[0] });
      }
    } else {
       setFormData({ levelPengalaman: levelPengalamanEnum.enumValues[0] });
    }
  }, [onboarding.data?.levelPengalaman]);

  const handleChange = (value: LevelPengalamanValueType) => { // Value from Select is already the machine-readable key
    setFormData({ levelPengalaman: value });
  };

  const handleSubmit = async () => {
    // Validate that formData.levelPengalaman is a valid enum key
    if (!(levelPengalamanEnum.enumValues as readonly string[]).includes(formData.levelPengalaman)) {
        toast.error("Level pengalaman tidak valid. Silakan pilih dari daftar.");
        return;
    }

    try {
      setIsSubmitting(true);
      
      if (onboarding && onboarding.updateFormValues && onboarding.navigateToNextStep) {
        // formData.levelPengalaman is already the machine-readable backend enum value
        console.log("Saving level pengalaman (machine-readable):", formData.levelPengalaman);
        
        onboarding.updateFormValues({ levelPengalaman: formData.levelPengalaman });
        
        toast.success("Level pengalaman berhasil disimpan");
        onboarding.navigateToNextStep();
      } else {
        console.error("Cannot submit form: OnboardingContext methods not available");
        toast.error("Terjadi kesalahan. Mohon refresh halaman dan coba lagi.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Gagal menyimpan level pengalaman. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (onboarding.isLoading) {
    return <div>Loading...</div>; // Or a proper skeleton loader
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Level Pengalaman</h2>
        <p className="text-muted-foreground">
          Pilih level pengalaman Anda saat ini.
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="levelPengalaman">Level Pengalaman</Label>
        <Select
          value={formData.levelPengalaman}
          onValueChange={(value) => handleChange(value as LevelPengalamanValueType)}
        >
          <SelectTrigger id="levelPengalaman">
            <SelectValue placeholder="Pilih level pengalaman" />
          </SelectTrigger>
          <SelectContent>
            {levelPengalamanOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <FormNav
        onSubmit={handleSubmit}
        disableNext={!formData.levelPengalaman}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}