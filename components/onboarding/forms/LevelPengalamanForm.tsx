"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

const levelPengalamanOptions = [
  "Baru lulus. Belum ada pengalaman kerja.",
  "Pengalaman magang atau PKL (Pengalaman Kerja Lapangan).",
  "Pengalaman kerja kurang 1 dari 1 tahun.",
  "Pengalaman kerja 1-2 tahun.",
  "Pengalaman kerja 3-5 tahun.",
  "Pengalaman kerja 5-10 tahun.",
  "Pengalaman kerja 10 tahun lebih.",
] as const;

export default function LevelPengalamanForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>(
    data.pengalamanKerja?.[0]?.levelPengalaman || levelPengalamanOptions[0]
  );

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    updateFormValues({
      pengalamanKerja: [{
        id: Date.now().toString(),
        levelPengalaman: selectedLevel as any,
        namaPerusahaan: "",
        posisi: "",
        tanggalMulai: "",
        tanggalSelesai: "",
      }],
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(7);
      router.push("/job-seeker/onboarding/pengalaman-kerja");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Level Pengalaman Kerja</Label>
          <Select
            value={selectedLevel}
            onValueChange={setSelectedLevel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih level pengalaman" />
            </SelectTrigger>
            <SelectContent>
              {levelPengalamanOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}