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
  const { 
    data, 
    updateFormValues, 
    saveCurrentStepData, 
    navigateToNextStep,
    isSaving: contextIsSaving
  } = useOnboarding();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize state values with defaults - WITHOUT calling context updates during initialization
  // We'll determine this based on the existing data but not update context immediately
  const [tidakAdaPengalaman, setTidakAdaPengalaman] = useState(false);
  const [pengalamanList, setPengalamanList] = useState<PengalamanKerja[]>([]);
  
  // First useEffect - Initialize local state based on context data
  useEffect(() => {
    console.log("[PengalamanKerjaForm] Initializing with data:", data.pengalamanKerja);
    const hasNoExperience = !data.pengalamanKerja || data.pengalamanKerja.length === 0;
    
    // Set tidakAdaPengalaman based on data
    setTidakAdaPengalaman(hasNoExperience);
    
    if (hasNoExperience) {
      console.log("[PengalamanKerjaForm] No existing data, initializing empty");
      setPengalamanList([]);
    } else {
      console.log("[PengalamanKerjaForm] Found existing data:", data.pengalamanKerja.length, "entries");
      
      // Only take valid entries that have required fields
      const validEntries = data.pengalamanKerja.filter(p => 
        p.namaPerusahaan && 
        p.posisi && 
        p.tanggalMulai && 
        (p.tanggalSelesai || p.tanggalSelesai === "Sekarang")
      );
      
      setPengalamanList(validEntries);
      
      // If the filtered list is empty but we had original entries, add a new empty one
      if (validEntries.length === 0 && data.pengalamanKerja.length > 0) {
        const newItem: PengalamanKerja = {
          id: Date.now().toString(),
          levelPengalaman: "Baru lulus",
          namaPerusahaan: "",
          posisi: "",
          tanggalMulai: "",
          tanggalSelesai: "",
          lokasiKerja: "WFO",
        };
        setPengalamanList([newItem]);
      }
    }
    
    setIsLoading(false);
  }, []); // Only run on mount
  
  // Second useEffect - Update context when tidakAdaPengalaman changes AFTER component has mounted
  useEffect(() => {
    // Skip initial render to avoid updating during mount
    if (isLoading) return;
    
    if (tidakAdaPengalaman) {
      console.log("[PengalamanKerjaForm] Updating context with empty pengalamanKerja due to tidakAdaPengalaman");
      
      // Update context with empty array
      updateFormValues({
        pengalamanKerja: []
      });
      
      // Clear pengalaman list when tidakAdaPengalaman is true
      if (pengalamanList.length > 0) {
        setPengalamanList([]);
      }
    }
  }, [tidakAdaPengalaman, updateFormValues, isLoading, pengalamanList.length]);
  
  // Add a new empty pengalaman kerja entry
  const handleAddPengalaman = () => {
    console.log("[PengalamanKerjaForm] Adding new pengalaman entry");
    const newItem: PengalamanKerja = {
      id: Date.now().toString(),
      levelPengalaman: "Baru lulus",
      namaPerusahaan: "",
      posisi: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      lokasiKerja: "WFO",
    };
    
    setPengalamanList(prev => [newItem, ...prev]);
  };
  
  // Update an existing pengalaman kerja entry
  const handleSavePengalaman = (item: PengalamanKerja) => {
    console.log("[PengalamanKerjaForm] Saving pengalaman item:", item.id);
    setPengalamanList(prev => {
      const updated = prev.map(p => p.id === item.id ? item : p);
      
      // Update context with the new list - but only if we're not in "no experience" mode
      if (!tidakAdaPengalaman) {
        updateFormValues({
          pengalamanKerja: updated
        });
      }
      
      return updated;
    });
  };
  
  // Delete a pengalaman kerja entry
  const handleDeletePengalaman = (id: string) => {
    console.log("[PengalamanKerjaForm] Deleting pengalaman item:", id);
    setPengalamanList(prev => {
      const filtered = prev.filter(p => p.id !== id);
      
      // Update context with the new list - but only if we're not in "no experience" mode
      if (!tidakAdaPengalaman) {
        updateFormValues({
          pengalamanKerja: filtered
        });
      }
      
      return filtered;
    });
  };
  
  // Toggle tidakAdaPengalaman checkbox
  const handleTidakAdaPengalamanChange = (checked: boolean) => {
    console.log("[PengalamanKerjaForm] Toggling tidakAdaPengalaman:", checked);
    setTidakAdaPengalaman(checked);
    
    if (!checked && pengalamanList.length === 0) {
      // If experience is required but no entries exist, add an empty one
      handleAddPengalaman();
    }
  };
  
  // Submit the form - simplified to match PendidikanForm approach
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
        console.log("[PengalamanKerjaForm] Form validation failed - incomplete entries");
        toast.error("Mohon lengkapi semua data pengalaman kerja");
        setIsSubmitting(false);
        return;
      }
      
      // Update context with form values (simplifying like in PendidikanForm)
      updateFormValues({
        pengalamanKerja: finalPengalamanList,
      });
      
      // Save data using the context's saveCurrentStepData function
      try {
        const saveSuccess = await saveCurrentStepData();
        
        if (saveSuccess) {
          toast.success("Pengalaman kerja berhasil disimpan");
          // Navigate to next step on success
          navigateToNextStep();
        } else {
          toast.error("Gagal menyimpan data pengalaman kerja");
        }
      } catch (apiError) {
        console.error("[PengalamanKerjaForm] API Error:", apiError);
        const errorMessage = apiError instanceof Error 
          ? apiError.message 
          : "Gagal menyimpan data ke server. Silakan coba lagi.";
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("[PengalamanKerjaForm] Form submission error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Gagal mengirim formulir. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Memuat data pengalaman kerja...</div>;
  }
  
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
        isSubmitting={isSubmitting || contextIsSaving}
        disableNext={!tidakAdaPengalaman && (
          pengalamanList.length === 0 || 
          pengalamanList.some(p => 
            !p.namaPerusahaan || 
            !p.posisi || 
            !p.tanggalMulai ||
            (!p.tanggalSelesai && p.tanggalSelesai !== "Sekarang")
          )
        )}
        saveOnNext={false}
      />
    </div>
  );
}