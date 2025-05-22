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
import { MIN_WORK_EXPERIENCE_OPTIONS } from "@/lib/constants";
import { OnboardingData } from "@/lib/db-types";

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
  // Initial empty state to avoid SSR issues
  const initialState: LevelPengalamanFormData = {
    levelPengalaman: "LULUSAN_BARU"
  };
  
  const [formData, setFormData] = useState<LevelPengalamanFormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Try to access OnboardingContext, but handle the case when it doesn't exist
  let onboardingData: OnboardingData | undefined;
  let updateFormValues: ((values: Partial<OnboardingData>) => void) | undefined;
  let navigateToNextStep: (() => void) | undefined;
  
  try {
    const onboarding = useOnboarding();
    onboardingData = onboarding.data;
    updateFormValues = onboarding.updateFormValues;
    navigateToNextStep = onboarding.navigateToNextStep;
    
    // Initialize form state from existing data (but only after the context is available)
    useEffect(() => {
      if (onboardingData?.levelPengalaman) {
        setFormData({ 
          levelPengalaman: onboardingData.levelPengalaman as LevelPengalamanEnum
        });
      }
    }, [onboardingData]);
  } catch (error) {
    // Context not available (during SSR or if component is used outside provider)
    console.warn("OnboardingContext not available. Component will render with default values.");
  }

  const handleChange = (field: keyof LevelPengalamanFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Make sure we have the context before updating
      if (updateFormValues && navigateToNextStep) {
        // Update context with form values
        updateFormValues({
          levelPengalaman: formData.levelPengalaman
        });
        
        console.log("Saving level pengalaman:", formData.levelPengalaman);
        
        toast.success("Level pengalaman berhasil disimpan");
        navigateToNextStep();
      } else {
        console.error("Cannot submit form: OnboardingContext not available");
        toast.error("Terjadi kesalahan. Mohon refresh halaman dan coba lagi.");
      }
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