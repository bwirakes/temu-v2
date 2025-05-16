"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { useOnboarding, PengalamanKerja } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormNav from "@/components/FormNav";
import PengalamanKerjaItem from "./PengalamanKerjaItem";

const levelPengalamanOptions = [
  "Baru lulus. Belum ada pengalaman kerja.",
  "Pengalaman magang atau PKL (Pengalaman Kerja Lapangan).",
  "Pengalaman kerja kurang 1 dari 1 tahun.",
  "Pengalaman kerja 1-2 tahun.",
  "Pengalaman kerja 3-5 tahun.",
  "Pengalaman kerja 5-10 tahun.",
  "Pengalaman kerja 10 tahun lebih.",
] as const;

export default function PengalamanKerjaForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pengalamanList, setPengalamanList] = useState<PengalamanKerja[]>(
    data.pengalamanKerja || []
  );
  const [levelPengalaman, setLevelPengalaman] = useState<string>(
    levelPengalamanOptions[0]
  );

  const handleAddPengalaman = () => {
    const newId = Date.now().toString();
    const newItem: PengalamanKerja = {
      id: newId,
      levelPengalaman: levelPengalaman as PengalamanKerja["levelPengalaman"],
      namaPerusahaan: "",
      posisi: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      lokasiKerja: "WFO",
    };
    
    setPengalamanList([...pengalamanList, newItem]);
  };
  
  const handleSavePengalaman = (item: PengalamanKerja) => {
    const updatedList = pengalamanList.map((p) => 
      p.id === item.id ? item : p
    );
    
    if (!updatedList.find((p) => p.id === item.id)) {
      updatedList.push(item);
    }
    
    setPengalamanList(updatedList);
  };
  
  const handleDeletePengalaman = (id: string) => {
    const updatedList = pengalamanList.filter((p) => p.id !== id);
    setPengalamanList(updatedList);
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    updateFormValues({
      pengalamanKerja: pengalamanList,
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(3);
      router.push("/onboarding/pendidikan");
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">

        <div className="mt-8">
          {pengalamanList.map((pengalaman) => (
            <PengalamanKerjaItem
              key={pengalaman.id}
              pengalaman={pengalaman}
              onSave={handleSavePengalaman}
              onDelete={handleDeletePengalaman}
              isNew={!pengalaman.namaPerusahaan}
            />
          ))}
          
          <Button 
            variant="outline" 
            onClick={handleAddPengalaman}
            className="w-full py-6 border-dashed mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Pengalaman Kerja
          </Button>
        </div>
      </div>
      
      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}