"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { FileText, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormNav from "@/components/FormNav";
import { useSession } from "next-auth/react";
import { CustomSession } from "@/lib/types";
import { Button } from "@/components/ui/button";

// Define proper interfaces for the data types
interface LevelPengalamanData {
  levelPengalaman?: string;
  jumlahPengalaman?: number | string;
  bidangKeahlian?: string;
  keterampilan?: string[];
}

// Add a specific type for parsed ekspektasiKerja to align with the context definition
interface ParsedEkspektasiKerja {
  jobTypes: string;
  idealSalary: number;
  willingToTravel: "wfh" | "wfo" | "travel" | "relocate" | "local_only" | "domestic" | "international";
  preferensiLokasiKerja: "local_only" | "domestic" | "international" | "WFO" | "WFH" | "Hybrid";
}

export default function RingkasanProfil() {
  const { 
    data, 
    navigateToStep,
    getStepPath,
    getStepValidationErrors,
    isSubmitting: contextIsSubmitting,
    submissionError: contextSubmissionError,
    currentStep,
    submitOnboardingData,
    navigateToPreviousStep
  } = useOnboarding();
  
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
  const router = useRouter();
  const { data: sessionData } = useSession();

  useEffect(() => {
    if (contextSubmissionError) {
      setSubmitError(contextSubmissionError);
    }
  }, [contextSubmissionError]);

  const handleSubmit = async () => {
    try {
      setIsLocalSubmitting(true);
      
      // Submit onboarding data to server
      const success = await submitOnboardingData();
      
      if (!success) {
        setSubmitError(contextSubmissionError || "Gagal menyelesaikan pendaftaran. Silakan coba lagi.");
        setSubmitSuccess(false);
        toast.error("Gagal menyelesaikan pendaftaran");
        return;
      }

      // Success path
      setSubmitSuccess(true);
      toast.success("Pendaftaran berhasil diselesaikan!");
      
      // Wait to ensure database updates are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set the destination URL
      const redirectUrl = "/job-seeker/dashboard";

      // Refresh the router to ensure middleware picks up the latest DB state
      router.refresh();
      
      // Add a small delay for state changes to propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to the dashboard - middleware will handle routing based on database status
      router.replace(redirectUrl);
    } catch (error) {
      console.error('Error during onboarding submission:', error);
      setSubmitError("Gagal menyelesaikan pendaftaran. Silakan coba lagi.");
      setSubmitSuccess(false);
      toast.error("Gagal menyelesaikan pendaftaran");
    } finally {
      setIsLocalSubmitting(false);
    }
  };

  // Parse ekspektasiKerja if it's a string
  let ekspektasiKerjaData: ParsedEkspektasiKerja | null = null;
  
  if (typeof data.ekspektasiKerja === 'string' && data.ekspektasiKerja) {
    try {
      // Only try to parse as JSON if it looks like a JSON string
      const strValue = data.ekspektasiKerja as string;
      if (strValue.trim().startsWith('{') && strValue.trim().endsWith('}')) {
        ekspektasiKerjaData = JSON.parse(strValue) as ParsedEkspektasiKerja;
      } else {
        // If it's not a JSON format string, use it as jobTypes
        ekspektasiKerjaData = {
          idealSalary: 0,
          willingToTravel: "local_only",
          jobTypes: strValue,
          preferensiLokasiKerja: "local_only"
        };
      }
    } catch (e) {
      ekspektasiKerjaData = {
        idealSalary: 0,
        willingToTravel: "local_only",
        jobTypes: "",
        preferensiLokasiKerja: "local_only"
      };
    }
  } else if (!data.ekspektasiKerja) {
    ekspektasiKerjaData = null;
  } else {
    // Already an object, ensure it has the expected structure
    const rawData = data.ekspektasiKerja as any;
    
    ekspektasiKerjaData = {
      jobTypes: rawData.jobTypes ?? "",
      idealSalary: rawData.idealSalary ?? 0,
      willingToTravel: rawData.willingToTravel ?? "local_only",
      preferensiLokasiKerja: rawData.preferensiLokasiKerja ?? "local_only"
    };
  }

  // Parse level pengalaman if available
  let levelPengalamanData: LevelPengalamanData | null = null;
  if (data.levelPengalaman) {
    if (typeof data.levelPengalaman === 'string') {
      try {
        // Try to parse as JSON first
        if (data.levelPengalaman.startsWith('{') && data.levelPengalaman.endsWith('}')) {
          levelPengalamanData = JSON.parse(data.levelPengalaman) as LevelPengalamanData;
        } else {
          // If it's not a JSON string, use it directly as the levelPengalaman value
          levelPengalamanData = {
            levelPengalaman: data.levelPengalaman
          };
        }
      } catch (e) {
        console.error("Failed to parse levelPengalaman JSON:", e);
        // If parsing fails, use the string as the enum value
        levelPengalamanData = {
          levelPengalaman: data.levelPengalaman
        };
      }
    } else {
      // If it's already an object, just use it directly
      levelPengalamanData = data.levelPengalaman as unknown as LevelPengalamanData;
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-blue-700">
          Silakan periksa ringkasan informasi Anda di bawah ini sebelum menyelesaikan pendaftaran.
        </p>
        <p className="text-blue-700 mt-2 text-sm">
          <strong>Catatan:</strong> Pengalaman Kerja, Ekspektasi Kerja, CV, dan Foto Profil adalah bagian opsional dan dapat dilengkapi nanti.
        </p>
      </div>

      {/* Personal Information */}
      <SectionCard title="Informasi Pribadi" icon="👤">
        <InfoItem label="Nama Lengkap" value={data.namaLengkap} />
        <InfoItem label="Email" value={data.email} />
        <InfoItem label="Nomor Telepon" value={data.nomorTelepon} />
        <InfoItem label="Tempat Lahir" value={data.tempatLahir} />
        <InfoItem label="Tanggal Lahir" value={data.tanggalLahir} />
        <InfoItem label="Jenis Kelamin" value={data.jenisKelamin || "-"} />
      </SectionCard>

      {/* Address */}
      {data.alamat && Object.keys(data.alamat).some(key => !!data.alamat?.[key as keyof typeof data.alamat]) && (
        <SectionCard title="Alamat" icon="🏠">
          <InfoItem label="Jalan" value={data.alamat.jalan || "-"} />
          <InfoItem label="Kota" value={data.alamat.kota || "-"} />
          <InfoItem label="Provinsi" value={data.alamat.provinsi || "-"} />
          <InfoItem label="Kode Pos" value={data.alamat.kodePos || "-"} />
          {(data.alamat as any).rt !== undefined && (
            <InfoItem label="RT" value={(data.alamat as any).rt || "-"} />
          )}
          {(data.alamat as any).rw !== undefined && (
            <InfoItem label="RW" value={(data.alamat as any).rw || "-"} />
          )}
          {(data.alamat as any).kelurahan !== undefined && (
            <InfoItem label="Kelurahan" value={(data.alamat as any).kelurahan || "-"} />
          )}
          {(data.alamat as any).kecamatan !== undefined && (
            <InfoItem label="Kecamatan" value={(data.alamat as any).kecamatan || "-"} />
          )}
        </SectionCard>
      )}

      {/* Profile Photo */}
      {data.profilePhotoUrl && (
        <SectionCard title="Foto Profile" icon="📸">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="bg-blue-100 p-2 rounded-full">
              <Camera className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Foto Profile Terunggah</p>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 relative">
              <Image 
                src={data.profilePhotoUrl} 
                alt="Profile"
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "https://placehold.co/200x200/e2e8f0/64748b?text=Profile";
                }}
                priority={false}
                loading="lazy"
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Education */}
      {data.pendidikan && data.pendidikan.length > 0 && (
        <SectionCard title="Pendidikan" icon="🎓">
          <div className="space-y-6">
            {data.pendidikan.map((pendidikan, index) => (
              <div key={pendidikan.id || index} className={`${index !== data.pendidikan.length - 1 ? 'border-b pb-4' : ''}`}>
                <h4 className="font-medium text-gray-900">{pendidikan.namaInstitusi}</h4>
                <p className="text-gray-600">
                  {pendidikan.jenjangPendidikan}
                  {pendidikan.bidangStudi ? ` - ${pendidikan.bidangStudi}` : ''}
                </p>
                <p className="text-sm text-gray-500">Lokasi: {pendidikan.lokasi || '-'}</p>
                <p className="text-sm text-gray-500">Lulus: {pendidikan.tanggalLulus}</p>
                {pendidikan.nilaiAkhir && (
                  <p className="text-sm text-gray-600">Nilai: {pendidikan.nilaiAkhir}</p>
                )}
                {pendidikan.deskripsiTambahan && (
                  <p className="mt-1 text-sm text-gray-600">{pendidikan.deskripsiTambahan}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Work Experience */}
      {data.pengalamanKerja && data.pengalamanKerja.length > 0 && (
        <SectionCard title="Pengalaman Kerja" icon="💼">
          <div className="space-y-6">
            {data.pengalamanKerja.map((pengalaman, index) => (
              <div key={pengalaman.id || index} className={`${index !== data.pengalamanKerja.length - 1 ? 'border-b pb-4' : ''}`}>
                <h4 className="font-medium text-gray-900">{pengalaman.posisi}</h4>
                <p className="text-gray-600">{pengalaman.namaPerusahaan}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {pengalaman.tanggalMulai} - {pengalaman.tanggalSelesai}
                  </span>
                  {pengalaman.lokasiKerja && (
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                      {pengalaman.lokasiKerja}
                    </span>
                  )}
                  {pengalaman.levelPengalaman && (
                    <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
                      {pengalaman.levelPengalaman}
                    </span>
                  )}
                </div>
                {pengalaman.deskripsiPekerjaan && (
                  <p className="mt-2 text-sm text-gray-600">{pengalaman.deskripsiPekerjaan}</p>
                )}
                {pengalaman.lokasi && (
                  <p className="mt-1 text-sm text-gray-500">Lokasi: {pengalaman.lokasi}</p>
                )}
                {pengalaman.alasanKeluar && (
                  <p className="mt-1 text-sm text-gray-500">Alasan keluar: {pengalaman.alasanKeluar}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Job Expectations */}
      {ekspektasiKerjaData && Object.keys(ekspektasiKerjaData).length > 0 && (
        <SectionCard title="Ekspektasi Kerja (Optional)" icon="🎯">
          {ekspektasiKerjaData.jobTypes && ekspektasiKerjaData.jobTypes.length > 0 ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Jenis Pekerjaan:</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(ekspektasiKerjaData.jobTypes) 
                  ? ekspektasiKerjaData.jobTypes 
                  : ekspektasiKerjaData.jobTypes.split(',').map(item => item.trim())
                ).map((type: string, idx: number) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                    {getJobTypeLabel(type)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <InfoItem label="Jenis Pekerjaan" value="Tidak diisi (opsional)" />
          )}
          
          {ekspektasiKerjaData.idealSalary ? (
            <InfoItem 
              label="Gaji Ideal" 
              value={`Rp ${Number(ekspektasiKerjaData.idealSalary).toLocaleString('id-ID')}`} 
            />
          ) : (
            <InfoItem label="Gaji Ideal" value="Tidak diisi (opsional)" />
          )}
          
          {ekspektasiKerjaData.willingToTravel ? (
            <InfoItem 
              label="Kesediaan Bepergian" 
              value={getWillingToTravelLabel(ekspektasiKerjaData.willingToTravel)} 
            />
          ) : (
            <InfoItem label="Kesediaan Bepergian" value="Tidak diisi (opsional)" />
          )}
          
          {ekspektasiKerjaData.preferensiLokasiKerja ? (
            <InfoItem 
              label="Preferensi Lokasi Kerja" 
              value={ekspektasiKerjaData.preferensiLokasiKerja} 
            />
          ) : (
            <InfoItem label="Preferensi Lokasi Kerja" value="Tidak diisi (opsional)" />
          )}
        </SectionCard>
      )}

      {/* CV Upload */}
      {data.cvFileUrl && (
        <SectionCard title="CV/Resume" icon="📄">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">CV Terunggah</p>
              <a 
                href={data.cvFileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-blue-600 hover:underline"
                onClick={(e) => {
                  // Check if URL is valid before opening
                  if (data.cvFileUrl) {
                    fetch(data.cvFileUrl, { method: 'HEAD' })
                      .then(response => {
                        if (!response.ok) {
                          e.preventDefault();
                          toast.error("File CV tidak ditemukan. Silakan unggah ulang.");
                        }
                      })
                      .catch(() => {
                        e.preventDefault();
                        toast.error("Gagal mengakses file CV. Silakan unggah ulang.");
                      });
                  }
                }}
              >
                Lihat CV
              </a>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Submission Controls */}
      <div className="mt-8">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {submitError}
          </div>
        )}
        
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            Pendaftaran berhasil diselesaikan! Anda akan dialihkan...
          </div>
        )}
        
        {/* Custom footer instead of FormNav to show explicit "Selesaikan Pendaftaran" button */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigateToPreviousStep()}
            disabled={isLocalSubmitting || contextIsSubmitting}
            className="px-6"
          >
            Sebelumnya
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isLocalSubmitting || contextIsSubmitting}
            className="px-6 bg-green-600 hover:bg-green-700"
          >
            {(isLocalSubmitting || contextIsSubmitting) ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </div>
            ) : (
              "Selesaikan Pendaftaran"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, icon }: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center bg-gray-50 px-4 py-3 border-b">
        {icon && <span className="mr-2">{icon}</span>}
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-4 divide-y divide-gray-100 space-y-3">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || "-"}</dd>
    </div>
  );
}

function getWillingToTravelLabel(value?: string): string {
  const labels: Record<string, string> = {
    // Original values from OnboardingContext
    "wfh": "Work From Home",
    "wfo": "Work From Office",
    "travel": "Bersedia Melakukan Perjalanan Bisnis",
    "relocate": "Bersedia Relokasi",
    // Legacy or alternative values
    "not_willing": "Tidak bersedia",
    "local_only": "Hanya di kota yang sama",
    "domestic": "Perjalanan domestik",
    "international": "Perjalanan internasional"
  };
  
  return value ? (labels[value] || value) : "-";
}

function getJobTypeLabel(value?: string): string {
  if (!value) return "-";
  
  // Handle if it's already a label
  if (value.includes(",") || !value.includes("_")) {
    return value;
  }
  
  const labels: Record<string, string> = {
    "full_time": "Pekerjaan Penuh Waktu",
    "part_time": "Pekerjaan Paruh Waktu",
    "contract": "Kontrak",
    "freelance": "Freelance",
    "internship": "Magang"
  };
  
  return labels[value] || value;
} 
