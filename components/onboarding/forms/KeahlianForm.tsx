"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, PlusCircle } from "lucide-react";

import { useOnboarding, Keahlian } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormNav from "@/components/FormNav";

export default function KeahlianForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keahlianList, setKeahlianList] = useState<Keahlian[]>(
    data.keahlian || []
  );
  const [newKeahlian, setNewKeahlian] = useState("");
  const [selectedTingkat, setSelectedTingkat] = useState<"Pemula" | "Menengah" | "Mahir">("Menengah");
  
  // Add a new skill
  const handleAddKeahlian = () => {
    if (newKeahlian.trim() === "") return;
    
    const newItem: Keahlian = {
      nama: newKeahlian.trim(),
      tingkat: selectedTingkat,
    };
    
    setKeahlianList([...keahlianList, newItem]);
    setNewKeahlian("");
  };
  
  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeahlian();
    }
  };
  
  // Delete a skill
  const handleDeleteKeahlian = (nama: string) => {
    const updatedList = keahlianList.filter((item) => item.nama !== nama);
    setKeahlianList(updatedList);
  };
  
  // Submit the form and go to next step
  const handleSubmit = () => {
    if (keahlianList.length === 0) return;
    
    setIsSubmitting(true);
    
    // Save skills to context
    updateFormValues({
      keahlian: keahlianList,
    });
    
    // Navigate to the next step
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(9);
      router.push("/job-seeker/onboarding/sertifikasi");
    }, 500);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newKeahlian">
            Keahlian Baru <span className="text-red-500">*</span>
          </Label>
          <div className="flex space-x-2">
            <Input
              id="newKeahlian"
              value={newKeahlian}
              onChange={(e) => setNewKeahlian(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Contoh: JavaScript, Microsoft Excel, Bahasa Inggris"
            />
            <Button 
              type="button" 
              onClick={handleAddKeahlian}
              disabled={newKeahlian.trim() === ""}
            >
              Tambah
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Tingkat Keahlian</Label>
          <RadioGroup
            value={selectedTingkat}
            onValueChange={(val) => setSelectedTingkat(val as "Pemula" | "Menengah" | "Mahir")}
            className="flex flex-row space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pemula" id="pemula" />
              <Label htmlFor="pemula" className="cursor-pointer">Pemula</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Menengah" id="menengah" />
              <Label htmlFor="menengah" className="cursor-pointer">Menengah</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Mahir" id="mahir" />
              <Label htmlFor="mahir" className="cursor-pointer">Mahir</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="mt-6">
          <Label className="mb-2 block">Daftar Keahlian</Label>
          {keahlianList.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md">
              <p className="text-gray-500">
                Belum ada keahlian yang ditambahkan. Tambahkan keahlian Anda untuk meningkatkan profil.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {keahlianList.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center rounded-full px-3 py-1 text-sm ${
                    item.tingkat === "Pemula" 
                      ? "bg-blue-100 text-blue-800" 
                      : item.tingkat === "Menengah"
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  <span>{item.nama}</span>
                  {item.tingkat && <span className="mx-1 text-xs">•</span>}
                  {item.tingkat && <span className="text-xs">{item.tingkat}</span>}
                  <button
                    type="button"
                    onClick={() => handleDeleteKeahlian(item.nama)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        

      </div>
      
      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        disableNext={keahlianList.length === 0}
      />
    </div>
  );
}