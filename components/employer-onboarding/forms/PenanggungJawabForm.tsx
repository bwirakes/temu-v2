"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { 
  useEmployerOnboarding, 
  picSchema
} from "@/lib/context/EmployerOnboardingContext";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/employer-onboarding/ui/FormLabel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import EmployerFormNav from "@/components/employer-onboarding/EmployerFormNav";

type PICValues = z.infer<typeof picSchema>;

export default function PenanggungJawabForm() {
  const { data, updateFormValues, saveCurrentStepData } = useEmployerOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: PICValues = {
    nama: data.pic?.nama || "",
    nomorTelepon: data.pic?.nomorTelepon || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PICValues>({
    resolver: zodResolver(picSchema),
    defaultValues,
  });

  const onSubmit = async (values: PICValues) => {
    try {
      setIsSubmitting(true);
      
      // Update the form values in context
      updateFormValues({
        pic: {
          nama: values.nama,
          nomorTelepon: values.nomorTelepon,
        }
      });
      
      // Log the current state before saving
      console.log("Saving PIC data:", values);
      
      // Save the data - the backend will handle step advancement automatically
      const saveSuccessful = await saveCurrentStepData();
      
      if (saveSuccessful) {
        toast.success("Data berhasil disimpan");
        
        // The saveCurrentStepData function now handles advancing to the next step
        // and redirecting if necessary, so we don't need to manually navigate
      } else {
        toast.error("Gagal menyimpan data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Data PIC yang Anda berikan di bawah ini tidak akan kami tampilkan atau berikan 
            kepada Pencari Kerja dan hanya digunakan untuk komunikasi antara platform kami 
            dengan perusahaan Anda.
          </AlertDescription>
        </Alert>

        {/* Nama PIC */}
        <div className="space-y-2">
          <FormLabel htmlFor="nama">
            Nama Lengkap PIC <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="nama"
            placeholder="Masukkan nama lengkap penanggung jawab"
            {...register("nama")}
            className={errors.nama ? "border-red-500" : ""}
          />
          {errors.nama && (
            <p className="text-red-500 text-sm">{errors.nama.message}</p>
          )}
        </div>

        {/* Nomor HP PIC */}
        <div className="space-y-2">
          <FormLabel htmlFor="nomorTelepon">
            Nomor HP PIC yang Aktif <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="nomorTelepon"
            placeholder="08123456789"
            {...register("nomorTelepon")}
            className={errors.nomorTelepon ? "border-red-500" : ""}
          />
          {errors.nomorTelepon && (
            <p className="text-red-500 text-sm">{errors.nomorTelepon.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Format: 08XXXXXXXXXX, contoh: 081234567890
          </p>
        </div>
      </div>

      <EmployerFormNav isSubmitting={isSubmitting} />
    </form>
  );
} 