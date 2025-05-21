"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PengalamanKerja } from "@/lib/db-types";
import { FormLabel } from "@/components/ui/form-label";
import { MIN_WORK_EXPERIENCE_OPTIONS } from "@/lib/constants";

const levelPengalamanOptions = MIN_WORK_EXPERIENCE_OPTIONS;

const pengalamanKerjaSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  posisi: z.string().min(1, "Posisi/Jabatan wajib diisi"),
  tanggalMulai: z.date({
    required_error: "Tanggal mulai wajib diisi",
  }),
  tanggalMulaiText: z.string().optional(),
  tanggalSelesai: z.date({
    required_error: "Tanggal selesai wajib diisi",
  }).optional(),
  tanggalSelesaiText: z.string().optional(),
  masihBekerja: z.boolean().optional(),
  deskripsiPekerjaan: z.string().optional(),
  lokasi: z.string().optional(),
  gajiTerakhir: z.string().optional(),
  alasanKeluar: z.enum([
    "Dapat Tawaran Lebih Baik",
    "Cari Peluang Lebih Baik",
    "Tidak ada peluang karir jangka-panjang",
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
  expanded?: boolean;
  isPengalamanTerakhir?: boolean;
}

const alasanKeluarOptions = [
  "Dapat Tawaran Lebih Baik",
  "Cari Peluang Lebih Baik",
  "Tidak ada peluang karir jangka-panjang",
  "Lainnya"
];

export default function PengalamanKerjaItem({
  pengalaman,
  onSave,
  onDelete,
  isNew = false,
  expanded = false,
  isPengalamanTerakhir = false,
}: PengalamanKerjaItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isExpanded, setIsExpanded] = useState(expanded || isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masihBekerja, setMasihBekerja] = useState(
    pengalaman?.tanggalSelesai === "Sekarang"
  );
  const [tanggalMulaiDate, setTanggalMulaiDate] = useState<Date | undefined>(
    pengalaman?.tanggalMulai ? new Date(pengalaman.tanggalMulai) : undefined
  );
  const [tanggalSelesaiDate, setTanggalSelesaiDate] = useState<Date | undefined>(
    pengalaman?.tanggalSelesai && pengalaman.tanggalSelesai !== "Sekarang"
      ? new Date(pengalaman.tanggalSelesai) 
      : undefined
  );
  const [tanggalMulaiError, setTanggalMulaiError] = useState<string | null>(null);
  const [tanggalSelesaiError, setTanggalSelesaiError] = useState<string | null>(null);

  // Effect to ensure expanded state reflects prop changes
  useEffect(() => {
    setIsExpanded(expanded || isNew);
  }, [expanded, isNew]);

  const defaultValues: Partial<PengalamanKerjaValues> = {
    namaPerusahaan: pengalaman?.namaPerusahaan || "",
    posisi: pengalaman?.posisi || "",
    tanggalMulai: tanggalMulaiDate,
    tanggalMulaiText: tanggalMulaiDate ? format(tanggalMulaiDate, "MM/yyyy") : "",
    tanggalSelesai: tanggalSelesaiDate,
    tanggalSelesaiText: tanggalSelesaiDate ? format(tanggalSelesaiDate, "MM/yyyy") : "",
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

  // Update the form value when tanggalMulai changes
  useEffect(() => {
    if (tanggalMulaiDate) {
      setValue("tanggalMulai", tanggalMulaiDate);
      setValue("tanggalMulaiText", format(tanggalMulaiDate, "MM/yyyy"));
      setTanggalMulaiError(null);
    }
  }, [tanggalMulaiDate, setValue]);

  // Update the form value when tanggalSelesai changes
  useEffect(() => {
    if (tanggalSelesaiDate) {
      setValue("tanggalSelesai", tanggalSelesaiDate);
      setValue("tanggalSelesaiText", format(tanggalSelesaiDate, "MM/yyyy"));
      setTanggalSelesaiError(null);
    }
  }, [tanggalSelesaiDate, setValue]);

  const handleTanggalMulaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Format input to include slashes automatically
    if (inputValue.length > 0) {
      // Remove any non-digit characters
      const digits = inputValue.replace(/\D/g, '');
      
      // Format with slashes (MM/YYYY)
      if (digits.length <= 2) {
        inputValue = digits;
      } else {
        inputValue = `${digits.substring(0, 2)}/${digits.substring(2, 6)}`;
      }
    }
    
    setValue("tanggalMulaiText", inputValue);
    
    if (!inputValue) {
      setTanggalMulaiError("Tanggal mulai wajib diisi");
      return;
    }

    // Only try to parse if we have enough characters for a complete date
    if (inputValue.length < 7) {
      return;
    }

    try {
      // Parse MM/YYYY format
      const parsedDate = parse(`01/${inputValue}`, 'dd/MM/yyyy', new Date());
      
      if (isValid(parsedDate)) {
        // Check if date is within valid range
        const today = new Date();
        const minDate = new Date("1900-01-01");
        
        if (parsedDate > today) {
          setTanggalMulaiError("Tanggal tidak boleh lebih dari hari ini");
          return;
        }
        
        if (parsedDate < minDate) {
          setTanggalMulaiError("Tanggal tidak boleh kurang dari tahun 1900");
          return;
        }

        setTanggalMulaiDate(parsedDate);
        setValue("tanggalMulai", parsedDate);
        setTanggalMulaiError(null);
      } else {
        setTanggalMulaiError("Format tanggal tidak valid. Gunakan format MM/YYYY");
      }
    } catch (error) {
      setTanggalMulaiError("Format tanggal tidak valid. Gunakan format MM/YYYY");
    }
  };

  const handleTanggalSelesaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Format input to include slashes automatically
    if (inputValue.length > 0) {
      // Remove any non-digit characters
      const digits = inputValue.replace(/\D/g, '');
      
      // Format with slashes (MM/YYYY)
      if (digits.length <= 2) {
        inputValue = digits;
      } else {
        inputValue = `${digits.substring(0, 2)}/${digits.substring(2, 6)}`;
      }
    }
    
    setValue("tanggalSelesaiText", inputValue);
    
    if (!inputValue) {
      setTanggalSelesaiError("Tanggal selesai wajib diisi");
      return;
    }

    // Only try to parse if we have enough characters for a complete date
    if (inputValue.length < 7) {
      return;
    }

    try {
      // Parse MM/YYYY format
      const parsedDate = parse(`01/${inputValue}`, 'dd/MM/yyyy', new Date());
      
      if (isValid(parsedDate)) {
        // Check if date is within valid range
        const today = new Date();
        const minDate = new Date("1900-01-01");
        
        if (parsedDate > today) {
          setTanggalSelesaiError("Tanggal tidak boleh lebih dari hari ini");
          return;
        }
        
        if (parsedDate < minDate) {
          setTanggalSelesaiError("Tanggal tidak boleh kurang dari tahun 1900");
          return;
        }
        
        // Check if end date is before start date
        if (tanggalMulaiDate && parsedDate < tanggalMulaiDate) {
          setTanggalSelesaiError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai");
          return;
        }

        setTanggalSelesaiDate(parsedDate);
        setValue("tanggalSelesai", parsedDate);
        setTanggalSelesaiError(null);
      } else {
        setTanggalSelesaiError("Format tanggal tidak valid. Gunakan format MM/YYYY");
      }
    } catch (error) {
      setTanggalSelesaiError("Format tanggal tidak valid. Gunakan format MM/YYYY");
    }
  };

  const onSubmit = (values: PengalamanKerjaValues) => {
    if (tanggalMulaiError || (!masihBekerja && tanggalSelesaiError)) {
      return;
    }
    
    setIsSubmitting(true);
    
    const formattedData: PengalamanKerja = {
      id: pengalaman?.id || Date.now().toString(),
      levelPengalaman: pengalaman?.levelPengalaman || "LULUSAN_BARU",
      namaPerusahaan: values.namaPerusahaan,
      posisi: values.posisi,
      tanggalMulai: values.tanggalMulai ? values.tanggalMulai.toISOString().split("T")[0] : "",
      tanggalSelesai: values.masihBekerja 
        ? "Sekarang" 
        : values.tanggalSelesai
          ? values.tanggalSelesai.toISOString().split("T")[0]
          : "",
      deskripsiPekerjaan: values.deskripsiPekerjaan || "",
      lokasi: values.lokasi || "",
      gajiTerakhir: values.gajiTerakhir || "",
      alasanKeluar: values.alasanKeluar === "Lainnya" 
        ? values.alasanKeluarLainnya 
        : values.alasanKeluar || "",
      lokasiKerja: pengalaman?.lokasiKerja || "WFO",
    };

    // Add a slight delay to show loading state
    setTimeout(() => {
      onSave(formattedData);
      setIsSubmitting(false);
      setIsEditing(false); // Exit edit mode after saving
    }, 300);
  };

  const watchMasihBekerja = watch("masihBekerja");
  const watchAlasanKeluar = watch("alasanKeluar");
  const watchTanggalMulaiText = watch("tanggalMulaiText");
  const watchTanggalSelesaiText = watch("tanggalSelesaiText");

  // Format dates for display in the summary view
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "";
    if (dateString === "Sekarang") return "Sekarang";
    
    try {
      const date = new Date(dateString);
      return format(date, "MM/yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`border rounded-md mb-4 ${isEditing ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
      {isEditing ? (
        <form className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <FormLabel htmlFor="namaPerusahaan" required>Nama Perusahaan atau Tempat Kerja</FormLabel>
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
              <FormLabel htmlFor="posisi" required>Posisi/Jabatan</FormLabel>
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
              <div className="flex items-center">
                <FormLabel htmlFor="tanggalMulai" required>Tanggal Mulai</FormLabel>
              </div>
              
              <div className="w-full">
                <Input
                  id="tanggalMulaiText"
                  placeholder="MM/YYYY"
                  value={watchTanggalMulaiText}
                  onChange={handleTanggalMulaiChange}
                  inputMode="numeric"
                  className={cn(
                    tanggalMulaiError || errors.tanggalMulai ? "border-red-500" : ""
                  )}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Format: MM/YYYY (contoh: 06/2020)
                </div>
                {tanggalMulaiError && (
                  <p className="text-red-500 text-sm mt-1">{tanggalMulaiError}</p>
                )}
                {errors.tanggalMulai && !tanggalMulaiError && (
                  <p className="text-red-500 text-sm mt-1">{errors.tanggalMulai.message as string}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <FormLabel htmlFor="tanggalSelesai">Tanggal Selesai</FormLabel>
                {!watchMasihBekerja && <span className="text-red-500 ml-1">*</span>}
              </div>
              
              {!watchMasihBekerja && (
                <div className="w-full">
                  <Input
                    id="tanggalSelesaiText"
                    placeholder="MM/YYYY"
                    value={watchTanggalSelesaiText}
                    onChange={handleTanggalSelesaiChange}
                    inputMode="numeric"
                    className={cn(
                      tanggalSelesaiError || errors.tanggalSelesai ? "border-red-500" : ""
                    )}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Format: MM/YYYY (contoh: 06/2022)
                  </div>
                  {tanggalSelesaiError && (
                    <p className="text-red-500 text-sm mt-1">{tanggalSelesaiError}</p>
                  )}
                  {errors.tanggalSelesai && !tanggalSelesaiError && !watchMasihBekerja && (
                    <p className="text-red-500 text-sm mt-1">{errors.tanggalSelesai.message as string}</p>
                  )}
                </div>
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
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isNew) {
                  onDelete(pengalaman?.id || "");
                } else {
                  setIsEditing(false);
                }
              }}
            >
              {isNew ? "Batal" : "Tutup"}
            </Button>
            <div className="flex space-x-2">
              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(pengalaman?.id || "")}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              )}
              <Button 
                onClick={handleSubmit(onSubmit)} 
                size="sm" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <details 
          className="group" 
          open={isExpanded}
          onToggle={(e) => setIsExpanded((e.target as HTMLDetailsElement).open)}
        >
          <summary className="flex p-4 cursor-pointer list-none">
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center">
                <span className="font-semibold">{pengalaman?.posisi}</span>
                {isPengalamanTerakhir && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Pengalaman Terakhir
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {pengalaman?.namaPerusahaan}{pengalaman?.lokasi ? `, ${pengalaman.lokasi}` : ''}
              </span>
            </div>
          </summary>
          <div className="px-4 pb-4">
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-500">
                Periode: {formatDisplayDate(pengalaman?.tanggalMulai)} - {pengalaman?.tanggalSelesai === "Sekarang" 
                  ? "Sekarang"
                  : formatDisplayDate(pengalaman?.tanggalSelesai)}
              </div>
              
              {pengalaman?.deskripsiPekerjaan && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Deskripsi Pekerjaan:</span>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm mt-1">
                    {pengalaman.deskripsiPekerjaan}
                  </p>
                </div>
              )}
              
              {pengalaman?.gajiTerakhir && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Gaji Terakhir:</span>
                  <p className="text-gray-700 text-sm mt-1">
                    {pengalaman.gajiTerakhir}
                  </p>
                </div>
              )}
              
              {pengalaman?.alasanKeluar && pengalaman.tanggalSelesai !== "Sekarang" && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Alasan Keluar:</span>
                  <p className="text-gray-700 text-sm mt-1">
                    {pengalaman.alasanKeluar}
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </div>
        </details>
      )}
    </div>
  );
}