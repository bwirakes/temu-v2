"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { useOnboarding, Pendidikan } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import FormNav from "@/components/FormNav";
import PendidikanItem from "./PendidikanItem";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { toast } from "sonner";

export default function PendidikanForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendidikanList, setPendidikanList] = useState<Pendidikan[]>(
    data.pendidikan || []
  );
  
  // Add a new education item with a unique ID
  const handleAddPendidikan = () => {
    const newId = Date.now().toString();
    const newItem: Pendidikan = {
      id: newId,
      namaInstitusi: "",
      lokasi: "",
      jenjangPendidikan: "",
      bidangStudi: "",
      tanggalLulus: "",
    };
    
    setPendidikanList([...pendidikanList, newItem]);
  };
  
  // Ensure at least one item is added on initial load if none exist
  useEffect(() => {
    if (pendidikanList.length === 0) {
      handleAddPendidikan();
    }
  }, []);
  
  // Save an education item
  const handleSavePendidikan = (item: Pendidikan) => {
    const updatedList = pendidikanList.map((p) => 
      p.id === item.id ? item : p
    );
    
    if (!updatedList.find((p) => p.id === item.id)) {
      updatedList.push(item);
    }
    
    setPendidikanList(updatedList);
  };
  
  // Delete an education item
  const handleDeletePendidikan = (id: string) => {
    const updatedList = pendidikanList.filter((p) => p.id !== id);
    setPendidikanList(updatedList);
  };
  
  // Submit the form and go to next step
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Update context with form values
      updateFormValues({
        pendidikan: pendidikanList,
      });
      
      // Save data to API with proper error handling
      try {
        await saveStep(4, { pendidikan: pendidikanList });
        toast.success("Riwayat pendidikan berhasil disimpan");
        
        // Navigate to next step
        setCurrentStep(5);
        router.push("/job-seeker/onboarding/pengalaman-kerja");
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
        {pendidikanList.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md">
            <p className="text-gray-500 mb-4">
              Kamu belum menambahkan riwayat pendidikan. Tambahkan pendidikan terakhir kamu untuk meningkatkan profil.
            </p>
            <Button onClick={handleAddPendidikan}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pendidikan
            </Button>
          </div>
        ) : (
          <>
            {pendidikanList.map((pendidikan, index) => (
              <PendidikanItem
                key={pendidikan.id}
                pendidikan={pendidikan}
                onSave={handleSavePendidikan}
                onDelete={handleDeletePendidikan}
                isNew={!pendidikan.namaInstitusi}
                expanded={index === 0 || !pendidikan.namaInstitusi}
                isPendidikanTerakhir={index === 0}
              />
            ))}
            
            <Button 
              variant="outline" 
              onClick={handleAddPendidikan}
              className="w-full py-6 border-dashed"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pendidikan Lainnya
            </Button>
          </>
        )}
      </div>
      
      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || isSaving}
        disableNext={pendidikanList.length === 0 || pendidikanList.some(p => !p.namaInstitusi || !p.lokasi || !p.jenjangPendidikan || (!p.tanggalLulus && p.tanggalLulus !== "Masih Kuliah"))}
        saveOnNext={true}
      />
    </div>
  );
}