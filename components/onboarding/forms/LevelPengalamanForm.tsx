"use client";

import { useState } from "react";
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
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { toast } from "sonner";

// Define possible experience levels
const levelPengalamanOptions = [
  { value: "entry_level", label: "Baru lulus / Entry Level" },
  { value: "junior", label: "Junior (1-2 tahun)" },
  { value: "mid_level", label: "Menengah (3-5 tahun)" },
  { value: "senior", label: "Senior (5-10 tahun)" },
  { value: "lead", label: "Lead / Manager (5+ tahun)" },
  { value: "executive", label: "Eksekutif / Direktur (10+ tahun)" },
];

interface LevelPengalamanFormData {
  levelPengalaman: string;
  jumlahPengalaman?: number;
  bidangKeahlian?: string;
  keterampilan?: string[];
}

export default function LevelPengalamanForm() {
  const { data, updateFormValues, navigateToNextStep, currentStep } = useOnboarding();
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state from existing data
  const initialLevelData: LevelPengalamanFormData = 
    typeof data.levelPengalaman === 'string' && data.levelPengalaman 
      ? JSON.parse(data.levelPengalaman) 
      : typeof data.levelPengalaman === 'object' && data.levelPengalaman !== null
      ? data.levelPengalaman as any
      : { levelPengalaman: "entry_level" };
  
  const [formData, setFormData] = useState<LevelPengalamanFormData>(initialLevelData);

  const handleChange = (field: keyof LevelPengalamanFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Update context with form values
      updateFormValues({
        levelPengalaman: JSON.stringify(formData)
      });
      
      // Save level pengalaman data to API
      try {
        await saveStep(currentStep, { levelPengalaman: JSON.stringify(formData) });
        toast.success("Level pengalaman berhasil disimpan");
        
        // Use the centralized navigation function
        navigateToNextStep();
      } catch (error) {
        console.error("Error saving level pengalaman:", error);
        toast.error("Gagal menyimpan level pengalaman. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Level Pengalaman Kerja</h2>
          <p className="text-gray-500">
            Pilih level pengalaman kerja Anda untuk membantu kami menemukan pekerjaan yang sesuai dengan keahlian Anda.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Level Pengalaman Kerja</Label>
          <Select
            value={formData.levelPengalaman}
            onValueChange={(value) => handleChange('levelPengalaman', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih level pengalaman" />
            </SelectTrigger>
            <SelectContent>
              {levelPengalamanOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-2 text-sm text-gray-500">
            <p>Pilih level pengalaman yang paling menggambarkan situasi Anda saat ini.</p>
          </div>
        </div>
      </div>

      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || isSaving}
        saveOnNext={false}
      />
    </div>
  );
}