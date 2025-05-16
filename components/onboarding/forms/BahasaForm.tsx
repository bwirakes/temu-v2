"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, PlusCircle } from "lucide-react";
import { Bahasa } from "@/lib/context/OnboardingContext";
import FormNav from "@/components/FormNav";

export default function BahasaForm() {
  const router = useRouter();
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const { saveStep, isLoading } = useOnboardingApi();
  const [error, setError] = useState<string | null>(null);
  const [newBahasa, setNewBahasa] = useState<Bahasa>({ nama: "", tingkat: undefined });
  const [bahasa, setBahasa] = useState<Bahasa[]>(data.bahasa || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddBahasa = () => {
    if (!newBahasa.nama) {
      setError("Nama bahasa wajib diisi");
      return;
    }

    setBahasa([...bahasa, { ...newBahasa }]);
    setNewBahasa({ nama: "", tingkat: undefined });
    setError(null);
  };

  const handleRemoveBahasa = (index: number) => {
    const updatedBahasa = [...bahasa];
    updatedBahasa.splice(index, 1);
    setBahasa(updatedBahasa);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      updateFormValues({ bahasa });
      await saveStep(10);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(11);
        router.push("/job-seeker/onboarding/informasi-tambahan");
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan data");
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      updateFormValues({ bahasa: [] });
      await saveStep(10);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(11);
        router.push("/onboarding/informasi-tambahan");
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal melewati langkah ini");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="namaBahasa">
            Bahasa Baru <span className="text-gray-500 text-sm font-normal">(Opsional)</span>
          </Label>
          <div className="flex space-x-2">
            <Input
              id="namaBahasa"
              placeholder="Contoh: Inggris, Mandarin, Jepang"
              value={newBahasa.nama}
              onChange={(e) =>
                setNewBahasa({ ...newBahasa, nama: e.target.value })
              }
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddBahasa();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddBahasa}
              disabled={!newBahasa.nama.trim()}
            >
              Tambah
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tingkatBahasa">Tingkat Kemampuan</Label>
          <Select
            value={newBahasa.tingkat}
            onValueChange={(value) =>
              setNewBahasa({ ...newBahasa, tingkat: value as "Pemula" | "Menengah" | "Mahir" | undefined })
            }
          >
            <SelectTrigger id="tingkatBahasa">
              <SelectValue placeholder="Pilih tingkat kemampuan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pemula">Pemula</SelectItem>
              <SelectItem value="Menengah">Menengah</SelectItem>
              <SelectItem value="Mahir">Mahir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          <Label className="mb-2 block">Daftar Bahasa</Label>
          {bahasa.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md">
              <p className="text-gray-500">
                Belum ada bahasa yang ditambahkan. Tambahkan bahasa yang Anda kuasai untuk meningkatkan profil.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {bahasa.map((item, index) => (
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
                    onClick={() => handleRemoveBahasa(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>

      <FormNav 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        disableNext={false}
        onSkip={handleSkip}
      />
    </div>
  );
}