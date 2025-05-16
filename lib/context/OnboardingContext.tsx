"use client";

import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode,
  useEffect
} from "react";

// Define types for our form data
export type PengalamanKerja = {
  id: string;
  levelPengalaman: "Baru lulus" | "Pengalaman magang" | "Kurang dari 1 tahun" | "1-2 tahun" | "3-5 tahun" | "5-10 tahun" | "10 tahun lebih";
  namaPerusahaan: string;
  posisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsiPekerjaan?: string;
  lokasiKerja?: "WFH" | "WFO" | "Hybrid";
  lokasi?: string;
  gajiTerakhir?: string;
  alasanKeluar?: "Kontrak tidak diperpanjang" | "Gaji terlalu kecil" | "Tidak cocok dengan atasan / rekan kerja" | "Lokasi terlalu jauh" | "Pekerjaan terlalu berat" | "Lainnya" | string;
  alasanKeluarLainnya?: string;
};

export type Pendidikan = {
  id: string;
  namaInstitusi: string;
  lokasi: string;
  jenjangPendidikan: string;
  bidangStudi: string;
  tanggalLulus: string;
  deskripsiTambahan?: string;
  nilaiAkhir?: string;
};

export type Keahlian = {
  nama: string;
  tingkat?: "Pemula" | "Menengah" | "Mahir";
};

export type Bahasa = {
  nama: string;
  tingkat?: "Pemula" | "Menengah" | "Mahir";
};

export type Sertifikasi = {
  nama: string;
  penerbit?: string;
  tanggalTerbit?: string;
  file?: File;
};

export type SocialMedia = {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  other?: string;
};

export type CommuteMethod = "private_transport" | "public_transport";
export type WillingToTravel = "local_only" | "jabodetabek" | "anywhere";
export type WorkOvertime = "yes" | "no";
export type EmploymentUrgency = "very_urgent" | "urgent" | "moderate" | "conditional";

export type EkspektasiKerja = {
  jobTypes?: string;
  minSalary: number;
  idealSalary: number;
  commuteMethod?: CommuteMethod;
  willingToTravel: WillingToTravel;
  workOvertime?: WorkOvertime;
  employmentUrgency: EmploymentUrgency;
};

export type InformasiTambahan = {
  website?: string;
  portfolio?: string;
  tentangSaya?: string;
  hobi?: string;
};

// Define agama options to match the database enum
export type AgamaType = "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";

export type OnboardingData = {
  // Step 1: Informasi Dasar
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tempatLahir: string;
  statusPernikahan?: "Belum Menikah" | "Menikah" | "Cerai";
  
  // Step 2: Informasi Lanjutan
  tanggalLahir: string;
  jenisKelamin?: "Laki-laki" | "Perempuan" | "Lainnya";
  beratBadan?: number;
  tinggiBadan?: number;
  agama?: AgamaType;
  
  // Step 3: Alamat
  alamat?: {
    jalan?: string;
    rt?: string;
    rw?: string;
    kelurahan?: string;
    kecamatan?: string;
    kota?: string;
    provinsi?: string;
    kodePos?: string;
  };
  
  // Step 4: Social Media
  socialMedia?: SocialMedia;
  
  // Step 5: Foto Profil
  fotoProfil?: File;
  fotoProfilUrl?: string;
  
  // Step 6: Pengalaman Kerja
  pengalamanKerja: PengalamanKerja[];
  
  // Step 7: Riwayat Pendidikan
  pendidikan: Pendidikan[];
  
  // Step 8: Keahlian
  keahlian: Keahlian[];
  
  // Step 9: Sertifikasi
  sertifikasi?: Sertifikasi[];
  
  // Step 10: Bahasa
  bahasa: Bahasa[];
  
  // Step 11: Informasi Tambahan (optional)
  informasiTambahan?: InformasiTambahan;
  
  // Step 12: Ekspektasi Kerja
  ekspektasiKerja?: EkspektasiKerja;
};

const initialData: OnboardingData = {
  namaLengkap: "",
  email: "",
  nomorTelepon: "",
  tempatLahir: "",
  tanggalLahir: "",
  agama: undefined,
  alamat: {
    jalan: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kodePos: "",
  },
  socialMedia: {
    instagram: "",
    twitter: "",
    facebook: "",
    tiktok: "",
    linkedin: "",
    other: "",
  },
  pengalamanKerja: [],
  pendidikan: [],
  keahlian: [],
  sertifikasi: [],
  bahasa: [],
  informasiTambahan: {
    website: "",
    portfolio: "",
    tentangSaya: "",
    hobi: "",
  },
  ekspektasiKerja: undefined,
};

type OnboardingContextType = {
  data: OnboardingData;
  setFormValues: (stepName: keyof OnboardingData, values: any) => void;
  updateFormValues: (values: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isStepComplete: (step: number) => boolean;
  getStepValidationErrors: (step: number) => Record<string, string>;
  isLoading: boolean;
  completedSteps: number[];
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load saved data from API when the context initializes
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/onboarding");
        
        if (!response.ok) {
          throw new Error("Failed to load onboarding data");
        }
        
        const result = await response.json();
        
        if (result.data) {
          setData(prevData => ({
            ...prevData,
            ...result.data
          }));
          
          if (result.completedSteps) {
            setCompletedSteps(result.completedSteps);
          }
        }
      } catch (error) {
        console.error("Error loading onboarding data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, []);

  const setFormValues = (stepName: keyof OnboardingData, values: any) => {
    setData((prev) => ({
      ...prev,
      [stepName]: values,
    }));
  };

  const updateFormValues = (values: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Informasi Dasar
        return !!data.namaLengkap && !!data.email && !!data.nomorTelepon;
      case 2: // Informasi Lanjutan
        return !!data.tanggalLahir;
      case 3: // Alamat
        return !!data.alamat?.jalan && !!data.alamat?.kota && !!data.alamat?.provinsi && !!data.alamat?.kodePos;
      case 4: // Social Media (optional, so always complete)
        return true;
      case 5: // Upload Foto Profil (optional, so always complete)
        return true;
      case 6: // Level Pengalaman
        return true;
      case 7: // Pengalaman Kerja
        return data.pengalamanKerja.length > 0;
      case 8: // Pendidikan
        return data.pendidikan.length > 0 && 
          data.pendidikan.every(p => !!p.namaInstitusi && !!p.lokasi && !!p.jenjangPendidikan && !!p.tanggalLulus);
      case 9: // Keahlian
        return data.keahlian.length > 0;
      case 10: // Sertifikasi (optional)
        return true;
      case 11: // Bahasa
        return true;
      case 12: // Informasi Tambahan (optional)
        return true;
      case 13: // Ekspektasi Kerja
        return !!data.ekspektasiKerja?.minSalary && 
               !!data.ekspektasiKerja?.idealSalary && 
               !!data.ekspektasiKerja?.willingToTravel && 
               !!data.ekspektasiKerja?.employmentUrgency;
      case 14: // Ringkasan (review)
        return true;
      default:
        return false;
    }
  };

  const getStepValidationErrors = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Informasi Dasar
        if (!data.namaLengkap) errors.namaLengkap = "Nama lengkap wajib diisi";
        if (!data.email) errors.email = "Alamat email wajib diisi";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) 
          errors.email = "Format email tidak valid";
        
        if (!data.nomorTelepon) errors.nomorTelepon = "Nomor telepon wajib diisi";
        else if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(data.nomorTelepon)) 
          errors.nomorTelepon = "Format nomor telepon tidak valid";
        break;
        
      case 2: // Informasi Lanjutan
        if (!data.tanggalLahir) errors.tanggalLahir = "Tanggal lahir wajib diisi";
        
        if (data.beratBadan && (data.beratBadan < 30 || data.beratBadan > 200))
          errors.beratBadan = "Berat badan harus antara 30-200 kg";
        
        if (data.tinggiBadan && (data.tinggiBadan < 100 || data.tinggiBadan > 250))
          errors.tinggiBadan = "Tinggi badan harus antara 100-250 cm";
        break;
        
      case 3: // Alamat
        if (!data.alamat?.jalan) errors.jalan = "Alamat jalan wajib diisi";
        if (!data.alamat?.rt) errors.rt = "RT wajib diisi";
        if (!data.alamat?.rw) errors.rw = "RW wajib diisi";
        if (!data.alamat?.kelurahan) errors.kelurahan = "Kelurahan wajib diisi";
        if (!data.alamat?.kecamatan) errors.kecamatan = "Kecamatan wajib diisi";
        if (!data.alamat?.kota) errors.kota = "Kota wajib diisi";
        if (!data.alamat?.provinsi) errors.provinsi = "Provinsi wajib diisi";
        if (!data.alamat?.kodePos) errors.kodePos = "Kode pos wajib diisi";
        break;
    }
    
    return errors;
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setFormValues,
        updateFormValues,
        currentStep,
        setCurrentStep,
        isStepComplete,
        getStepValidationErrors,
        isLoading,
        completedSteps
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};