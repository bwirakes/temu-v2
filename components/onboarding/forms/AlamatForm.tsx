"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormNav from "@/components/FormNav";
import { FormLabel } from "@/components/ui/form-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// List of provinces in Indonesia
const provinsiIndonesia = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bengkulu",
  "Lampung",
  "Kepulauan Bangka Belitung",
  "Kepulauan Riau",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua Barat",
  "Papua",
];

const alamatSchema = z.object({
  jalan: z.string().min(1, "Alamat jalan wajib diisi"),
  kota: z.string().min(1, "Kota wajib diisi"),
  provinsi: z.string().min(1, "Provinsi wajib diisi"),
  kodePos: z.string().min(1, "Kode pos wajib diisi"),
});

type AlamatValues = z.infer<typeof alamatSchema>;

export default function AlamatForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<AlamatValues> = {
    jalan: data.alamat?.jalan || "",
    kota: data.alamat?.kota || "",
    provinsi: data.alamat?.provinsi || "",
    kodePos: data.alamat?.kodePos || "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AlamatValues>({
    resolver: zodResolver(alamatSchema),
    defaultValues,
  });

  const onSubmit = (values: AlamatValues) => {
    setIsSubmitting(true);
    
    updateFormValues({
      alamat: {
        ...data.alamat,
        jalan: values.jalan,
        kota: values.kota,
        provinsi: values.provinsi,
        kodePos: values.kodePos,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4);
      router.push("/onboarding/social-media");
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <FormLabel htmlFor="jalan" required>
            Alamat Lengkap
          </FormLabel>
          <Input
            id="jalan"
            placeholder="Jl. Contoh No. 123"
            {...register("jalan")}
            className={errors.jalan ? "border-red-500" : ""}
          />
          {errors.jalan && (
            <p className="text-red-500 text-sm">{errors.jalan.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="kota" required>
              Kota
            </FormLabel>
            <Input
              id="kota"
              placeholder="Jakarta"
              {...register("kota")}
              className={errors.kota ? "border-red-500" : ""}
            />
            {errors.kota && (
              <p className="text-red-500 text-sm">{errors.kota.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="provinsi" required>
              Provinsi
            </FormLabel>
            <Select 
              onValueChange={(value) => setValue("provinsi", value)}
              defaultValue={defaultValues.provinsi}
            >
              <SelectTrigger 
                id="provinsi"
                className={errors.provinsi ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih provinsi" />
              </SelectTrigger>
              <SelectContent>
                {provinsiIndonesia.map((provinsi) => (
                  <SelectItem key={provinsi} value={provinsi}>
                    {provinsi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provinsi && (
              <p className="text-red-500 text-sm">{errors.provinsi.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="kodePos" required>
            Kode Pos
          </FormLabel>
          <Input
            id="kodePos"
            placeholder="12345"
            {...register("kodePos")}
            className={errors.kodePos ? "border-red-500" : ""}
          />
          {errors.kodePos && (
            <p className="text-red-500 text-sm">{errors.kodePos.message}</p>
          )}
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting} />
    </form>
  );
}