"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { useOnboarding, PengalamanKerja } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FormNav from "@/components/FormNav";
import PengalamanKerjaItem from "./PengalamanKerjaItem";
import { FormLabel } from "@/components/ui/form-label";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { toast } from "sonner";

// Updated to match exact database enum values
const levelPengalamanOptions = [
  "Baru lulus",
  "Pengalaman magang",
  "Kurang dari 1 tahun", 
  "1-2 tahun",
  "3-5 tahun",
  "5-10 tahun",
  "10 tahun lebih",
] as const;

export default function PengalamanKerjaForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pengalamanList, setPengalamanList] = useState<PengalamanKerja[]>([]);
  const [levelPengalaman, setLevelPengalaman] = useState<string>(
    levelPengalamanOptions[0]
  );
  const [tidakAdaPengalaman, setTidakAdaPengalaman] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with existing data or create default item
  useEffect(() => {
    if (isInitialized) return;
    
    if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
      // If there's existing data, use it
      setPengalamanList(data.pengalamanKerja);
      setTidakAdaPengalaman(false);
    } else {
      // Create a default item if there's no data
      const newId = Date.now().toString();
      const defaultItem: PengalamanKerja = {
        id: newId,
        levelPengalaman: levelPengalaman as PengalamanKerja["levelPengalaman"],
        namaPerusahaan: "",
        posisi: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        lokasiKerja: "WFO",
      };
      
      setPengalamanList([defaultItem]);
    }
    
    setIsInitialized(true);
  }, [data.pengalamanKerja, levelPengalaman, isInitialized]);

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
    
    // If all items are deleted, add a default one
    if (updatedList.length === 0 && !tidakAdaPengalaman) {
      handleAddPengalaman();
    }
  };
  
  const handleTidakAdaPengalamanChange = (checked: boolean) => {
    setTidakAdaPengalaman(checked);
    
    if (checked) {
      // Save the current items in case user changes their mind
      // But clear the visible list
      setPengalamanList([]);
    } else {
      // If unchecking and there are no items, add a default one
      if (pengalamanList.length === 0) {
        handleAddPengalaman();
      }
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // If "no experience" is checked, submit an empty array
      // Otherwise, submit the current list
      const finalPengalamanList = tidakAdaPengalaman ? [] : pengalamanList;
      
      // Validate required fields before submission
      const hasInvalidEntries = !tidakAdaPengalaman && finalPengalamanList.some(p => 
        !p.namaPerusahaan || 
        !p.posisi || 
        !p.tanggalMulai ||
        (!p.tanggalSelesai && p.tanggalSelesai !== "Sekarang")
      );
      
      if (hasInvalidEntries) {
        toast.error("Mohon lengkapi semua data pengalaman kerja");
        setIsSubmitting(false);
        return;
      }
      
      // Update context with form values
      updateFormValues({
        pengalamanKerja: finalPengalamanList,
      });
      
      // Save data to API with proper error handling
      try {
        // Using correct step number 6 for Pengalaman Kerja
        await saveStep(6, { pengalamanKerja: finalPengalamanList });
        toast.success("Pengalaman kerja berhasil disimpan");
        
        // Navigate to next step
        setCurrentStep(7);
        router.push("/job-seeker/onboarding/ekspektasi-kerja");
      } catch (apiError) {
        console.error("API Error:", apiError);
        const errorMessage = apiError instanceof Error 
          ? apiError.message 
          : "Gagal menyimpan data ke server. Silakan coba lagi.";
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Gagal mengirim formulir. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* No Work Experience Checkbox */}
        <div className="flex items-center space-x-2 border p-4 rounded-md bg-slate-50">
          <Checkbox
            id="tidakAdaPengalaman"
            checked={tidakAdaPengalaman}
            onCheckedChange={(checked) => handleTidakAdaPengalamanChange(checked === true)}
          />
          <FormLabel
            htmlFor="tidakAdaPengalaman"
            className="text-sm font-medium cursor-pointer"
          >
            Saya belum memiliki pengalaman kerja
          </FormLabel>
        </div>
        
        {!tidakAdaPengalaman && (
          <div className="mt-8">
            {pengalamanList.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-md">
                <p className="text-gray-500 mb-4">
                  Kamu belum menambahkan pengalaman kerja. Tambahkan pengalaman kerja untuk meningkatkan profil.
                </p>
                <Button onClick={handleAddPengalaman}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Pengalaman Kerja
                </Button>
              </div>
            ) : (
              <>
                {pengalamanList.map((pengalaman, index) => (
                  <PengalamanKerjaItem
                    key={pengalaman.id}
                    pengalaman={pengalaman}
                    onSave={handleSavePengalaman}
                    onDelete={handleDeletePengalaman}
                    isNew={!pengalaman.namaPerusahaan}
                    expanded={index === 0 || !pengalaman.namaPerusahaan}
                    isPengalamanTerakhir={index === 0}
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
              </>
            )}
          </div>
        )}
      </div>
      
      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || isSaving}
        disableNext={!tidakAdaPengalaman && (
          pengalamanList.length === 0 || 
          pengalamanList.some(p => 
            !p.namaPerusahaan || 
            !p.posisi || 
            !p.tanggalMulai ||
            (!p.tanggalSelesai && p.tanggalSelesai !== "Sekarang")
          )
        )}
        saveOnNext={true}
      />
    </div>
  );
}