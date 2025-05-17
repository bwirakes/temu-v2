"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { 
  useOnboarding, 
  EkspektasiKerja,
} from "@/lib/context/OnboardingContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form-label";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { toast } from "sonner";

const ekspektasiKerjaSchema = z.object({
  jobTypes: z.string().min(1, "Jenis pekerjaan wajib diisi"),
  idealSalary: z.coerce.number().positive("Gaji ideal harus lebih dari 0"),
  willingToTravel: z.enum(["not_willing", "local_only", "domestic", "international"], {
    required_error: "Pilih salah satu opsi",
  }),
  preferensiLokasiKerja: z.enum(["WFH", "WFO", "Hybrid"], {
    required_error: "Pilih salah satu opsi",
  }),
});

type EkspektasiKerjaValues = z.infer<typeof ekspektasiKerjaSchema>;

export default function EkspektasiKerjaForm() {
  const { data, updateFormValues, navigateToNextStep, currentStep } = useOnboarding();
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse existing ekspektasiKerja if it's a string
  let existingData: Partial<EkspektasiKerjaValues> = {};
  if (typeof data.ekspektasiKerja === 'string' && data.ekspektasiKerja) {
    try {
      existingData = JSON.parse(data.ekspektasiKerja);
    } catch (e) {
      console.error("Failed to parse ekspektasiKerja JSON:", e);
    }
  } else if (data.ekspektasiKerja && typeof data.ekspektasiKerja === 'object') {
    existingData = data.ekspektasiKerja as any;
  }
  
  // Prepare the default values
  const defaultValues: Partial<EkspektasiKerjaValues> = {
    jobTypes: existingData.jobTypes || "",
    idealSalary: existingData.idealSalary || undefined,
    willingToTravel: existingData.willingToTravel as any || "local_only",
    preferensiLokasiKerja: existingData.preferensiLokasiKerja as any || "WFO",
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
      setIsSubmitting(true);
      
      const ekspektasiData: EkspektasiKerja = {
        jobTypes: values.jobTypes,
        idealSalary: values.idealSalary,
        willingToTravel: values.willingToTravel,
        preferensiLokasiKerja: values.preferensiLokasiKerja,
      };
      
      // Save form values to context as JSON string for compatibility
      updateFormValues({
        ekspektasiKerja: JSON.stringify(ekspektasiData),
      });
      
      // Save data to API with proper error handling
      try {
        await saveStep(currentStep, { ekspektasiKerja: JSON.stringify(ekspektasiData) });
        toast.success("Ekspektasi kerja berhasil disimpan");
        
        // Use the centralized navigation function
        navigateToNextStep();
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
              placeholder="Contoh: Software Engineer, Digital Marketing Specialist, Barista"
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
              <RadioGroupItem value="WFH" id="wfh" />
              <FormLabel htmlFor="wfh" className="text-base font-normal cursor-pointer w-full">
                Work From Home (WFH)
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="WFO" id="wfo" />
              <FormLabel htmlFor="wfo" className="text-base font-normal cursor-pointer w-full">
                Work From Office (WFO)
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="Hybrid" id="hybrid" />
              <FormLabel htmlFor="hybrid" className="text-base font-normal cursor-pointer w-full">
                Hybrid (Campuran WFH & WFO)
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
              <RadioGroupItem value="not_willing" id="notWilling" />
              <FormLabel htmlFor="notWilling" className="text-base font-normal cursor-pointer w-full">
                Saya tidak ingin bepergian untuk pekerjaan
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="local_only" id="travelLocal" />
              <FormLabel htmlFor="travelLocal" className="text-base font-normal cursor-pointer w-full">
                Saya hanya ingin bekerja sekitar tempat saya tinggal
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="domestic" id="travelDomestic" />
              <FormLabel htmlFor="travelDomestic" className="text-base font-normal cursor-pointer w-full">
                Saya bersedia bepergian dalam negeri
              </FormLabel>
            </div>
            
            <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
              <RadioGroupItem value="international" id="travelInternational" />
              <FormLabel htmlFor="travelInternational" className="text-base font-normal cursor-pointer w-full">
                Saya bersedia bepergian internasional
              </FormLabel>
            </div>
          </RadioGroup>
          
          {errors.willingToTravel && (
            <p className="text-sm text-red-500">{errors.willingToTravel.message}</p>
          )}
        </div>
      </div>
      
      <FormNav isSubmitting={isSubmitting || isSaving} saveOnNext={false} />
    </form>
  );
} 
