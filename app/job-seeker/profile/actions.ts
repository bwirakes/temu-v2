'use server';

import { getUserProfileByUserId } from "@/lib/db";
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
  ekspektasiKerja?: any;
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
    return profileData;
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