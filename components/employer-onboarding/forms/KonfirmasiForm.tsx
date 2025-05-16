"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEmployerOnboarding } from "@/lib/context/EmployerOnboardingContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/employer-onboarding/ui/FormLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Building2, Globe, UserCircle, AlertCircle } from "lucide-react";

export default function KonfirmasiForm() {
  const { data, updateFormValues, saveCurrentStepData } = useEmployerOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Add console logging to debug the PIC data
  console.log("KonfirmasiForm data:", data);
  console.log("PIC data:", data.pic);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConfirmed) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Update the data to mark as confirmed
    updateFormValues({
      isConfirmed: true,
    });

    try {
      // Save all data to the API
      console.log("Saving all employer data to the API...");
      const saveSuccessful = await saveCurrentStepData();
      
      if (saveSuccessful) {
        console.log("All data saved successfully, navigating to success page");
        // Navigate to success page
        router.push("/employer/onboarding/success");
      } else {
        console.error("Failed to save employer data");
        // Show error
        alert("Gagal menyimpan data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">
            Luar Biasa! Semua Data Telah Terisi
          </h3>
          <p className="text-gray-600 mt-2">
            Silakan periksa kembali informasi yang telah Anda berikan sebelum menyelesaikan proses pendaftaran.
          </p>
        </div>

        {/* Navigation Links for Editing */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ingin mengubah data?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 flex items-center justify-center gap-1"
              onClick={() => router.push("/employer/onboarding/informasi-perusahaan")}
              type="button"
            >
              <Building2 className="w-4 h-4" /> Informasi Perusahaan
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 flex items-center justify-center gap-1"
              onClick={() => router.push("/employer/onboarding/kehadiran-online")}
              type="button"
            >
              <Globe className="w-4 h-4" /> Kehadiran Online
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 flex items-center justify-center gap-1"
              onClick={() => router.push("/employer/onboarding/penanggung-jawab")}
              type="button"
            >
              <UserCircle className="w-4 h-4" /> Penanggung Jawab
            </Button>
          </div>
        </div>

        {/* Informasi Perusahaan */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-md">Informasi Dasar Badan Usaha</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Nama Perusahaan</p>
              <p className="text-sm col-span-2">{data.namaPerusahaan}</p>
            </div>
            
            {data.merekUsaha && (
              <div className="grid grid-cols-3 gap-2">
                <p className="text-sm font-medium text-gray-500">Merek Usaha</p>
                <p className="text-sm col-span-2">{data.merekUsaha}</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Industri</p>
              <p className="text-sm col-span-2">{data.industri}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Alamat Kantor</p>
              <p className="text-sm col-span-2 whitespace-pre-line">{data.alamatKantor}</p>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Online */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-md">Kehadiran Online dan Identitas Merek</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.website && (
              <div className="grid grid-cols-3 gap-2">
                <p className="text-sm font-medium text-gray-500">Website</p>
                <p className="text-sm col-span-2">{data.website}</p>
              </div>
            )}
            
            {data.logoUrl && (
              <div className="grid grid-cols-3 gap-2">
                <p className="text-sm font-medium text-gray-500">Logo</p>
                <div className="col-span-2">
                  <img 
                    src={data.logoUrl} 
                    alt="Logo perusahaan" 
                    className="max-h-20 border rounded-md"
                  />
                </div>
              </div>
            )}
            
            {data.socialMedia && Object.entries(data.socialMedia).some(([_, value]) => value) && (
              <div className="grid grid-cols-3 gap-2">
                <p className="text-sm font-medium text-gray-500">Media Sosial</p>
                <div className="text-sm col-span-2 space-y-1">
                  {data.socialMedia.instagram && <p>Instagram: @{data.socialMedia.instagram}</p>}
                  {data.socialMedia.linkedin && <p>LinkedIn: {data.socialMedia.linkedin}</p>}
                  {data.socialMedia.facebook && <p>Facebook: {data.socialMedia.facebook}</p>}
                  {data.socialMedia.twitter && <p>Twitter/X: @{data.socialMedia.twitter}</p>}
                  {data.socialMedia.tiktok && <p>TikTok: @{data.socialMedia.tiktok}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penanggung Jawab */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-md">Penanggung Jawab (PIC)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {data.pic && data.pic.nama ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm font-medium text-gray-500">Nama PIC</p>
                  <p className="text-sm col-span-2">{data.pic.nama}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <p className="text-sm font-medium text-gray-500">Nomor HP PIC</p>
                  <p className="text-sm col-span-2">{data.pic.nomorTelepon}</p>
                </div>
              </>
            ) : (
              <div className="text-sm text-yellow-600">
                Data PIC belum diisi. Silakan kembali ke langkah sebelumnya untuk mengisi data penanggung jawab.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Konfirmasi */}
        <div className="flex items-center space-x-2 mt-8">
          <Checkbox 
            id="confirmed" 
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
          />
          <FormLabel htmlFor="confirmed" className="text-sm text-gray-700">
            Saya menyatakan bahwa semua data yang dimasukkan adalah benar dan saya berwenang 
            untuk mendaftarkan perusahaan ini pada platform.
          </FormLabel>
        </div>
        
        {/* Warning Note */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">Penting:</p>
              <p>Pastikan semua informasi sudah benar sebelum melanjutkan. Setelah konfirmasi, Anda akan terdaftar sebagai employer dan dapat langsung mulai membuat lowongan kerja.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            router.push("/employer/onboarding/penanggung-jawab");
          }}
        >
          Kembali & Edit
        </Button>
        
        <Button
          type="submit"
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={!isConfirmed || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </div>
          ) : (
            "Selesaikan Pendaftaran"
          )}
        </Button>
      </div>
    </form>
  );
} 