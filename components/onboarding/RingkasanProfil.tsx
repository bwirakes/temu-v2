"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { CheckCircle2, AlertCircle, FileText, Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Define proper interfaces for the data types
interface LevelPengalamanData {
  levelPengalaman?: string;
  jumlahPengalaman?: number | string;
  bidangKeahlian?: string;
  keterampilan?: string[];
}

export default function RingkasanProfil() {
  const { data } = useOnboarding();
  const { loadOnboardingData, saveStep, isLoading } = useOnboardingApi();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Data is now loaded from the parent component
  useEffect(() => {
    // Mark data as loaded when component mounts to avoid loading spinner
    setIsDataLoaded(true);
  }, []);

  // Utility function to check if a step is complete based on the data
  const isStepComplete = (step: number): boolean => {
    
    switch (step) {
      case 1: // Informasi Dasar
        return !!data.namaLengkap && !!data.email && !!data.nomorTelepon;
      case 2: // Informasi Lanjutan
        return !!data.tanggalLahir && !!data.tempatLahir;
      case 3: // Alamat
        return !!data.alamat?.kota;
      case 4: // Pendidikan
        return data.pendidikan.length > 0;
      case 5: // Level Pengalaman
        return !!data.levelPengalaman;
      case 6: // Pengalaman Kerja (optional)
        return true;
      case 7: // Ekspektasi Kerja (optional)
        return true;
      case 8: // CV Upload (optional)
        return true;
      case 9: // Profile Photo (optional)
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    // Client-side validation before submission
    const incompleteRequiredSteps = [];
    
    // Check required steps (1-5)
    for (let step = 1; step <= 5; step++) {
      if (!isStepComplete(step)) {
        incompleteRequiredSteps.push(step);
      }
    }
    
    if (incompleteRequiredSteps.length > 0) {
      let errorMessage = "Beberapa data belum lengkap: ";
      let redirectStep = incompleteRequiredSteps[0];
      
      if (incompleteRequiredSteps.includes(1)) {
        errorMessage = "Informasi dasar belum lengkap. Anda akan dialihkan ke langkah awal.";
        redirectStep = 1;
      } else {
        errorMessage = `Langkah ${incompleteRequiredSteps.join(", ")} belum lengkap. Anda akan dialihkan.`;
      }
      
      setSubmitError(errorMessage);
      setIsSubmitting(false);
      
      setTimeout(() => {
        const redirectPath = `/job-seeker/onboarding/${getRedirectPathForStep(redirectStep)}`;
        window.location.href = redirectPath;
      }, 2000);
      return;
    }

    try {
      // Save the final step first
      await saveStep(10); // Updated to the correct step number
      
      // Submit the completed profile
      const response = await fetch("/api/job-seeker/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Submission error:", result);
        
        // Handle validation errors with specific redirects
        if (result.redirectTo) {
          setSubmitError(`Ada data yang belum lengkap. Anda akan dialihkan ke halaman yang diperlukan.`);
          setTimeout(() => {
            window.location.href = result.redirectTo;
          }, 2000);
          return;
        }
        
        throw new Error(result.error || "Failed to complete registration");
      }

      setSubmitSuccess(true);
      
      // Redirect to dashboard or confirmation page after successful submission
      setTimeout(() => {
        window.location.href = result.redirectUrl || "/job-seeker/dashboard";
      }, 2000);
    } catch (error) {
      setSubmitError("Terjadi kesalahan saat menyelesaikan pendaftaran. Silakan coba lagi.");
      setSubmitSuccess(false);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get the redirect path for a step
  const getRedirectPathForStep = (step: number): string => {
    switch (step) {
      case 1: return "informasi-dasar";
      case 2: return "informasi-lanjutan";
      case 3: return "alamat";
      case 4: return "pendidikan";
      case 5: return "level-pengalaman";
      case 6: return "pengalaman-kerja";
      case 7: return "ekspektasi-kerja";
      case 8: return "cv-upload";
      case 9: return "foto-profile";
      default: return "ringkasan";
    }
  };

  if (isLoading && !isDataLoaded) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  // Parse ekspektasiKerja if it's a string
  let ekspektasiKerjaData = data.ekspektasiKerja;
  
  console.log("Raw ekspektasiKerja data:", ekspektasiKerjaData);
  
  if (typeof ekspektasiKerjaData === 'string' && ekspektasiKerjaData) {
    try {
      ekspektasiKerjaData = JSON.parse(ekspektasiKerjaData);
      console.log("Parsed ekspektasiKerja from string:", ekspektasiKerjaData);
    } catch (e) {
      console.error("Failed to parse ekspektasiKerja JSON:", e);
      ekspektasiKerjaData = {
        idealSalary: 0,
        willingToTravel: "local_only",
        jobTypes: "",
        preferensiLokasiKerja: "WFO"
      };
    }
  } else if (!ekspektasiKerjaData) {
    ekspektasiKerjaData = {
      idealSalary: 0,
      willingToTravel: "local_only",
      jobTypes: "",
      preferensiLokasiKerja: "WFO"
    };
  } else {
    // Already an object, ensure it has the expected structure
    console.log("ekspektasiKerja is already an object:", ekspektasiKerjaData);
    // Add default values only for missing properties
    ekspektasiKerjaData = {
      ...ekspektasiKerjaData, // Start with the existing data
      // Then add defaults only for missing properties
      idealSalary: ekspektasiKerjaData.idealSalary ?? 0,
      willingToTravel: ekspektasiKerjaData.willingToTravel ?? "local_only",
      jobTypes: ekspektasiKerjaData.jobTypes ?? "",
      preferensiLokasiKerja: ekspektasiKerjaData.preferensiLokasiKerja ?? "WFO"
    };
  }

  // Parse level pengalaman if available
  let levelPengalamanData: LevelPengalamanData | null = null;
  if (data.levelPengalaman) {
    if (typeof data.levelPengalaman === 'string') {
      try {
        levelPengalamanData = JSON.parse(data.levelPengalaman) as LevelPengalamanData;
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
                <p className="text-gray-600">{pendidikan.jenjangPendidikan} - {pendidikan.bidangStudi}</p>
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

      {/* Submit Feedback */}
      {submitSuccess === true && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center">
          <CheckCircle2 className="text-green-500 mr-2" size={20} />
          <p className="text-green-700">
            Pendaftaran berhasil! Anda akan dialihkan ke dashboard...
          </p>
        </div>
      )}

      {submitSuccess === false && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <p className="text-red-700">{submitError}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-between space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
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
        </button>
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
  const willingness: Record<string, string> = {
    "not_willing": "Tidak bersedia bepergian",
    "local_only": "Hanya dalam kota",
    "domestic": "Bersedia perjalanan domestik",
    "international": "Bersedia perjalanan internasional",
    "jabodetabek": "Jabodetabek",
    "anywhere": "Di mana saja"
  };
  
  return value ? willingness[value] || value : "-";
}

function getJobTypeLabel(value?: string): string {
  const jobTypes: Record<string, string> = {
    "full_time": "Waktu Penuh (Full-time)",
    "part_time": "Paruh Waktu (Part-time)",
    "contract": "Kontrak",
    "internship": "Magang",
    "freelance": "Lepas (Freelance)",
    "remote": "Remote",
    "hybrid": "Hybrid"
  };
  
  return value ? jobTypes[value] || value : "-";
} 
