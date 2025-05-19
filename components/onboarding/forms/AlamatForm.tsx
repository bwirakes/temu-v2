"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Input } from "@/components/ui/input";
import FormNav from "@/components/FormNav";
import { FormLabel } from "@/components/ui/form-label";
import { toast } from "sonner";
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
  kota: z.string().min(1, "Kota wajib diisi"),
  provinsi: z.string().optional(),
  kodePos: z.string().optional(),
  jalan: z.string().optional(),
});

type AlamatValues = z.infer<typeof alamatSchema>;

export default function AlamatForm() {
  const { data, updateFormValues, navigateToNextStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<AlamatValues> = {
    kota: data.alamat?.kota || "",
    provinsi: data.alamat?.provinsi || "",
    kodePos: data.alamat?.kodePos || "",
    jalan: data.alamat?.jalan || "",
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

  const onSubmit = async (values: AlamatValues) => {
    try {
      setIsSubmitting(true);
      
      // Update form context
      updateFormValues({
        alamat: {
          kota: values.kota,
          provinsi: values.provinsi,
          kodePos: values.kodePos,
          jalan: values.jalan,
        },
      });

      toast.success("Alamat berhasil disimpan");
      navigateToNextStep();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Gagal menyimpan data alamat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
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
            <FormLabel htmlFor="provinsi">
              Provinsi
            </FormLabel>
            <Select 
              onValueChange={(value) => setValue("provinsi", value)}
              defaultValue={defaultValues.provinsi}
            >
              <SelectTrigger id="provinsi">
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
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="jalan">
            Alamat Lengkap
          </FormLabel>
          <Input
            id="jalan"
            placeholder="Jl. Contoh No. 123"
            {...register("jalan")}
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="kodePos">
            Kode Pos
          </FormLabel>
          <Input
            id="kodePos"
            placeholder="12345"
            {...register("kodePos")}
          />
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting} saveOnNext={false} />
    </form>
  );
}