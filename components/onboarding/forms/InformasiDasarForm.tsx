"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { FormLabel } from "@/components/ui/form-label";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

// Schema for basic personal information
const informasiDasarSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi").trim(),
  email: z.string().email("Format email tidak valid").trim(),
  nomorTelepon: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor telepon Indonesia tidak valid"
    )
    .transform(value => {
      // Clean phone number (remove spaces, ensure proper format)
      let normalized = value.replace(/\s+/g, '');
      // Ensure it starts with '0' if it has +62 or 62 prefix
      normalized = normalized.replace(/^(\+62|62)/, '0');
      // Ensure it starts with '0' in any case
      if (!normalized.startsWith('0')) {
        normalized = '0' + normalized;
      }
      return normalized;
    })
});

type InformasiDasarValues = z.infer<typeof informasiDasarSchema>;

interface InformasiDasarFormProps {
  userName?: string;
  userEmail?: string;
}

export default function InformasiDasarForm({ userName, userEmail }: InformasiDasarFormProps) {
  const { 
    data, 
    updateFormValues,
    navigateToNextStep
  } = useOnboarding();
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const defaultValues: Partial<InformasiDasarValues> = {
    namaLengkap: data.namaLengkap || userName || "",
    email: data.email || userEmail || "",
    nomorTelepon: data.nomorTelepon || ""
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<InformasiDasarValues>({
    resolver: zodResolver(informasiDasarSchema),
    defaultValues,
    mode: "onChange" // Validate on change for better user experience
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
      setIsProcessing(true);
      setSubmitAttempted(true);
            
      // Create a sanitized values object
      const sanitizedValues = {
        namaLengkap: values.namaLengkap,
        email: values.email,
        nomorTelepon: values.nomorTelepon
      };
      
      // Log for debugging
      console.log("Updating with basic information:", sanitizedValues);
      
      // Update context with form values
      updateFormValues(sanitizedValues);
      
      // Show success message
      toast.success("Informasi pribadi berhasil disimpan");
      
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
            aria-invalid={!!errors.namaLengkap}
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
            aria-invalid={!!errors.email}
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
            aria-invalid={!!errors.nomorTelepon}
          />
          {errors.nomorTelepon && (
            <p className="text-red-500 text-sm">{errors.nomorTelepon.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Format: 08XXXXXXXXXX, contoh: 081234567890
          </p>
        </div>
      </div>

      {/* Show general error message if form validation fails on submit */}
      {submitAttempted && !isValid && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm font-medium">
            Harap perbaiki error pada formulir sebelum melanjutkan.
          </p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button 
          type="submit" 
          disabled={isProcessing}
          className="w-full"
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