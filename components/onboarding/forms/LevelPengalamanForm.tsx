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

// Use levelPengalamanEnum to define options
const levelPengalamanOptions = levelPengalamanEnum.enumValues.map(value => ({
  value: value,
  label: value, // Using the enum value as both value and label
}));

// Define the type for levelPengalaman based on the enum values
type LevelPengalamanValueType = typeof levelPengalamanEnum.enumValues[number];

interface LevelPengalamanFormData {
  levelPengalaman: LevelPengalamanValueType;
  jumlahPengalaman?: number;
  bidangKeahlian?: string;
  keterampilan?: string[];
}

export default function LevelPengalamanForm() {
  // Initialize with a valid value from levelPengalamanEnum
  const initialState: LevelPengalamanFormData = {
    levelPengalaman: levelPengalamanEnum.enumValues[0] || "" as LevelPengalamanValueType, // Default to the first enum value (now "Lulusan Baru / Fresh Graduate")
  };
  
  const [formData, setFormData] = useState<LevelPengalamanFormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contextError, setContextError] = useState<Error | null>(null);
  
  const onboarding = useOnboarding();
  
  useEffect(() => {
    try {
      if (onboarding.data?.levelPengalaman) {
        // Ensure the value from context is a valid enum member
        if (levelPengalamanEnum.enumValues.includes(onboarding.data.levelPengalaman)) {
          setFormData(prev => ({ ...prev, levelPengalaman: onboarding.data.levelPengalaman as LevelPengalamanValueType }));
        } else {
          console.warn(`Invalid levelPengalaman value from context: ${onboarding.data.levelPengalaman}. Using default.`);
          setFormData(prev => ({ ...prev, levelPengalaman: initialState.levelPengalaman }));
        }
      } else {
        // If context has no value, ensure form is set to its initial state
        setFormData(prev => ({ ...prev, levelPengalaman: initialState.levelPengalaman }));
      }
    } catch (error) {
      console.warn("Error initializing from context:", error);
      setContextError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [onboarding.data?.levelPengalaman, initialState.levelPengalaman]);

  const handleChange = (field: keyof LevelPengalamanFormData, value: LevelPengalamanValueType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (onboarding.updateFormValues && onboarding.navigateToNextStep) {
        onboarding.updateFormValues({
          levelPengalaman: formData.levelPengalaman // This is now correctly typed
        });
        
        console.log("Saving level pengalaman:", formData.levelPengalaman);
        
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Level Pengalaman Kerja</h2>
          <p className="text-gray-500">
            Pilih level pengalaman kerja Anda untuk membantu kami menemukan pekerjaan yang sesuai dengan keahlian Anda.
          </p>
        </div>
        
        {contextError && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
            <p>Terjadi kesalahan saat memuat data. Mohon refresh halaman atau coba lagi nanti.</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="levelPengalaman">Level Pengalaman Kerja</Label>
          <Select
            name="levelPengalaman"
            value={formData.levelPengalaman}
            onValueChange={(value: LevelPengalamanValueType) => handleChange('levelPengalaman', value)}
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