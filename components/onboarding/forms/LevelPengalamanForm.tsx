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
import { toast } from "sonner";
import { MIN_WORK_EXPERIENCE_OPTIONS } from "@/lib/constants";

// Use consistent options from constants
const levelPengalamanOptions = MIN_WORK_EXPERIENCE_OPTIONS;

type LevelPengalamanEnum = typeof MIN_WORK_EXPERIENCE_OPTIONS[number]['value'];

interface LevelPengalamanFormData {
  levelPengalaman: LevelPengalamanEnum;
  jumlahPengalaman?: number;
  bidangKeahlian?: string;
  keterampilan?: string[];
}

export default function LevelPengalamanForm() {
  const { data, updateFormValues, navigateToNextStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state from existing data
  const initialLevelData: LevelPengalamanFormData = (() => {
    // If we have a stored value, use it
    if (data.levelPengalaman) {
      return { 
        levelPengalaman: data.levelPengalaman as LevelPengalamanEnum
      };
    } 
    // Default value
    else {
      return { levelPengalaman: "LULUSAN_BARU" };
    }
  })();
  
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
        levelPengalaman: formData.levelPengalaman
      });
      
      console.log("Saving level pengalaman:", formData.levelPengalaman);
      
      toast.success("Level pengalaman berhasil disimpan");
      navigateToNextStep();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Gagal menyimpan level pengalaman. Silakan coba lagi.");
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
            onValueChange={(value: LevelPengalamanEnum) => handleChange('levelPengalaman', value)}
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
        isSubmitting={isSubmitting}
        saveOnNext={false}
      />
    </div>
  );
}