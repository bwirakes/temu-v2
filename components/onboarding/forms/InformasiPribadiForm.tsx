"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";

const informasiPribadiSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  nomorTelepon: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor telepon Indonesia tidak valid"
    ),
  tanggalLahir: z.date({
    required_error: "Tanggal lahir wajib diisi",
  }),
  jenisKelamin: z
    .enum(["Laki-laki", "Perempuan", "Lainnya"])
    .optional(),
  beratBadan: z
    .number()
    .min(30, "Berat badan minimal 30 kg")
    .max(200, "Berat badan maksimal 200 kg")
    .optional(),
  tinggiBadan: z
    .number()
    .min(100, "Tinggi badan minimal 100 cm")
    .max(250, "Tinggi badan maksimal 250 cm")
    .optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  linkedin: z.string().optional(),
  otherSocial: z.string().optional(),
  alamatJalan: z.string().optional(),
  alamatKota: z.string().optional(),
  alamatProvinsi: z.string().optional(),
  alamatKodePos: z.string().optional(),
});

type InformasiPribadiValues = z.infer<typeof informasiPribadiSchema>;

export default function InformasiPribadiForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<InformasiPribadiValues> = {
    namaLengkap: data.namaLengkap || "",
    email: data.email || "",
    nomorTelepon: data.nomorTelepon || "",
    tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
    jenisKelamin: data.jenisKelamin,
    beratBadan: data.beratBadan,
    tinggiBadan: data.tinggiBadan,
    instagram: data.socialMedia?.instagram || "",
    twitter: data.socialMedia?.twitter || "",
    facebook: data.socialMedia?.facebook || "",
    tiktok: data.socialMedia?.tiktok || "",
    linkedin: data.socialMedia?.linkedin || "",
    otherSocial: data.socialMedia?.other || "",
    alamatJalan: data.alamat?.jalan || "",
    alamatKota: data.alamat?.kota || "",
    alamatProvinsi: data.alamat?.provinsi || "",
    alamatKodePos: data.alamat?.kodePos || "",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InformasiPribadiValues>({
    resolver: zodResolver(informasiPribadiSchema),
    defaultValues,
  });

  const onSubmit = (values: InformasiPribadiValues) => {
    setIsSubmitting(true);
    
    updateFormValues({
      namaLengkap: values.namaLengkap,
      email: values.email,
      nomorTelepon: values.nomorTelepon,
      tanggalLahir: values.tanggalLahir.toISOString().split("T")[0],
      jenisKelamin: values.jenisKelamin,
      beratBadan: values.beratBadan,
      tinggiBadan: values.tinggiBadan,
      socialMedia: {
        instagram: values.instagram,
        twitter: values.twitter,
        facebook: values.facebook,
        tiktok: values.tiktok,
        linkedin: values.linkedin,
        other: values.otherSocial,
      },
      alamat: {
        jalan: values.alamatJalan,
        kota: values.alamatKota,
        provinsi: values.alamatProvinsi,
        kodePos: values.alamatKodePos,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(2);
      router.push("/job-seeker/onboarding/pengalaman-kerja");
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Nama Lengkap */}
        <div className="space-y-2">
          <Label htmlFor="namaLengkap">
            Nama Lengkap <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="email">
            Alamat Email <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="nomorTelepon">
            Nomor Telepon <span className="text-red-500">*</span>
          </Label>
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

        {/* Tanggal Lahir */}
        <div className="space-y-2">
          <Label htmlFor="tanggalLahir">
            Tanggal Lahir <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !defaultValues.tanggalLahir && "text-muted-foreground",
                  errors.tanggalLahir && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {defaultValues.tanggalLahir ? (
                  format(defaultValues.tanggalLahir, "PPP")
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={defaultValues.tanggalLahir}
                onSelect={(date) => {
                  if (date) {
                    setValue("tanggalLahir", date);
                  }
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.tanggalLahir && (
            <p className="text-red-500 text-sm">{errors.tanggalLahir.message as string}</p>
          )}
        </div>

        {/* Jenis Kelamin */}
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <RadioGroup
            onValueChange={(value: string) => 
              setValue("jenisKelamin", value as "Laki-laki" | "Perempuan" | "Lainnya")
            }
            defaultValue={defaultValues.jenisKelamin}
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Laki-laki" id="laki-laki" />
              <Label htmlFor="laki-laki" className="cursor-pointer">Laki-laki</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Perempuan" id="perempuan" />
              <Label htmlFor="perempuan" className="cursor-pointer">Perempuan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Lainnya" id="lainnya" />
              <Label htmlFor="lainnya" className="cursor-pointer">Lainnya</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Berat & Tinggi Badan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beratBadan">Berat Badan (kg)</Label>
            <Input
              id="beratBadan"
              type="number"
              placeholder="70"
              {...register("beratBadan", { valueAsNumber: true })}
              className={errors.beratBadan ? "border-red-500" : ""}
            />
            {errors.beratBadan && (
              <p className="text-red-500 text-sm">{errors.beratBadan.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tinggiBadan">Tinggi Badan (cm)</Label>
            <Input
              id="tinggiBadan"
              type="number"
              placeholder="170"
              {...register("tinggiBadan", { valueAsNumber: true })}
              className={errors.tinggiBadan ? "border-red-500" : ""}
            />
            {errors.tinggiBadan && (
              <p className="text-red-500 text-sm">{errors.tinggiBadan.message}</p>
            )}
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4 border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium">Media Sosial (Opsional)</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="@username"
                  {...register("instagram")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input
                  id="twitter"
                  placeholder="@username"
                  {...register("twitter")}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="username"
                  {...register("facebook")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  placeholder="@username"
                  {...register("tiktok")}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="URL profil"
                  {...register("linkedin")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherSocial">Media Sosial Lainnya</Label>
                <Input
                  id="otherSocial"
                  placeholder="URL profil"
                  {...register("otherSocial")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alamat */}
        <div className="space-y-4 border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium">Alamat (Opsional)</h3>
          
          <div className="space-y-2">
            <Label htmlFor="alamatJalan">Jalan</Label>
            <Input
              id="alamatJalan"
              placeholder="Jl. Contoh No. 123"
              {...register("alamatJalan")}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alamatKota">Kota</Label>
              <Input
                id="alamatKota"
                placeholder="Jakarta"
                {...register("alamatKota")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alamatProvinsi">Provinsi</Label>
              <Input
                id="alamatProvinsi"
                placeholder="DKI Jakarta"
                {...register("alamatProvinsi")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alamatKodePos">Kode Pos</Label>
            <Input
              id="alamatKodePos"
              placeholder="12345"
              {...register("alamatKodePos")}
            />
          </div>
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting} />
    </form>
  );
}