"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, FileUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormNav from "@/components/FormNav";
import { FormLabel } from "@/components/ui/form-label";

const sertifikasiSchema = z.object({
  nama: z.string().min(1, "Nama sertifikasi wajib diisi"),
  penerbit: z.string().min(1, "Penerbit sertifikasi wajib diisi"),
  tanggalTerbit: z.string().min(1, "Tanggal terbit wajib diisi"),
  file: z.any().optional(),
});

type SertifikasiValues = z.infer<typeof sertifikasiSchema>;

export default function SertifikasiForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sertifikasiList, setSertifikasiList] = useState(data.sertifikasi || []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SertifikasiValues>({
    resolver: zodResolver(sertifikasiSchema),
  });

  const onSubmit = (values: SertifikasiValues) => {
    setSertifikasiList([...sertifikasiList, values]);
    reset();
  };

  const handleDelete = (index: number) => {
    const updatedList = [...sertifikasiList];
    updatedList.splice(index, 1);
    setSertifikasiList(updatedList);
  };

  const handleNext = () => {
    setIsSubmitting(true);
    
    updateFormValues({
      sertifikasi: sertifikasiList,
    });
    
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(11);
      router.push("/job-seeker/onboarding/bahasa");
    }, 500);
  };

  const handleSkip = () => {
    setCurrentStep(11);
    router.push("/job-seeker/onboarding/bahasa");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {sertifikasiList.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Sertifikasi yang ditambahkan</h3>
            {sertifikasiList.map((sertifikasi, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{sertifikasi.nama}</h4>
                  <p className="text-sm text-gray-600">{sertifikasi.penerbit}</p>
                  <p className="text-sm text-gray-500">{sertifikasi.tanggalTerbit}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4">
          <div className="space-y-2">
            <FormLabel htmlFor="nama" required>
              Nama Sertifikasi
            </FormLabel>
            <Input
              id="nama"
              {...register("nama")}
              placeholder="Contoh: AWS Certified Solutions Architect"
            />
            {errors.nama && (
              <p className="text-red-500 text-sm">{errors.nama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="penerbit" required>
              Penerbit
            </FormLabel>
            <Input
              id="penerbit"
              {...register("penerbit")}
              placeholder="Contoh: Amazon Web Services"
            />
            {errors.penerbit && (
              <p className="text-red-500 text-sm">{errors.penerbit.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="tanggalTerbit" required>
              Tanggal Terbit
            </FormLabel>
            <Input
              id="tanggalTerbit"
              type="month"
              {...register("tanggalTerbit")}
            />
            {errors.tanggalTerbit && (
              <p className="text-red-500 text-sm">{errors.tanggalTerbit.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="file">File Sertifikat (Opsional)</FormLabel>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                id="file"
                className="hidden"
                {...register("file")}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Unggah Sertifikat
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Format: PDF, JPG, PNG (Maks. 2MB)
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah Sertifikasi
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 mb-2">
            Sertifikasi bersifat opsional. Anda dapat melewati langkah ini.
          </p>
          <Button variant="outline" onClick={handleSkip}>
            Lewati Langkah Ini
          </Button>
        </div>
      </div>

      <FormNav 
        onSubmit={handleNext}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}