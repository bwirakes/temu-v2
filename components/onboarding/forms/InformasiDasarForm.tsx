"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { Input } from "@/components/ui/input";
import FormNav from "@/components/FormNav";
import { FormLabel } from "@/components/ui/form-label";
import { toast } from "sonner";

// Schema for basic personal information
const informasiDasarSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  nomorTelepon: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor telepon Indonesia tidak valid"
    )
});

type InformasiDasarValues = z.infer<typeof informasiDasarSchema>;

interface InformasiDasarFormProps {
  userName?: string;
  userEmail?: string;
}

export default function InformasiDasarForm({ userName, userEmail }: InformasiDasarFormProps) {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<InformasiDasarValues> = {
    namaLengkap: data.namaLengkap || userName || "",
    email: data.email || userEmail || "",
    nomorTelepon: data.nomorTelepon || ""
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InformasiDasarValues>({
    resolver: zodResolver(informasiDasarSchema),
    defaultValues,
  });

  // Update form values if auth data changes
  useEffect(() => {
    if (userName && !data.namaLengkap) {
      setValue("namaLengkap", userName);
    }
    
    if (userEmail && !data.email) {
      setValue("email", userEmail);
    }
  }, [userName, userEmail, data.namaLengkap, data.email, setValue]);

  const onSubmit = async (values: InformasiDasarValues) => {
    try {
      setIsSubmitting(true);
      
      // Update context with form values
      updateFormValues({
        namaLengkap: values.namaLengkap,
        email: values.email,
        nomorTelepon: values.nomorTelepon
      });
      
      // Normalize phone number format (remove spaces, ensure proper format)
      const normalizedPhoneNumber = values.nomorTelepon
        .replace(/\s+/g, '')
        .replace(/^(\+62|62)/, '0');
      
      // Save data to API with proper error handling
      try {
        await saveStep(1, {
          namaLengkap: values.namaLengkap,
          email: values.email,
          nomorTelepon: normalizedPhoneNumber
        });
        
        toast.success("Informasi pribadi berhasil disimpan");
        
        // Navigate to next step
        setCurrentStep(2);
        router.push("/job-seeker/onboarding/informasi-lanjutan");
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
      <div className="space-y-4">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <FormLabel htmlFor="namaLengkap" required>
            Nama Lengkap
          </FormLabel>
          <Input
            id="namaLengkap"
            placeholder="Masukkan nama lengkap Anda"
            {...register("namaLengkap")}
            className={errors.namaLengkap ? "border-red-500" : ""}
          />
          {errors.namaLengkap && (
            <p className="text-red-500 text-sm">{errors.namaLengkap.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <FormLabel htmlFor="email" required>
            Alamat Email
          </FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="nama@contoh.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div className="space-y-2">
          <FormLabel htmlFor="nomorTelepon" required>
            Nomor Telepon
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

      <FormNav isSubmitting={isSubmitting || isSaving} saveOnNext={false} />
    </form>
  );
}