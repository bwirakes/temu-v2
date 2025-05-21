"use client";

import { useJobPosting } from "@/lib/context/JobPostingContext";
import { createJobPosting } from "@/lib/actions/job-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

// Education options that should show jurusan
const EDUCATION_WITH_JURUSAN = [
  "SMK", "SMA", "SMA/SMK", 
  "D1", "D2", "D3", "D4", 
  "S1", "S2", "S3"
];

export default function ConfirmationForm() {
  const { data } = useJobPosting();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchEmployerId() {
      try {
        const response = await fetch('/api/employer/get-id');
        if (response.ok) {
          const data = await response.json();
          setEmployerId(data.employerId);
        }
      } catch (error) {
        console.error('Error fetching employer ID:', error);
      }
    }

    fetchEmployerId();
  }, []);

  // Map gender value to display text
  function formatGender(gender: string | undefined): string {
    switch (gender) {
      case 'MALE': return 'Laki-laki';
      case 'FEMALE': return 'Perempuan';
      case 'ANY': return 'Semua Jenis Kelamin';
      case 'ALL': return 'Semua';
      default: return 'Tidak Spesifik';
    }
  }

  // Helper function to check if this education level should show jurusan
  const shouldShowJurusan = (education: string | undefined): boolean => {
    if (!education) return false;
    return EDUCATION_WITH_JURUSAN.includes(education);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Validate required fields before submission
      if (!data.jobTitle || data.minWorkExperience === undefined) {
        toast.error("Data tidak lengkap", {
          description: "Harap lengkapi semua field yang diperlukan"
        });
        setIsSubmitting(false);
        return;
      }

      // Check if disability-related fields are provided
      const hasDisabilityData = 
        data.additionalRequirements?.acceptedDisabilityTypes?.length &&
        data.additionalRequirements.numberOfDisabilityPositions &&
        data.additionalRequirements.numberOfDisabilityPositions > 0;

      // Ensure we're sending valid values
      const jobPostingData = {
        ...data,
        // Keep minWorkExperience as enum string, don't convert to number
        minWorkExperience: data.minWorkExperience,
        isConfirmed: true, // Automatically confirm on submission
        numberOfPositions: data.numberOfPositions ? Number(data.numberOfPositions) : 1,
        // Ensure nested objects are properly structured
        expectations: {
          ageRange: data.expectations?.ageRange ? {
            min: data.expectations.ageRange.min ? Number(data.expectations.ageRange.min) : 18,
            max: data.expectations.ageRange.max ? Number(data.expectations.ageRange.max) : 45,
          } : undefined
        },
        additionalRequirements: {
          gender: data.additionalRequirements?.gender || "ANY",
          // Set disability fields based on whether they're provided
          acceptedDisabilityTypes: hasDisabilityData ? 
            data.additionalRequirements?.acceptedDisabilityTypes : null,
          numberOfDisabilityPositions: hasDisabilityData ? 
            Number(data.additionalRequirements?.numberOfDisabilityPositions) : null
        }
      };

      console.log("Submitting job posting with data:", jobPostingData);

      // Create the job posting - employerId is handled by the API route
      const jobPosting = await createJobPosting(jobPostingData);

      toast.success("Lowongan berhasil dibuat", {
        description: "Lowongan pekerjaan Anda telah berhasil dibuat dan akan segera ditampilkan.",
        action: employerId ? {
          label: "Lihat Halaman Publik",
          onClick: () => window.open(`/careers/${employerId}`, '_blank')
        } : undefined
      });

      // Redirect to job listings page or dashboard
      router.push('/employer/jobs'); // Changed to /employer/jobs based on other files
    } catch (error) {
      console.error("Error submitting job posting:", error);

      toast.error("Gagal membuat lowongan", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat lowongan pekerjaan. Silakan coba lagi nanti."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informasi Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Jenis Pekerjaan</p>
            <p className="mt-1">{data.jobTitle || 'Tidak Ditentukan'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Jumlah Tenaga Kerja</p>
            <p className="mt-1">{data.numberOfPositions || 1}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pendidikan Terakhir</p>
            <p className="mt-1">{data.lastEducation || 'Tidak Ditentukan'}</p>
          </div>
          {/* Display Jurusan if applicable and not empty */}
          {data.lastEducation && shouldShowJurusan(data.lastEducation) && data.jurusan && (
            <div>
              <p className="text-sm font-medium text-gray-500">Jurusan</p>
              <p className="mt-1">{data.jurusan}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Pengalaman Kerja Minimal</p>
            <p className="mt-1">{data.minWorkExperience} tahun</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Lokasi Kerja</p>
            <p className="mt-1">{data.lokasiKerja || 'Tidak Ditentukan'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Kompetensi yang Dibutuhkan</p>
            {data.requiredCompetencies ? (
              <p className="mt-1 whitespace-pre-line">{data.requiredCompetencies}</p>
            ) : (
              <p className="mt-1">Tidak ada kompetensi yang ditentukan</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detail Tambahan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
            <p className="mt-1">{formatGender(data.additionalRequirements?.gender)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rentang Usia</p>
            <p className="mt-1">
              {data.expectations?.ageRange ? 
                `${data.expectations.ageRange.min || '-'} - ${data.expectations.ageRange.max || '-'} tahun` : 
                'Tidak Ditentukan'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cocok untuk Disabilitas</p>
            <p className="mt-1">
              {(data.additionalRequirements?.acceptedDisabilityTypes?.length || 0) > 0 ? 'Ya' : 'Tidak'}
            </p>
          </div>
          {(data.additionalRequirements?.acceptedDisabilityTypes?.length || 0) > 0 && (
            <>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Jenis Disabilitas</p>
                {data.additionalRequirements?.acceptedDisabilityTypes?.length ? (
                  <ul className="mt-1 list-disc list-inside">
                    {data.additionalRequirements.acceptedDisabilityTypes.map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">Tidak ditentukan</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Jumlah Posisi untuk Disabilitas</p>
                <p className="mt-1">{data.additionalRequirements?.numberOfDisabilityPositions || 0}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={() => router.back()} variant="outline">Kembali</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Lowongan"}
        </Button>
      </div>
    </div>
  );
}