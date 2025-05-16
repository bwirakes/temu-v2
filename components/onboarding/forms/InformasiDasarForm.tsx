"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "../../../hooks/useOnboardingApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormNav from "@/components/FormNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    ),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  statusPernikahan: z.enum(["Belum Menikah", "Menikah", "Cerai"]).optional(),
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
    nomorTelepon: data.nomorTelepon || "",
    tempatLahir: data.tempatLahir || "",
    statusPernikahan: data.statusPernikahan,
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
        nomorTelepon: values.nomorTelepon,
        tempatLahir: values.tempatLahir,
        statusPernikahan: values.statusPernikahan,
      });
      
      // Save data to API
      await saveStep(1, {
        namaLengkap: values.namaLengkap,
        email: values.email,
        nomorTelepon: values.nomorTelepon,
        tempatLahir: values.tempatLahir,
        statusPernikahan: values.statusPernikahan,
      });
      
      toast.success("Informasi pribadi berhasil disimpan");
      
      // Navigate to next step
      setCurrentStep(2);
      router.push("/job-seeker/onboarding/informasi-lanjutan");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Gagal menyimpan data");
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

        {/* Tempat Lahir */}
        <div className="space-y-2">
          <FormLabel htmlFor="tempatLahir" required>
            Tempat Lahir
          </FormLabel>
          <Input
            id="tempatLahir"
            placeholder="Masukkan kota kelahiran Anda"
            {...register("tempatLahir")}
            className={errors.tempatLahir ? "border-red-500" : ""}
          />
          {errors.tempatLahir && (
            <p className="text-red-500 text-sm">{errors.tempatLahir.message}</p>
          )}
        </div>

        {/* Status Pernikahan */}
        <div className="space-y-2">
          <FormLabel htmlFor="statusPernikahan">
            Status Pernikahan
          </FormLabel>
          <Select
            onValueChange={(value) => setValue("statusPernikahan", value as "Belum Menikah" | "Menikah" | "Cerai")}
            defaultValue={defaultValues.statusPernikahan}
          >
            <SelectTrigger id="statusPernikahan">
              <SelectValue placeholder="Pilih status pernikahan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
              <SelectItem value="Menikah">Menikah</SelectItem>
              <SelectItem value="Cerai">Cerai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting || isSaving} saveOnNext={false} />
    </form>
  );
}