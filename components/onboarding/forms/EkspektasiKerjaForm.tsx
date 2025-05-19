"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { EkspektasiKerja } from "@/lib/db-types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form-label";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const ekspektasiKerjaSchema = z.object({
  jobTypes: z.string().min(1, "Jenis pekerjaan wajib diisi"),
  idealSalary: z.coerce.number().positive("Gaji ideal harus lebih dari 0"),
  willingToTravel: z.enum(["wfh", "wfo", "travel", "relocate"], {
    required_error: "Pilih salah satu opsi",
  }),
  preferensiLokasiKerja: z.enum(["local_only", "domestic", "international"], {
    required_error: "Pilih salah satu opsi",
  }),
});

type EkspektasiKerjaValues = {
  jobTypes: string;
  idealSalary: number;
  willingToTravel: "wfh" | "wfo" | "travel" | "relocate";
  preferensiLokasiKerja: "local_only" | "domestic" | "international";
};

export default function EkspektasiKerjaForm() {
  const { 
    data, 
    updateFormValues, 
    navigateToNextStep,
    navigateToPreviousStep
  } = useOnboarding();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Parse existing ekspektasiKerja if it's a string
  let existingData: Partial<EkspektasiKerjaValues> = {};
  if (typeof data.ekspektasiKerja === 'string' && data.ekspektasiKerja) {
    try {
      existingData = JSON.parse(data.ekspektasiKerja);
    } catch (e) {
      console.error("Failed to parse ekspektasiKerja JSON:", e);
    }
  } else if (data.ekspektasiKerja && typeof data.ekspektasiKerja === 'object') {
    // Directly use the object
    existingData = data.ekspektasiKerja as any;
  }
  
  // Log existing data to help with debugging
  console.log("Existing ekspektasiKerja data:", existingData);
  
  // Prepare the default values
  const defaultValues: Partial<EkspektasiKerjaValues> = {
    jobTypes: existingData.jobTypes || "",
    idealSalary: existingData.idealSalary || undefined,
    willingToTravel: existingData.willingToTravel as any || "wfo",
    preferensiLokasiKerja: existingData.preferensiLokasiKerja as any || "local_only",
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EkspektasiKerjaValues>({
    resolver: zodResolver(ekspektasiKerjaSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Submit the form and navigate to the next step in the onboarding flow
  const onSubmit = async (values: EkspektasiKerjaValues) => {
    try {
      setIsProcessing(true);
      
      // Ensure idealSalary is a number
      const idealSalary = typeof values.idealSalary === 'string' 
        ? parseInt(values.idealSalary, 10) 
        : values.idealSalary;
      
      const ekspektasiData: EkspektasiKerja = {
        jobTypes: values.jobTypes,
        idealSalary: idealSalary,
        willingToTravel: values.willingToTravel,
        preferensiLokasiKerja: values.preferensiLokasiKerja,
      };
      
      console.log("Updating ekspektasiKerja data:", ekspektasiData);
      
      // Save form values to context
      updateFormValues({
        ekspektasiKerja: ekspektasiData,
      });
      
      toast.success("Ekspektasi kerja berhasil disimpan");
      
      // Navigate to next step
      navigateToNextStep();
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Terjadi kesalahan. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        {/* Job Types */}
        <div className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="jobTypes" className="text-lg font-medium">
              Bantu kami pahami loker yang cocok dengan kamu!
            </FormLabel>
            <p className="text-gray-500 text-sm">
              Sebutkan sebanyak-banyaknya jenis pekerjaan apa yang kamu inginkan
            </p>
            <Textarea
              id="jobTypes"
              placeholder="Contoh: Office Boy, Resepsionis, Sales, Software Engineer, Digital Marketing Specialist, Barista"
              className={cn(
                "min-h-32 mt-2",
                errors.jobTypes ? "border-red-500 focus-visible:ring-red-500" : ""
              )}
              {...register("jobTypes")}
            />
            {errors.jobTypes && (
              <p className="text-sm text-red-500 mt-1">{errors.jobTypes.message}</p>
            )}
          </div>
        </div>
        
        {/* Ideal Salary */}
        <div className="space-y-4">
          <FormLabel htmlFor="idealSalary" className="text-lg font-medium">
            Berapa harapan gaji yang kamu inginkan?
          </FormLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              Rp
            </span>
            <Input
              id="idealSalary"
              type="number"
              placeholder="8000000"
              className={cn(
                "pl-8",
                errors.idealSalary ? "border-red-500 focus-visible:ring-red-500" : ""
              )}
              {...register("idealSalary")}
            />
          </div>
          {errors.idealSalary && (
            <p className="text-sm text-red-500 mt-1">{errors.idealSalary.message}</p>
          )}
        </div>
        
        {/* Preferensi Lokasi Kerja */}
        <div className="space-y-3">
          <FormLabel className="text-lg font-medium">
            Preferensi Lokasi Kerja
          </FormLabel>
          
          <RadioGroup
            onValueChange={(value) => register("preferensiLokasiKerja").onChange({ target: { value } })}
            defaultValue={defaultValues.preferensiLokasiKerja}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="local_only" id="localOnly" />
              <FormLabel htmlFor="localOnly" className="text-base font-normal cursor-pointer w-full">
                Hanya mau bekerja di kota tempat saya tinggal
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="domestic" id="domestic" />
              <FormLabel htmlFor="domestic" className="text-base font-normal cursor-pointer w-full">
                Bersedia bekerja di kota/provinsi lain
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="international" id="international" />
              <FormLabel htmlFor="international" className="text-base font-normal cursor-pointer w-full">
                Bersedia bekerja di luar negeri
              </FormLabel>
            </div>
          </RadioGroup>
          {errors.preferensiLokasiKerja && (
            <p className="text-sm text-red-500">{errors.preferensiLokasiKerja.message}</p>
          )}
        </div>
        
        {/* Willing To Travel */}
        <div className="space-y-3">
          <FormLabel className="text-lg font-medium">
            Apakah kamu bersedia berpergian untuk pekerjaan ini?
          </FormLabel>
          
          <RadioGroup
            onValueChange={(value) => register("willingToTravel").onChange({ target: { value } })}
            defaultValue={defaultValues.willingToTravel}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="wfh" id="wfh" />
              <FormLabel htmlFor="wfh" className="text-base font-normal cursor-pointer w-full">
                Bekerja dari jarak jauh / dari rumah (WFH)
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="wfo" id="wfo" />
              <FormLabel htmlFor="wfo" className="text-base font-normal cursor-pointer w-full">
                Bekerja dari kantor (WFO)
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="travel" id="travel" />
              <FormLabel htmlFor="travel" className="text-base font-normal cursor-pointer w-full">
                Tidak masalah dengan pekerjaan yang menuntut saya banyak keluar kantor/berpergian
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="relocate" id="relocate" />
              <FormLabel htmlFor="relocate" className="text-base font-normal cursor-pointer w-full">
                Tidak masalah dengan pekerjaan yang sewaktu-waktu mengharuskan saya dipindah ke kantor cabang lainnya
              </FormLabel>
            </div>
          </RadioGroup>
          
          {errors.willingToTravel && (
            <p className="text-sm text-red-500">{errors.willingToTravel.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-8 space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={navigateToPreviousStep}
          className="w-full"
          disabled={isProcessing}
        >
          Kembali
        </Button>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing}
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
    </form>
  );
} 
