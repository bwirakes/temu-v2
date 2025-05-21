'use server';

import { getUserProfileByUserId, getUserPendidikanByProfileId, getUserPengalamanKerjaByProfileId } from "@/lib/db";
import { redirect } from "next/navigation";
import { getJobSeekerSession } from "@/lib/auth-utils";

// Define types for the profile data and its related entities
export type Pendidikan = {
  id: string;
  namaInstitusi: string;
  lokasi: string;
  jenjangPendidikan: string;
  bidangStudi: string;
  tanggalLulus: string;
  deskripsiTambahan?: string;
  masihBelajar: boolean;
};

export type LokasiKerjaType = "Work From Office (WFO)" | "Work From Home (WFH)" | "Hybrid";

export type PengalamanKerja = {
  id: string;
  namaPerusahaan: string;
  posisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
  lokasiKerja: LokasiKerjaType;
  deskripsiPekerjaan: string;
  alasanKeluar?: string;
  masihBekerja: boolean;
};

export interface ProfileData {
  id: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tanggalLahir: string;
  tempatLahir?: string | null;
  jenisKelamin?: string | null;
  cvFileUrl?: string | null;
  cvUploadDate?: string | Date | null;
  profilePhotoUrl?: string | null;
  levelPengalaman?: string | null;
  alamat?: any;
  pendidikan?: Pendidikan[];
  pengalamanKerja?: PengalamanKerja[];
}

/**
 * Server action to fetch profile data for the authenticated user
 * This handles auth checks and data fetching in a server context
 */
export async function getProfileData(): Promise<ProfileData | null> {
  try {
    // Get typed session for job seeker (throws error if not authenticated or wrong user type)
    const session = await getJobSeekerSession();
    
    // Ensure user is available (should always be true after getJobSeekerSession)
    if (!session.user || !session.user.id) {
      redirect("/auth/signin");
    }
    
    // Get profile data using the server-side function
    const profileData = await getUserProfileByUserId(session.user.id);
    
    if (!profileData) {
      return null;
    }
    
    // Fetch related data
    const pendidikanFromDb = await getUserPendidikanByProfileId(profileData.id);
    const pengalamanKerjaFromDb = await getUserPengalamanKerjaByProfileId(profileData.id);
    
    // Format dates if needed (cvUploadDate is sometimes returned in different formats)
    let cvUploadDate = profileData.cvUploadDate;
    if (cvUploadDate && !(cvUploadDate instanceof Date)) {
      cvUploadDate = new Date(cvUploadDate);
    }
    
    // Map the database pendidikan to the expected Pendidikan type
    const mappedPendidikan: Pendidikan[] = pendidikanFromDb.map(p => ({
      id: p.id,
      namaInstitusi: p.namaInstitusi ?? '',
      lokasi: p.lokasi || '',
      jenjangPendidikan: p.jenjangPendidikan,
      bidangStudi: p.bidangStudi ?? '',
      tanggalLulus: p.tanggalLulus ?? '',
      deskripsiTambahan: p.deskripsiTambahan || undefined,
      masihBelajar: p.tidakLulus || false
    }));
    
    // Map the database pengalaman kerja to the expected PengalamanKerja type
    const mappedPengalamanKerja: PengalamanKerja[] = pengalamanKerjaFromDb.map(p => ({
      id: p.id,
      namaPerusahaan: p.namaPerusahaan,
      posisi: p.posisi,
      tanggalMulai: p.tanggalMulai,
      tanggalSelesai: p.tanggalSelesai,
      lokasi: p.lokasi || '',
      lokasiKerja: p.lokasiKerja === 'WFH' ? 'Work From Home (WFH)' :
                  p.lokasiKerja === 'WFO' ? 'Work From Office (WFO)' : 'Hybrid',
      deskripsiPekerjaan: p.deskripsiPekerjaan || '',
      alasanKeluar: p.alasanKeluar || undefined,
      masihBekerja: p.tanggalSelesai === 'Sekarang'
    }));
    
    // Combine data into the complete profile
    const completeProfile: ProfileData = {
      id: profileData.id,
      namaLengkap: profileData.namaLengkap,
      email: profileData.email,
      nomorTelepon: profileData.nomorTelepon,
      tanggalLahir: profileData.tanggalLahir,
      tempatLahir: profileData.tempatLahir,
      jenisKelamin: profileData.jenisKelamin,
      cvFileUrl: profileData.cvFileUrl,
      cvUploadDate: cvUploadDate,
      profilePhotoUrl: profileData.profilePhotoUrl,
      levelPengalaman: profileData.levelPengalaman,
      pendidikan: mappedPendidikan,
      pengalamanKerja: mappedPengalamanKerja
    };
    
    return completeProfile;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    
    // Redirect to sign-in page if authentication error
    if (error instanceof Error && error.message.includes('Authentication required')) {
      redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/job-seeker/profile")}`);
    }
    
    // Redirect to home page if user type error
    if (error instanceof Error && error.message.includes('Only job seekers')) {
      console.log('Profile page: Non-job-seeker attempting to access profile, redirecting');
      redirect("/");
    }
    
    return null;
  }
} 