"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PengalamanKerja } from "@/lib/context/OnboardingContext";

const pengalamanKerjaSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  posisi: z.string().min(1, "Posisi/Jabatan wajib diisi"),
  tanggalMulai: z.date({
    required_error: "Tanggal mulai wajib diisi",
  }),
  tanggalSelesai: z.date({
    required_error: "Tanggal selesai wajib diisi",
  }).optional(),
  masihBekerja: z.boolean().optional(),
  deskripsiPekerjaan: z.string().optional(),
  lokasi: z.string().optional(),
  gajiTerakhir: z.string().optional(),
  alasanKeluar: z.enum([
    "Kontrak tidak diperpanjang",
    "Gaji terlalu kecil",
    "Tidak cocok dengan atasan / rekan kerja",
    "Lokasi terlalu jauh",
    "Pekerjaan terlalu berat",
    "Lainnya"
  ]).optional(),
  alasanKeluarLainnya: z.string().optional(),
});

type PengalamanKerjaValues = z.infer<typeof pengalamanKerjaSchema>;

interface PengalamanKerjaItemProps {
  pengalaman?: PengalamanKerja;
  onSave: (data: PengalamanKerja) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

const alasanKeluarOptions = [
  "Kontrak tidak diperpanjang",
  "Gaji terlalu kecil",
  "Tidak cocok dengan atasan / rekan kerja",
  "Lokasi terlalu jauh",
  "Pekerjaan terlalu berat",
  "Lainnya"
];

export default function PengalamanKerjaItem({
  pengalaman,
  onSave,
  onDelete,
  isNew = false,
}: PengalamanKerjaItemProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masihBekerja, setMasihBekerja] = useState(
    pengalaman?.tanggalSelesai === "Sekarang"
  );

  const tanggalMulai = pengalaman?.tanggalMulai 
    ? new Date(pengalaman.tanggalMulai)
    : undefined;
  
  const tanggalSelesai = pengalaman?.tanggalSelesai && pengalaman.tanggalSelesai !== "Sekarang"
    ? new Date(pengalaman.tanggalSelesai) 
    : undefined;

  const defaultValues: Partial<PengalamanKerjaValues> = {
    namaPerusahaan: pengalaman?.namaPerusahaan || "",
    posisi: pengalaman?.posisi || "",
    tanggalMulai: tanggalMulai,
    tanggalSelesai: tanggalSelesai,
    masihBekerja: masihBekerja,
    deskripsiPekerjaan: pengalaman?.deskripsiPekerjaan || "",
    lokasi: pengalaman?.lokasi || "",
    gajiTerakhir: pengalaman?.gajiTerakhir || "",
    alasanKeluar: pengalaman?.alasanKeluar as any,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PengalamanKerjaValues>({
    resolver: zodResolver(pengalamanKerjaSchema),
    defaultValues,
  });

  const onSubmit = (values: PengalamanKerjaValues) => {
    setIsSubmitting(true);
    
    const formattedData: PengalamanKerja = {
      id: pengalaman?.id || Date.now().toString(),
      levelPengalaman: pengalaman?.levelPengalaman || "Baru lulus",
      namaPerusahaan: values.namaPerusahaan,
      posisi: values.posisi,
      tanggalMulai: values.tanggalMulai.toISOString().split("T")[0],
      tanggalSelesai: values.masihBekerja 
        ? "Sekarang" 
        : values.tanggalSelesai
          ? values.tanggalSelesai.toISOString().split("T")[0]
          : "",
      deskripsiPekerjaan: values.deskripsiPekerjaan,
      lokasi: values.lokasi,
      gajiTerakhir: values.gajiTerakhir,
      alasanKeluar: values.alasanKeluar === "Lainnya" 
        ? values.alasanKeluarLainnya 
        : values.alasanKeluar,
    };

    setTimeout(() => {
      onSave(formattedData);
      setIsSubmitting(false);
    }, 300);
  };

  const watchMasihBekerja = watch("masihBekerja");
  const watchAlasanKeluar = watch("alasanKeluar");

  return (
    <div className="border rounded-md mb-4 p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <label htmlFor="namaPerusahaan" className="text-sm font-medium">Nama Perusahaan</label>
          <span className="text-red-500 ml-1">*</span>
        </div>
        <Input
          id="namaPerusahaan"
          placeholder="PT. Contoh Indonesia"
          {...register("namaPerusahaan")}
          className={errors.namaPerusahaan ? "border-red-500" : ""}
        />
        {errors.namaPerusahaan && (
          <p className="text-red-500 text-sm">{errors.namaPerusahaan.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <label htmlFor="posisi" className="text-sm font-medium">Posisi/Jabatan</label>
          <span className="text-red-500 ml-1">*</span>
        </div>
        <Input
          id="posisi"
          placeholder="Manajer Pemasaran"
          {...register("posisi")}
          className={errors.posisi ? "border-red-500" : ""}
        />
        {errors.posisi && (
          <p className="text-red-500 text-sm">{errors.posisi.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="lokasi" className="text-sm font-medium">Lokasi</label>
          <Input
            id="lokasi"
            placeholder="Jakarta, Indonesia"
            {...register("lokasi")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="gajiTerakhir" className="text-sm font-medium">Gaji Terakhir (Opsional)</label>
          <Input
            id="gajiTerakhir"
            placeholder="Rp 5.000.000"
            {...register("gajiTerakhir")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="tanggalMulai" className="text-sm font-medium">Tanggal Mulai</label>
            <span className="text-red-500 ml-1">*</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !defaultValues.tanggalMulai && "text-muted-foreground",
                  errors.tanggalMulai && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {defaultValues.tanggalMulai ? (
                  format(defaultValues.tanggalMulai, "MMMM yyyy", { locale: id })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={defaultValues.tanggalMulai}
                onSelect={(date) => {
                  if (date) {
                    setValue("tanggalMulai", date);
                  }
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.tanggalMulai && (
            <p className="text-red-500 text-sm">{errors.tanggalMulai.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="tanggalSelesai" className="text-sm font-medium">Tanggal Selesai</label>
            {!watchMasihBekerja && <span className="text-red-500 ml-1">*</span>}
          </div>
          
          {!watchMasihBekerja && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !defaultValues.tanggalSelesai && "text-muted-foreground",
                    errors.tanggalSelesai && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {defaultValues.tanggalSelesai ? (
                    format(defaultValues.tanggalSelesai, "MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={defaultValues.tanggalSelesai}
                  onSelect={(date) => {
                    if (date) {
                      setValue("tanggalSelesai", date);
                    }
                  }}
                  disabled={(date) => {
                    if (date > new Date()) return true;
                    if (defaultValues.tanggalMulai && date < defaultValues.tanggalMulai) return true;
                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="masihBekerja"
              checked={watchMasihBekerja}
              onCheckedChange={(checked) => {
                setValue("masihBekerja", checked === true);
                setMasihBekerja(checked === true);
              }}
            />
            <label
              className="text-sm font-normal cursor-pointer"
              htmlFor="masihBekerja"
            >
              Saya masih bekerja di sini
            </label>
          </div>
          
          {errors.tanggalSelesai && !watchMasihBekerja && (
            <p className="text-red-500 text-sm">{errors.tanggalSelesai.message as string}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="deskripsiPekerjaan" className="text-sm font-medium">Deskripsi Pekerjaan</label>
        <Textarea
          id="deskripsiPekerjaan"
          placeholder="Jelaskan tugas dan tanggung jawab Anda di perusahaan ini..."
          rows={4}
          {...register("deskripsiPekerjaan")}
        />
      </div>

      {!watchMasihBekerja && (
        <div className="space-y-2">
          <label htmlFor="alasanKeluar" className="text-sm font-medium">Alasan Keluar</label>
          <Select
            value={watchAlasanKeluar}
            onValueChange={(value) => setValue("alasanKeluar", value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih alasan keluar" />
            </SelectTrigger>
            <SelectContent>
              {alasanKeluarOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {watchAlasanKeluar === "Lainnya" && (
            <div className="mt-2">
              <Input
                placeholder="Sebutkan alasan keluar..."
                {...register("alasanKeluarLainnya")}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDelete(pengalaman?.id || "")}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Hapus
        </Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
          size="sm" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}