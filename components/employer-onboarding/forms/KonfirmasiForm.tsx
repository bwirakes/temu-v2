"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEmployerOnboarding } from "@/lib/context/EmployerOnboardingContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/employer-onboarding/ui/FormLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Building2, Globe, UserCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function KonfirmasiForm() {
  const { data } = useEmployerOnboarding();
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isConfirmed) {
      toast.error("Harap konfirmasi pernyataan untuk melanjutkan.");
      return;
    }
    
    // Validate that we have all required data before submission
    if (!data.namaPerusahaan || !data.email || !data.pic?.nama || !data.pic?.nomorTelepon) {
      toast.error("Data tidak lengkap. Harap lengkapi semua data yang diperlukan.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This is the sole submission of all onboarding data to the backend
      const response = await fetch("/api/employer/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyelesaikan pendaftaran");
      }
      
      toast.success("Pendaftaran berhasil diselesaikan!");
      
      try {
        // Update the client-side session to reflect completed onboarding
        await updateSession({ user: { onboardingCompleted: true } });
        
        // Navigate to the dashboard - using router.push is more reliable than location change
        router.push("/employer/dashboard");
      } catch (sessionError) {
        console.error("Error updating session:", sessionError);
        // If session update fails, still try to navigate
        router.push("/employer/dashboard");
      }
    } catch (error) {
      console.error("Error submitting confirmation form:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Terjadi kesalahan saat menyelesaikan pendaftaran. Silakan coba lagi."
      );
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-indigo-600" />
              Informasi Perusahaan
            </CardTitle>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => router.push("/employer/onboarding/informasi-perusahaan")}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Nama Perusahaan</p>
              <p className="text-sm col-span-2">{data.namaPerusahaan || "-"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm col-span-2">{data.email || "-"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Merek Usaha</p>
              <p className="text-sm col-span-2">{data.merekUsaha || "-"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Industri</p>
              <p className="text-sm col-span-2">{data.industri || "-"}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Alamat Kantor</p>
              <p className="text-sm col-span-2">{data.alamatKantor || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Globe className="mr-2 h-5 w-5 text-indigo-600" />
              Kehadiran Online & Logo
            </CardTitle>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => router.push("/employer/onboarding/kehadiran-online")}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {data.logoUrl && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-500 mb-1">Logo Perusahaan</p>
                <Image 
                  src={data.logoUrl} 
                  alt="Logo Perusahaan" 
                  width={100} 
                  height={100} 
                  className="rounded-md border object-contain"
                  style={{ width: '100px', height: 'auto' }}
                />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <p className="text-sm font-medium text-gray-500">Website</p>
              <p className="text-sm col-span-2">{data.website || "-"}</p>
            </div>
            {data.socialMedia && Object.entries(data.socialMedia).map(([platform, link]) => link && (
              <div className="grid grid-cols-3 gap-2" key={platform}>
                <p className="text-sm font-medium text-gray-500 capitalize">{platform}</p>
                <p className="text-sm col-span-2">{link}</p>
              </div>
            ))}
            {(!data.socialMedia || Object.values(data.socialMedia).every(val => !val)) && !data.website && (
                 <p className="text-sm text-gray-500 col-span-3">Tidak ada data kehadiran online.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <UserCircle className="mr-2 h-5 w-5 text-indigo-600" />
              Penanggung Jawab (PIC)
            </CardTitle>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => router.push("/employer/onboarding/penanggung-jawab")}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
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
        
        <div className="flex items-start space-x-3 mt-8 p-4 border border-gray-200 rounded-md bg-gray-50">
          <Checkbox 
            id="confirmed" 
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
            className="mt-1"
          />
          <FormLabel htmlFor="confirmed" className="text-sm text-gray-700 leading-relaxed">
            Saya menyatakan bahwa semua data yang dimasukkan adalah benar dan saya berwenang 
            untuk mendaftarkan perusahaan ini pada platform.
          </FormLabel>
        </div>
        
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

      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto flex-1"
          onClick={() => {
            router.push("/employer/onboarding/penanggung-jawab");
          }}
          disabled={isSubmitting}
        >
          Kembali & Edit
        </Button>
        
        <Button
          type="submit"
          className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700"
          disabled={!isConfirmed || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </div>
          ) : (
            "Selesaikan Pendaftaran & Ke Dasbor"
          )}
        </Button>
      </div>
    </form>
  );
} 