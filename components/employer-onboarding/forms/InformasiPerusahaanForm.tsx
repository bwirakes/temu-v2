"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { 
  useEmployerOnboarding, 
  informasiPerusahaanSchema
} from "@/lib/context/EmployerOnboardingContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLabel } from "@/components/employer-onboarding/ui/FormLabel";
import EmployerFormNav from "@/components/employer-onboarding/EmployerFormNav";

type InformasiPerusahaanValues = {
  namaPerusahaan: string;
  merekUsaha: string;
  industri: string;
  alamatKantor: string;
  email: string;
};

export default function InformasiPerusahaanForm() {
  const { data, proceedToNextStep } = useEmployerOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: InformasiPerusahaanValues = {
    namaPerusahaan: data.namaPerusahaan || "",
    merekUsaha: data.merekUsaha || "",
    industri: data.industri || "",
    alamatKantor: data.alamatKantor || "",
    email: data.email || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InformasiPerusahaanValues>({
    resolver: zodResolver(informasiPerusahaanSchema),
    defaultValues,
  });

  const onSubmit = async (values: InformasiPerusahaanValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Use proceedToNextStep to validate, update state, and navigate to next step
      const stepData = {
        namaPerusahaan: values.namaPerusahaan,
        merekUsaha: values.merekUsaha,
        industri: values.industri || "",
        alamatKantor: values.alamatKantor || "",
        email: values.email,
      };
      
      await proceedToNextStep(stepData);
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Nama Perusahaan */}
        <div className="space-y-2">
          <FormLabel htmlFor="namaPerusahaan">
            Nama Perusahaan <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="namaPerusahaan"
            placeholder="PT Kuliner Nusantara Enak"
            {...register("namaPerusahaan")}
            className={errors.namaPerusahaan ? "border-red-500" : ""}
          />
          {errors.namaPerusahaan && (
            <p className="text-red-500 text-sm">{errors.namaPerusahaan.message}</p>
          )}
        </div>

        {/* Email Perusahaan */}
        <div className="space-y-2">
          <FormLabel htmlFor="email">
            Email Perusahaan <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="info@perusahaananda.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Email perusahaan yang aktif untuk komunikasi bisnis
          </p>
        </div>

        {/* Merek Usaha */}
        <div className="space-y-2">
          <FormLabel htmlFor="merekUsaha">
            Merek Usaha <span className="text-gray-500 text-sm">(opsional)</span>
          </FormLabel>
          <Input
            id="merekUsaha"
            placeholder="Kedai Enak"
            {...register("merekUsaha")}
          />
          <p className="text-xs text-gray-500">
            Nama merek yang dikenal oleh publik jika berbeda dengan nama perusahaan
          </p>
        </div>

        {/* Industri */}
        <div className="space-y-2">
          <FormLabel htmlFor="industri">
            Industri dan Bidang Usaha <span className="text-gray-500 text-sm">(opsional)</span>
          </FormLabel>
          <Input
            id="industri"
            placeholder="Restoran / Kuliner"
            {...register("industri")}
            className={errors.industri ? "border-red-500" : ""}
          />
          {errors.industri && (
            <p className="text-red-500 text-sm">{errors.industri.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Bidang usaha perusahaan Anda (Contoh: Teknologi, Pendidikan, Kesehatan)
          </p>
        </div>

        {/* Alamat Kantor */}
        <div className="space-y-2">
          <FormLabel htmlFor="alamatKantor">
            Alamat Kantor Utama <span className="text-gray-500 text-sm">(opsional)</span>
          </FormLabel>
          <Textarea
            id="alamatKantor"
            placeholder="Jl. Contoh No.123, Kota Jakarta"
            className={`min-h-24 ${errors.alamatKantor ? "border-red-500" : ""}`}
            {...register("alamatKantor")}
          />
          {errors.alamatKantor && (
            <p className="text-red-500 text-sm">{errors.alamatKantor.message}</p>
          )}
        </div>
      </div>

      <EmployerFormNav isSubmitting={isSubmitting} />
    </form>
  );
} 