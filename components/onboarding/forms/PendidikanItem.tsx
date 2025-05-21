"use client";

import { useState, useMemo, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import { Pendidikan } from "@/lib/db-types";
import { FormLabel } from "@/components/ui/form-label";

const pendidikanSchema = z.object({
  namaInstitusi: z.string().optional(),
  lokasi: z.string().optional(),
  jenjangPendidikan: z.string().min(1, "Jenjang pendidikan wajib diisi"),
  bidangStudi: z.string().optional(),
  tahunLulus: z.string().optional(),
  masihKuliah: z.boolean().optional(),
  tidakLulus: z.boolean().optional(),
});

type PendidikanValues = z.infer<typeof pendidikanSchema>;

interface PendidikanItemProps {
  pendidikan?: Pendidikan;
  onSave: (data: Pendidikan) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
  expanded?: boolean;
  isPendidikanTerakhir?: boolean;
}

const jenjangPendidikanOptions = [
  "SD",
  "SMP",
  "SMA/SMK",
  "D1",
  "D2",
  "D3",
  "D4",
  "S1",
  "S2",
  "S3",
];

export default function PendidikanItem({
  pendidikan,
  onSave,
  onDelete,
  isNew = false,
  expanded = false,
  isPendidikanTerakhir = false,
}: PendidikanItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isExpanded, setIsExpanded] = useState(expanded || isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masihKuliah, setMasihKuliah] = useState(
    pendidikan?.tanggalLulus === "Masih Kuliah"
  );
  const [tidakLulus, setTidakLulus] = useState(
    pendidikan?.tanggalLulus === "Tidak Lulus"
  );

  // Effect to ensure expanded state reflects prop changes
  useEffect(() => {
    setIsExpanded(expanded || isNew);
  }, [expanded, isNew]);

  // Generate years for the dropdown (from current year to 50 years ago)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 51 }, (_, i) => (currentYear - i).toString());
  }, []);

  const defaultValues: Partial<PendidikanValues> = {
    namaInstitusi: pendidikan?.namaInstitusi || "",
    lokasi: pendidikan?.lokasi || "",
    jenjangPendidikan: pendidikan?.jenjangPendidikan || "",
    bidangStudi: pendidikan?.bidangStudi || "",
    tahunLulus: pendidikan?.tanggalLulus && pendidikan.tanggalLulus !== "Masih Kuliah" && pendidikan.tanggalLulus !== "Tidak Lulus"
      ? pendidikan.tanggalLulus.split("-")[0] // Extract year from ISO date
      : "",
    masihKuliah: masihKuliah,
    tidakLulus: tidakLulus,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PendidikanValues>({
    resolver: zodResolver(pendidikanSchema),
    defaultValues,
  });

  const onSubmit = (values: PendidikanValues) => {
    setIsSubmitting(true);
    
    // Format the data for saving
    const formattedData: Pendidikan = {
      id: pendidikan?.id || Date.now().toString(),
      namaInstitusi: values.namaInstitusi || "",
      lokasi: values.lokasi || "",
      jenjangPendidikan: values.jenjangPendidikan,
      bidangStudi: values.bidangStudi || "",
      tanggalLulus: values.masihKuliah 
        ? "Masih Kuliah" 
        : values.tidakLulus
          ? values.tahunLulus || "Tidak Lulus" // Use the year if selected, otherwise just "Tidak Lulus"
          : values.tahunLulus || "",
      tidakLulus: values.tidakLulus,
    };

    // Save the data
    setTimeout(() => {
      onSave(formattedData);
      setIsSubmitting(false);
      setIsEditing(false);
    }, 300);
  };

  const watchMasihKuliah = watch("masihKuliah");
  const watchTidakLulus = watch("tidakLulus");
  const watchJenjangPendidikan = watch("jenjangPendidikan");

  return (
    <div className={`border rounded-md mb-4 ${isEditing ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel htmlFor="jenjangPendidikan" required>
                Jenjang Pendidikan
              </FormLabel>
              <Select
                defaultValue={defaultValues.jenjangPendidikan}
                onValueChange={(value) => setValue("jenjangPendidikan", value)}
              >
                <SelectTrigger 
                  id="jenjangPendidikan"
                  className={errors.jenjangPendidikan ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih jenjang" />
                </SelectTrigger>
                <SelectContent>
                  {jenjangPendidikanOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jenjangPendidikan && (
                <p className="text-red-500 text-sm">{errors.jenjangPendidikan.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="bidangStudi">
                Jurusan <span className="text-gray-500 text-sm font-normal">(Opsional)</span>
              </FormLabel>
              <Input
                id="bidangStudi"
                placeholder="Ilmu Komputer"
                {...register("bidangStudi")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="tahunLulus">
              {watchTidakLulus ? "Berhenti Sekolah/Kuliah Tahun" : "Tahun Kelulusan"} {!watchMasihKuliah && <span className="text-red-500">*</span>}
            </FormLabel>
            <div className="flex flex-col space-y-2">
              <Select
                disabled={watchMasihKuliah}
                defaultValue={defaultValues.tahunLulus}
                onValueChange={(value) => setValue("tahunLulus", value)}
              >
                <SelectTrigger 
                  id="tahunLulus"
                  className={errors.tahunLulus && !watchMasihKuliah ? "border-red-500" : ""}
                >
                  <SelectValue placeholder={watchTidakLulus ? "Pilih tahun berhenti" : "Pilih tahun kelulusan"} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="masihKuliah"
                  checked={watchMasihKuliah}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    setValue("masihKuliah", isChecked);
                    setMasihKuliah(isChecked);
                    if (isChecked && watchTidakLulus) {
                      setValue("tidakLulus", false);
                      setTidakLulus(false);
                    }
                  }}
                />
                <FormLabel
                  htmlFor="masihKuliah"
                  className="text-sm font-normal cursor-pointer"
                >
                  Saat ini masih sekolah/kuliah
                </FormLabel>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="tidakLulus"
                  checked={watchTidakLulus}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    setValue("tidakLulus", isChecked);
                    setTidakLulus(isChecked);
                    if (isChecked && watchMasihKuliah) {
                      setValue("masihKuliah", false);
                      setMasihKuliah(false);
                    }
                  }}
                />
                <FormLabel
                  htmlFor="tidakLulus"
                  className="text-sm font-normal cursor-pointer"
                >
                  Tidak Lulus
                </FormLabel>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (isNew) {
                  onDelete(pendidikan?.id || "");
                } else {
                  setIsEditing(false);
                }
              }}
            >
              Batal
            </Button>
            <div className="flex space-x-2">
              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(pendidikan?.id || "")}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isSubmitting}>
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
                <span className="font-semibold">{pendidikan?.jenjangPendidikan} {pendidikan?.bidangStudi}</span>
                {isPendidikanTerakhir && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Pendidikan Terakhir
                  </span>
                )}
              </div>
              {pendidikan?.namaInstitusi && (
                <span className="text-sm text-gray-500">
                  {pendidikan?.namaInstitusi}{pendidikan?.lokasi ? `, ${pendidikan?.lokasi}` : ''}
                </span>
              )}
            </div>
          </summary>
          <div className="px-4 pb-4">
            <div className="space-y-2 mb-4">
              {pendidikan?.tanggalLulus && (
                <div className="text-sm text-gray-500">
                  Tahun Kelulusan: {pendidikan?.tanggalLulus === "Masih Kuliah" 
                    ? "Saat ini masih sekolah/kuliah"
                    : pendidikan?.tidakLulus
                      ? `Tidak Lulus (Berhenti tahun ${pendidikan?.tanggalLulus})`
                      : pendidikan?.tanggalLulus}
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