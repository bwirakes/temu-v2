"use client";

import { useJobPosting } from "@/lib/context/JobPostingContext";
import { createJobPosting } from "@/lib/actions/job-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

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

  // Format date to dd/mm/yyyy for display
  function formatDateForDisplay(date: Date | undefined): string {
    if (!date) return 'Tidak Ada';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Format salary to Indonesian Rupiah
  function formatSalary(amount: number | undefined): string {
    if (!amount) return 'Tidak Ditentukan';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

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

  // Map contract type to display text
  function formatContractType(type: string | undefined): string {
    switch (type) {
      case 'FULL_TIME': return 'Full Time';
      case 'PART_TIME': return 'Part Time';
      case 'CONTRACT': return 'Kontrak';
      case 'INTERNSHIP': return 'Magang';
      case 'FREELANCE': return 'Freelance';
      default: return 'Tidak Ditentukan';
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Create the job posting - employerId is handled by the API route
      const jobPosting = await createJobPosting({
        ...data,
        isConfirmed: true, // Automatically confirm on submission
      });

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
        <h3 className="text-lg font-semibold">Keterangan Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Jenis Pekerjaan</p>
            <p className="mt-1">{data.jobTitle || 'Tidak Ditentukan'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Jumlah Tenaga Kerja</p>
            <p className="mt-1">{data.numberOfPositions || 1}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Tugas & Tanggung Jawab</p>
            <ul className="mt-1 list-disc list-inside">
              {data.responsibilities && data.responsibilities.length > 0 ? 
                data.responsibilities.map((resp, index) => <li key={index}>{resp}</li>) :
                <li>Tidak ada tugas yang ditentukan</li>
              }
            </ul>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Lokasi Kerja</p>
            {data.workLocations && data.workLocations.length > 0 ? (
              <ul className="mt-1 list-disc list-inside">
                {data.workLocations.map((loc, index) => (
                  <li key={index}>
                    {loc.city}, {loc.province} {loc.isRemote ? '(Remote)' : ''}
                    {loc.address && ` - ${loc.address}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">Tidak ada lokasi yang ditentukan</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Jam Kerja</p>
            <p className="mt-1">{data.workingHours || 'Tidak Ditentukan'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Rentang Gaji</p>
            <p className="mt-1">
              {data.salaryRange?.min ? formatSalary(data.salaryRange.min) : 'Tidak Ditentukan'} 
              {data.salaryRange?.min && data.salaryRange?.max ? ' - ' : ''}
              {data.salaryRange?.max ? formatSalary(data.salaryRange.max) : ''}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Persyaratan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
            <p className="mt-1">{formatGender(data.gender || data.additionalRequirements?.gender)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pengalaman Kerja Minimal</p>
            <p className="mt-1">{data.minWorkExperience} tahun</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Dokumen yang Diperlukan</p>
            <p className="mt-1">{data.requiredDocuments || data.additionalRequirements?.requiredDocuments || 'Tidak Ada'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Ketrampilan Khusus</p>
            <p className="mt-1">{data.specialSkills || data.additionalRequirements?.specialSkills || 'Tidak Ada'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Ketrampilan Teknologi</p>
            <p className="mt-1">{data.technologicalSkills || data.additionalRequirements?.technologicalSkills || 'Tidak Ada'}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Harapan Perusahaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Rentang Usia</p>
            <p className="mt-1">
              {data.expectations?.ageRange ? 
                `${data.expectations.ageRange.min} - ${data.expectations.ageRange.max} tahun` : 
                'Tidak Ditentukan'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Bahasa Asing</p>
            <p className="mt-1">{data.expectations?.foreignLanguage || 'Tidak Ada'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">Karakter yang Diharapkan</p>
            <p className="mt-1">{data.expectations?.expectedCharacter || 'Tidak Ditentukan'}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informasi Tambahan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Tipe Kontrak</p>
            <p className="mt-1">{formatContractType(data.contractType)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Batas Akhir Lamaran</p>
            <p className="mt-1">{data.applicationDeadline ? formatDateForDisplay(new Date(data.applicationDeadline)) : 'Tidak Ada'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Cocok untuk Disabilitas</p>
            <p className="mt-1">{data.suitableForDisability || data.additionalRequirements?.suitableForDisability ? 'Ya' : 'Tidak'}</p>
          </div>
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