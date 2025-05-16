"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import OnboardingFormActions from "./OnboardingFormActions";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function RingkasanProfil() {
  const { data } = useOnboarding();
  const { loadOnboardingData, saveStep, isLoading } = useOnboardingApi();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadOnboardingData();
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      }
    };

    fetchData();
  }, [loadOnboardingData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      // Save the final step first
      await saveStep(14);
      
      // Submit the completed profile
      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete registration");
      }

      const result = await response.json();
      setSubmitSuccess(true);
      
      // Redirect to dashboard or confirmation page after successful submission
      setTimeout(() => {
        window.location.href = result.redirectUrl || "/dashboard";
      }, 2000);
    } catch (error) {
      setSubmitError("Terjadi kesalahan saat menyelesaikan pendaftaran. Silakan coba lagi.");
      setSubmitSuccess(false);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-blue-700">
          Silakan periksa ringkasan informasi Anda di bawah ini sebelum menyelesaikan pendaftaran.
        </p>
      </div>

      {/* Profile Photo */}
      {data.fotoProfilUrl && (
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image 
              src={data.fotoProfilUrl} 
              alt="Foto Profil" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 128px"
              priority
            />
          </div>
        </div>
      )}

      {/* Personal Information */}
      <SectionCard title="Informasi Pribadi" icon="👤">
        <InfoItem label="Nama Lengkap" value={data.namaLengkap} />
        <InfoItem label="Email" value={data.email} />
        <InfoItem label="Nomor Telepon" value={data.nomorTelepon} />
        <InfoItem label="Tempat Lahir" value={data.tempatLahir} />
        <InfoItem label="Tanggal Lahir" value={data.tanggalLahir} />
        <InfoItem label="Jenis Kelamin" value={data.jenisKelamin || "-"} />
        <InfoItem label="Status Pernikahan" value={data.statusPernikahan || "-"} />
        {data.beratBadan && <InfoItem label="Berat Badan" value={`${data.beratBadan} kg`} />}
        {data.tinggiBadan && <InfoItem label="Tinggi Badan" value={`${data.tinggiBadan} cm`} />}
        <InfoItem label="Agama" value={data.agama || "-"} />
      </SectionCard>

      {/* Address */}
      {data.alamat && Object.keys(data.alamat).some(key => !!data.alamat?.[key as keyof typeof data.alamat]) && (
        <SectionCard title="Alamat" icon="🏠">
          <InfoItem label="Jalan" value={data.alamat.jalan || "-"} />
          <InfoItem label="RT" value={data.alamat.rt || "-"} />
          <InfoItem label="RW" value={data.alamat.rw || "-"} />
          <InfoItem label="Kelurahan" value={data.alamat.kelurahan || "-"} />
          <InfoItem label="Kecamatan" value={data.alamat.kecamatan || "-"} />
          <InfoItem label="Kota" value={data.alamat.kota || "-"} />
          <InfoItem label="Provinsi" value={data.alamat.provinsi || "-"} />
          <InfoItem label="Kode Pos" value={data.alamat.kodePos || "-"} />
        </SectionCard>
      )}

      {/* Social Media */}
      {data.socialMedia && Object.keys(data.socialMedia).some(key => !!data.socialMedia?.[key as keyof typeof data.socialMedia]) && (
        <SectionCard title="Media Sosial" icon="📱">
          {data.socialMedia.instagram && <InfoItem label="Instagram" value={data.socialMedia.instagram} />}
          {data.socialMedia.twitter && <InfoItem label="Twitter" value={data.socialMedia.twitter} />}
          {data.socialMedia.facebook && <InfoItem label="Facebook" value={data.socialMedia.facebook} />}
          {data.socialMedia.tiktok && <InfoItem label="TikTok" value={data.socialMedia.tiktok} />}
          {data.socialMedia.linkedin && <InfoItem label="LinkedIn" value={data.socialMedia.linkedin} />}
          {data.socialMedia.other && <InfoItem label="Lainnya" value={data.socialMedia.other} />}
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

      {/* Education */}
      {data.pendidikan && data.pendidikan.length > 0 && (
        <SectionCard title="Pendidikan" icon="🎓">
          <div className="space-y-6">
            {data.pendidikan.map((pendidikan, index) => (
              <div key={pendidikan.id || index} className={`${index !== data.pendidikan.length - 1 ? 'border-b pb-4' : ''}`}>
                <h4 className="font-medium text-gray-900">{pendidikan.namaInstitusi}</h4>
                <p className="text-gray-600">{pendidikan.jenjangPendidikan} - {pendidikan.bidangStudi}</p>
                <p className="text-sm text-gray-500">Lokasi: {pendidikan.lokasi}</p>
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

      {/* Skills */}
      {data.keahlian && data.keahlian.length > 0 && (
        <SectionCard title="Keahlian" icon="⚙️">
          <div className="flex flex-wrap gap-2">
            {data.keahlian.map((keahlian, index) => (
              <div 
                key={index} 
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {keahlian.nama} {keahlian.tingkat && `(${keahlian.tingkat})`}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Certifications */}
      {data.sertifikasi && data.sertifikasi.length > 0 && (
        <SectionCard title="Sertifikasi" icon="🏆">
          <div className="space-y-4">
            {data.sertifikasi.map((sertifikasi, index) => (
              <div key={index} className={`${index !== (data.sertifikasi?.length ?? 0) - 1 ? 'border-b pb-4' : ''}`}>
                <p className="font-medium">{sertifikasi.nama}</p>
                {sertifikasi.penerbit && (
                  <p className="text-sm text-gray-600">Penerbit: {sertifikasi.penerbit}</p>
                )}
                {sertifikasi.tanggalTerbit && (
                  <p className="text-sm text-gray-500">Tanggal: {sertifikasi.tanggalTerbit}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Languages */}
      {data.bahasa && data.bahasa.length > 0 && (
        <SectionCard title="Bahasa" icon="🗣️">
          <div className="flex flex-wrap gap-2">
            {data.bahasa.map((bahasa, index) => (
              <div 
                key={index} 
                className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
              >
                {bahasa.nama} {bahasa.tingkat && `(${bahasa.tingkat})`}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Additional Information */}
      {data.informasiTambahan && Object.keys(data.informasiTambahan).some(key => !!data.informasiTambahan?.[key as keyof typeof data.informasiTambahan]) && (
        <SectionCard title="Informasi Tambahan" icon="ℹ️">
          {data.informasiTambahan.website && <InfoItem label="Website" value={data.informasiTambahan.website} />}
          {data.informasiTambahan.portfolio && <InfoItem label="Portfolio" value={data.informasiTambahan.portfolio} />}
          {data.informasiTambahan.tentangSaya && (
            <div className="py-2">
              <span className="block text-sm font-medium text-gray-500">Tentang Saya</span>
              <p className="mt-1 text-gray-900">{data.informasiTambahan.tentangSaya}</p>
            </div>
          )}
          {data.informasiTambahan.hobi && (
            <div className="py-2">
              <span className="block text-sm font-medium text-gray-500">Hobi</span>
              <p className="mt-1 text-gray-900">{data.informasiTambahan.hobi}</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Job Expectations */}
      {data.ekspektasiKerja && (
        <SectionCard title="Ekspektasi Kerja" icon="🎯">
          {data.ekspektasiKerja.jobTypes && <InfoItem label="Jenis Pekerjaan" value={data.ekspektasiKerja.jobTypes} />}
          <InfoItem label="Gaji Minimum" value={`Rp ${data.ekspektasiKerja.minSalary.toLocaleString('id-ID')}`} />
          <InfoItem label="Gaji Ideal" value={`Rp ${data.ekspektasiKerja.idealSalary.toLocaleString('id-ID')}`} />
          <InfoItem label="Metode Transportasi" value={getCommuteMethodLabel(data.ekspektasiKerja.commuteMethod)} />
          <InfoItem label="Bersedia Bepergian" value={getWillingToTravelLabel(data.ekspektasiKerja.willingToTravel)} />
          <InfoItem label="Bersedia Lembur" value={getWorkOvertimeLabel(data.ekspektasiKerja.workOvertime)} />
          <InfoItem label="Urgensi Pekerjaan" value={getEmploymentUrgencyLabel(data.ekspektasiKerja.employmentUrgency)} />
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin inline-block h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
              Memproses...
            </>
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
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center">
        {icon && <span className="mr-2 text-xl">{icon}</span>}
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      <div className="p-4 divide-y">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="py-3 flex flex-col sm:flex-row sm:justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-gray-900 mt-1 sm:mt-0">{value || "-"}</span>
    </div>
  );
}

// Helper functions for label mapping
function getCommuteMethodLabel(method?: string): string {
  switch (method) {
    case "private_transport": return "Kendaraan Pribadi";
    case "public_transport": return "Transportasi Umum";
    default: return method || "-";
  }
}

function getWillingToTravelLabel(value?: string): string {
  switch (value) {
    case "local_only": return "Hanya Lokal";
    case "jabodetabek": return "Jabodetabek";
    case "anywhere": return "Di Mana Saja";
    default: return value || "-";
  }
}

function getWorkOvertimeLabel(value?: string): string {
  switch (value) {
    case "yes": return "Ya";
    case "no": return "Tidak";
    default: return value || "-";
  }
}

function getEmploymentUrgencyLabel(value?: string): string {
  switch (value) {
    case "very_urgent": return "Sangat Mendesak";
    case "urgent": return "Mendesak";
    case "moderate": return "Sedang";
    case "conditional": return "Kondisional";
    default: return value || "-";
  }
} 
