import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as z from "zod";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfileByUserId,
  db,
  getJobSeekerByUserId,
  getJobSeekerOnboardingStatus
} from "@/lib/db-server";
import { eq } from "drizzle-orm";
import { userAddresses, userPengalamanKerja, userPendidikan, jenisKelaminEnum } from "@/lib/db-types";
import { CustomSession } from '@/lib/types';

// Schema for validation
const onboardingSchema = z.object({
  step: z.number(),
  data: z.record(z.unknown())
});

// Required fields for each step
const REQUIRED_FIELDS = {
  1: ['namaLengkap', 'email', 'nomorTelepon'],
  2: ['tanggalLahir', 'tempatLahir'],
  3: ['pendidikan'],
  4: ['levelPengalaman'],
  5: [], // Pengalaman Kerja - Optional
  6: ['cvFileUrl'], // CV Upload - Now required
  7: [], // Profile Photo - Optional
  8: []  // Summary
};

// Check if the data has all required fields for a specific step
function hasRequiredFields(data: Record<string, any>, step: number): boolean {
  const requiredFields = REQUIRED_FIELDS[step as keyof typeof REQUIRED_FIELDS];
  
  // If no required fields for this step, return true
  if (!requiredFields || requiredFields.length === 0) {
    return true;
  }
  
  return requiredFields.every(field => {
    if (field.includes('.')) {
      // Handle nested fields like alamat.kota
      const [parent, child] = field.split('.');
      return data[parent] && typeof data[parent][child] === 'string' && data[parent][child].trim() !== '';
    } else if (field === 'pendidikan') {
      // Special case for pendidikan which is an array
      return Array.isArray(data[field]) && data[field].length > 0 && 
        data[field].every((p: any) => 
          p.jenjangPendidikan
        );
    }
    
    // Handle regular fields
    return typeof data[field] === 'string' && data[field].trim() !== '';
  });
}

// Determine the next step to show based on completion
function determineNextStep(allData: Record<string, any>, currentStep: number): number {
  // If the current step is Step 1 (Informasi Dasar), and it's complete,
  // proceed to Step 2 regardless of other steps' completion
  if (currentStep === 1 && hasRequiredFields(allData, 1)) {
    return 2;
  }
  
  // If current step is incomplete and it's a required step (1-5), stay on current step
  if (!hasRequiredFields(allData, currentStep) && currentStep <= 5) {
    return currentStep;
  }
  
  // If we're at the final step, stay there
  if (currentStep >= 8) {
    return 8;
  }
  
  // Standard progression: move to the next step
  if (currentStep < 8) {
    return currentStep + 1;
  }
  
  // Default fallback: if something unexpected happens, find the first incomplete required step
  for (let i = 1; i <= 5; i++) {
    if (!hasRequiredFields(allData, i)) {
      return i;
    }
  }
  
  // If all required steps are complete, go to next step
  return currentStep + 1;
}

/**
 * GET handler for retrieving all onboarding data
 * Purpose: To pre-fill the entire onboarding form with existing data
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated and has the correct role
    if (!session || !session.user || session.user.userType !== 'job_seeker') {
      return NextResponse.json({ 
        error: "Unauthorized: Only job seekers can access this endpoint" 
      }, { status: 403 });
    }
    
    // Get the user ID from the session
    const userId = session.user.id as string;
    
    // Get the user profile
    const userProfile = await getJobSeekerByUserId(userId);
    if (!userProfile) {
      // Return empty data structure if no profile exists yet
      return NextResponse.json({ 
        data: {
          namaLengkap: "",
          email: "",
          nomorTelepon: "",
          tanggalLahir: "",
          tempatLahir: "",
          jenisKelamin: undefined,
          cvFileUrl: "",
          profilePhotoUrl: "",
          levelPengalaman: "",
          alamat: {},
          pengalamanKerja: [],
          pendidikan: [],
          ekspektasiKerja: {}
        }
      });
    }
    
    // Fetch all user information from various tables
    const formattedData = await fetchAndFormatJobSeekerData(userProfile);
    
    return NextResponse.json({ 
      data: formattedData
    });
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch data",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * Fetches and formats job seeker data from various tables
 */
async function fetchAndFormatJobSeekerData(userProfile: any) {
  if (!userProfile) {
    return {
      namaLengkap: "",
      email: "",
      nomorTelepon: "",
      tanggalLahir: "",
      tempatLahir: "",
      jenisKelamin: undefined,
      cvFileUrl: "",
      profilePhotoUrl: "",
      levelPengalaman: "",
      alamat: {},
      pengalamanKerja: [],
      pendidikan: []
    };
  }

  // Get all related data
  const [
    addresses,
    pengalamanKerja,
    pendidikan
  ] = await Promise.all([
    db.select().from(userAddresses).where(eq(userAddresses.userProfileId, userProfile.id)),
    db.select().from(userPengalamanKerja).where(eq(userPengalamanKerja.userProfileId, userProfile.id)),
    db.select().from(userPendidikan).where(eq(userPendidikan.userProfileId, userProfile.id))
  ]);

  // Format data to match OnboardingContext structure
  return {
    namaLengkap: userProfile.namaLengkap || "",
    email: userProfile.email || "",
    nomorTelepon: userProfile.nomorTelepon || "",
    tanggalLahir: userProfile.tanggalLahir || "",
    tempatLahir: userProfile.tempatLahir || "", 
    jenisKelamin: userProfile.jenisKelamin || undefined,
    cvFileUrl: userProfile.cvFileUrl || "", 
    profilePhotoUrl: userProfile.profilePhotoUrl || "", 
    levelPengalaman: userProfile.levelPengalaman || "", 
    
    alamat: addresses[0] ? {
      jalan: addresses[0].jalan || "",
      kota: addresses[0].kota || "",
      provinsi: addresses[0].provinsi || "",
      kodePos: addresses[0].kodePos || "",
      rt: addresses[0].rt || "",
      rw: addresses[0].rw || "",
      kelurahan: addresses[0].kelurahan || "",
      kecamatan: addresses[0].kecamatan || ""
    } : {},
    
    pengalamanKerja: pengalamanKerja.map(p => ({
      id: p.id,
      levelPengalaman: p.levelPengalaman,
      namaPerusahaan: p.namaPerusahaan,
      posisi: p.posisi,
      tanggalMulai: p.tanggalMulai,
      tanggalSelesai: p.tanggalSelesai,
      deskripsiPekerjaan: p.deskripsiPekerjaan || null,
      lokasiKerja: p.lokasiKerja || null,
      lokasi: p.lokasi || null,
      alasanKeluar: p.alasanKeluar || null,
    })),
    
    pendidikan: pendidikan.map(p => ({
      id: p.id,
      namaInstitusi: p.namaInstitusi,
      jenjangPendidikan: p.jenjangPendidikan,
      bidangStudi: p.bidangStudi,
      tanggalLulus: p.tanggalLulus,
      lokasi: p.lokasi || null,
      nilaiAkhir: p.nilaiAkhir || null,
      deskripsiTambahan: p.deskripsiTambahan || null,
    }))
  };
} 