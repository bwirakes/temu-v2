"use client";

import { useState, useEffect, useRef } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { PengalamanKerja } from "@/lib/db-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    navigateToNextStep,
    navigateToPreviousStep
  } = useOnboarding();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const isInitialMount = useRef(true);
  
  // Always initialize to false (no checkbox checked)
  const [tidakAdaPengalaman, setTidakAdaPengalaman] = useState(false);
  const [pengalamanList, setPengalamanList] = useState<PengalamanKerja[]>([]);
  
  // First useEffect - Initialize local state based on context data
  useEffect(() => {
    console.log("[PengalamanKerjaForm] Initializing with data:", data.pengalamanKerja);
    
    if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
      console.log("[PengalamanKerjaForm] Found existing data:", data.pengalamanKerja.length, "entries");
      
      // Only take valid entries that have required fields
      const validEntries = data.pengalamanKerja.filter(p => 
        p.namaPerusahaan && 
        p.posisi && 
        p.tanggalMulai && 
        (p.tanggalSelesai || p.tanggalSelesai === "Sekarang")
      );
      
      if (validEntries.length > 0) {
        setPengalamanList(validEntries);
        setTidakAdaPengalaman(false);
      } else if (data.pengalamanKerja.length > 0) {
        // If we had entries but none were valid, add a new empty one
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
        setTidakAdaPengalaman(false);
      } else {
        // Empty array in context
        setPengalamanList([]);
        // Don't check the box by default
        setTidakAdaPengalaman(false);
      }
    } else {
      // Default state - add one empty form
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
      setTidakAdaPengalaman(false);
    }
    
    setIsLoading(false);
    isInitialMount.current = false;
  }, []); // Only run on mount
  
  // Second useEffect - Update context when tidakAdaPengalaman changes
  useEffect(() => {
    // Skip initial render and loading state
    if (isInitialMount.current || isLoading) {
      return;
    }
    
    if (tidakAdaPengalaman) {
      console.log("[PengalamanKerjaForm] Updating context with empty pengalamanKerja");
      
      // Only update context if the current value doesn't match the target state
      // This prevents unnecessary context updates that cause re-renders
      if (data.pengalamanKerja?.length > 0) {
        // Update context with empty array
        updateFormValues({
          pengalamanKerja: []
        });
      }
      
      // Clear pengalaman list when tidakAdaPengalaman is true
      setPengalamanList([]);
    }
  }, [tidakAdaPengalaman, updateFormValues, isLoading, data.pengalamanKerja]);
  
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
    
    const newList = [newItem, ...pengalamanList];
    setPengalamanList(newList);
    
    // Only update context if "no experience" is not checked
    if (!tidakAdaPengalaman) {
      updateFormValues({
        pengalamanKerja: newList
      });
    }
  };
  
  // Update an existing pengalaman kerja entry
  const handleSavePengalaman = (item: PengalamanKerja) => {
    console.log("[PengalamanKerjaForm] Saving pengalaman item:", item.id);
    const updated = pengalamanList.map(p => p.id === item.id ? item : p);
    setPengalamanList(updated);
    
    // Only update context if "no experience" is not checked
    if (!tidakAdaPengalaman) {
      updateFormValues({
        pengalamanKerja: updated
      });
    }
  };
  
  // Delete a pengalaman kerja entry
  const handleDeletePengalaman = (id: string) => {
    console.log("[PengalamanKerjaForm] Deleting pengalaman item:", id);
    const filtered = pengalamanList.filter(p => p.id !== id);
    setPengalamanList(filtered);
    
    // Only update context if "no experience" is not checked
    if (!tidakAdaPengalaman) {
      updateFormValues({
        pengalamanKerja: filtered
      });
    }
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
  
  // Submit the form
  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      
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
        setIsProcessing(false);
        return;
      }
      
      // Update context with form values
      updateFormValues({
        pengalamanKerja: finalPengalamanList,
      });
      
      toast.success("Pengalaman kerja berhasil disimpan");
      
      // Navigate to next step
      navigateToNextStep();
    } catch (error) {
      console.error("[PengalamanKerjaForm] Form submission error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Terjadi kesalahan. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
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
      
      <div className="flex justify-between mt-8 space-x-4">
        <Button
          variant="outline"
          onClick={navigateToPreviousStep}
          className="w-full"
          disabled={isProcessing}
        >
          Kembali
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isProcessing || (!tidakAdaPengalaman && (
            pengalamanList.length === 0 || 
            pengalamanList.some(p => 
              !p.namaPerusahaan || 
              !p.posisi || 
              !p.tanggalMulai ||
              (!p.tanggalSelesai && p.tanggalSelesai !== "Sekarang")
            )
          ))}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span>Memproses...</span>
            </div>
          ) : (
            <span>Lanjutkan</span>
          )}
        </Button>
      </div>
    </div>
  );
}