import { NextRequest, NextResponse } from "next/server";
import { 
  db, 
  userProfiles, 
  userAddresses, 
  userPengalamanKerja, 
  userPendidikan, 
  updateUserOnboardingStatus,
  getJobSeekerByUserId
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { CustomSession } from "@/lib/types";
import * as z from "zod";
import { invalidateOnboardingCache } from '@/lib/db-edge';

// Define validation schema for the complete onboarding data
const requiredProfileSchema = z.object({
  // Step 1: Informasi Dasar (Required)
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email harus valid"),
  nomorTelepon: z.string().min(1, "Nomor telepon wajib diisi"),
  
  // Step 2: Informasi Lanjutan (Required)
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  jenisKelamin: z.string().nullable().optional(),
  
  // Step 5: Level Pengalaman (Required)
  levelPengalaman: z.string().min(1, "Level pengalaman wajib diisi"),
  
  // Step 8: CV Upload (Required)
  cvFileUrl: z.string().min(1, "CV/Resume wajib diunggah"),
  
  // Optional fields
  profilePhotoUrl: z.string().nullable().optional(),
  ekspektasiKerja: z.any().optional(),
});

// Make all address fields optional based on new requirements
const addressSchema = z.object({
  // Step 3: Alamat (All fields now optional)
  kota: z.string().nullable().optional(),
  provinsi: z.string().nullable().optional(),
  kodePos: z.string().nullable().optional(),
  jalan: z.string().nullable().optional(),
  // Removed fields that aren't in OnboardingContext: rt, rw, kelurahan, kecamatan
});

const pendidikanSchema = z.object({
  // Step 4: Pendidikan (Required)
  namaInstitusi: z.string().min(1, "Nama institusi wajib diisi"),
  jenjangPendidikan: z.string().min(1, "Jenjang pendidikan wajib diisi"),
  bidangStudi: z.string().min(1, "Bidang studi wajib diisi"),
  tanggalLulus: z.string().min(1, "Tanggal lulus wajib diisi"),
  lokasi: z.string().min(1, "Lokasi wajib diisi"),
  // Handle nullable optional fields
  deskripsiTambahan: z.string().nullable().optional(),
  id: z.string().nullable().optional(), // For existing records
});

const pengalamanKerjaSchema = z.object({
  // Step 6: Pengalaman Kerja (Optional)
  levelPengalaman: z.string().nullable().optional(),
  namaPerusahaan: z.string().nullable().optional(),
  posisi: z.string().nullable().optional(),
  tanggalMulai: z.string().nullable().optional(),
  tanggalSelesai: z.string().nullable().optional(),
  deskripsiPekerjaan: z.string().nullable().optional(),
  lokasiKerja: z.string().nullable().optional(),
  lokasi: z.string().nullable().optional(),
  alasanKeluar: z.string().nullable().optional(),
  id: z.string().nullable().optional(), // For existing records
});

// Complete onboarding schema that joins all the above schemas
const completeOnboardingSchema = z.object({
  // Basic profile data
  ...requiredProfileSchema.shape,
  
  // Alamat - now optional object with optional fields
  alamat: addressSchema.optional(),
  
  // Arrays of related data
  pendidikan: z.array(pendidikanSchema).min(1, "Minimal satu pendidikan wajib diisi"),
  pengalamanKerja: z.array(pengalamanKerjaSchema).optional(),
});

/**
 * Validate complete onboarding data
 */
async function validateCompleteOnboarding(data: any): Promise<{
  isValid: boolean;
  errors?: Record<string, string[]>;
}> {
  try {
    // Log the data for debugging
    console.log("Validating data:", JSON.stringify({
      pendidikanCount: data.pendidikan?.length,
      pengalamanKerjaCount: data.pengalamanKerja?.length,
      hasPendidikanDeskripsi: data.pendidikan?.some((p: any) => p.deskripsiTambahan !== undefined),
      hasPengalamanDeskripsi: data.pengalamanKerja?.some((p: any) => p.deskripsiPekerjaan !== undefined),
    }));
    
    // Validate against our schema
    completeOnboardingSchema.parse(data);
    return { isValid: true };
  } catch (error) {
    // Extract validation errors from Zod
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      // Group errors by field path
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
        console.error(`Validation error for ${path}:`, err.message);
      });
      
      return { 
        isValid: false,
        errors: formattedErrors
      };
    }
    
    // Unknown error
    console.error("Unknown validation error:", error);
    return { 
      isValid: false, 
      errors: { '_': ['Validation failed due to an unexpected error'] }
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth() as CustomSession;
    if (!session?.user || session.user.userType !== 'job_seeker') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const data = await req.json();
    console.log("Received data for validation:", JSON.stringify({
      pendidikanCount: data.pendidikan?.length,
      pengalamanKerjaCount: data.pengalamanKerja?.length,
      hasAlamat: !!data.alamat,
    }));
    
    // Standardize data structure to ensure consistency between frontend and backend
    // This helps handle both null and undefined values that might come from the client
    
    // Ensure all optional fields in pendidikan have consistent null values (not undefined)
    if (data.pendidikan) {
      data.pendidikan = data.pendidikan.map((item: any) => ({
        ...item,
        deskripsiTambahan: item.deskripsiTambahan === undefined ? null : item.deskripsiTambahan,
        // We explicitly set nilaiAkhir to null as requested
        nilaiAkhir: null
      }));
    }
    
    // Ensure all optional fields in pengalamanKerja have consistent null values (not undefined)
    if (data.pengalamanKerja) {
      data.pengalamanKerja = data.pengalamanKerja.map((item: any) => ({
        ...item,
        deskripsiPekerjaan: item.deskripsiPekerjaan === undefined ? null : item.deskripsiPekerjaan,
        alasanKeluar: item.alasanKeluar === undefined ? null : item.alasanKeluar,
        lokasiKerja: item.lokasiKerja === undefined ? null : item.lokasiKerja,
        lokasi: item.lokasi === undefined ? null : item.lokasi,
        levelPengalaman: item.levelPengalaman === undefined ? null : item.levelPengalaman
      }));
    }
    
    // Ensure alamat fields have consistent null values (not undefined)
    if (data.alamat) {
      data.alamat = {
        kota: data.alamat.kota === undefined ? null : data.alamat.kota,
        provinsi: data.alamat.provinsi === undefined ? null : data.alamat.provinsi,
        kodePos: data.alamat.kodePos === undefined ? null : data.alamat.kodePos,
        jalan: data.alamat.jalan === undefined ? null : data.alamat.jalan
      };
    }
    
    // Validate complete onboarding data
    const validationResult = await validateCompleteOnboarding(data);
    if (!validationResult.isValid) {
      return NextResponse.json({
        success: false,
        error: "Validation failed",
        errors: validationResult.errors,
        redirectTo: "/job-seeker/onboarding/ringkasan" // Return to summary step to fix issues
      }, { status: 400 });
    }

    const userId = session.user.id as string;

    // Get or create user profile
    let userProfile = await getJobSeekerByUserId(userId);
    
    // Start a transaction to save all data
    return await db.transaction(async (tx) => {
      // 1. Update or create user profile
      if (userProfile) {
        // Update existing profile
        const [updatedProfile] = await tx
          .update(userProfiles)
          .set({
            namaLengkap: data.namaLengkap,
            email: data.email,
            nomorTelepon: data.nomorTelepon,
            tanggalLahir: data.tanggalLahir,
            tempatLahir: data.tempatLahir,
            jenisKelamin: data.jenisKelamin,
            levelPengalaman: data.levelPengalaman,
            cvFileUrl: data.cvFileUrl,
            profilePhotoUrl: data.profilePhotoUrl,
            ekspektasiKerja: data.ekspektasiKerja,
            updatedAt: new Date()
          })
          .where(eq(userProfiles.id, userProfile.id))
          .returning();
        
        userProfile = updatedProfile;
      } else {
        // Create new profile
        const [newProfile] = await tx
          .insert(userProfiles)
          .values({
            userId: userId,
            namaLengkap: data.namaLengkap,
            email: data.email,
            nomorTelepon: data.nomorTelepon,
            tanggalLahir: data.tanggalLahir,
            tempatLahir: data.tempatLahir,
            jenisKelamin: data.jenisKelamin,
            levelPengalaman: data.levelPengalaman,
            cvFileUrl: data.cvFileUrl,
            profilePhotoUrl: data.profilePhotoUrl,
            ekspektasiKerja: data.ekspektasiKerja,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        userProfile = newProfile;
      }

      // 2. Handle address data - only process if alamat object exists
      if (data.alamat) {
        // Delete existing addresses
        await tx
          .delete(userAddresses)
          .where(eq(userAddresses.userProfileId, userProfile.id));
        
        // Insert new address - with only the fields from OnboardingContext
        await tx
          .insert(userAddresses)
          .values({
            userProfileId: userProfile.id,
            jalan: data.alamat.jalan || null,
            kota: data.alamat.kota || null,
            provinsi: data.alamat.provinsi || null,
            kodePos: data.alamat.kodePos || null,
            // Removed rt, rw, kelurahan, kecamatan that aren't in OnboardingContext
            rt: null,
            rw: null,
            kelurahan: null,
            kecamatan: null
          });
      }

      // 3. Handle pendidikan data
      if (Array.isArray(data.pendidikan) && data.pendidikan.length > 0) {
        // Delete existing pendidikan records
        await tx
          .delete(userPendidikan)
          .where(eq(userPendidikan.userProfileId, userProfile.id));
        
        // Insert new pendidikan records
        for (const pendidikan of data.pendidikan) {
          await tx
            .insert(userPendidikan)
            .values({
              userProfileId: userProfile.id,
              namaInstitusi: pendidikan.namaInstitusi,
              jenjangPendidikan: pendidikan.jenjangPendidikan,
              bidangStudi: pendidikan.bidangStudi,
              tanggalLulus: pendidikan.tanggalLulus,
              lokasi: pendidikan.lokasi || null,
              nilaiAkhir: null, // Removed nilaiAkhir as requested
              deskripsiTambahan: pendidikan.deskripsiTambahan || null
            });
        }
      }

      // 4. Handle pengalaman kerja data (optional)
      if (Array.isArray(data.pengalamanKerja) && data.pengalamanKerja.length > 0) {
        // Delete existing pengalaman kerja records
        await tx
          .delete(userPengalamanKerja)
          .where(eq(userPengalamanKerja.userProfileId, userProfile.id));
        
        // Insert new pengalaman kerja records
        for (const pengalaman of data.pengalamanKerja) {
          await tx
            .insert(userPengalamanKerja)
            .values({
              userProfileId: userProfile.id,
              levelPengalaman: pengalaman.levelPengalaman || null,
              namaPerusahaan: pengalaman.namaPerusahaan || null,
              posisi: pengalaman.posisi || null,
              tanggalMulai: pengalaman.tanggalMulai || null,
              tanggalSelesai: pengalaman.tanggalSelesai || null,
              deskripsiPekerjaan: pengalaman.deskripsiPekerjaan || null,
              lokasiKerja: pengalaman.lokasiKerja || null,
              lokasi: pengalaman.lokasi || null,
              alasanKeluar: pengalaman.alasanKeluar || null
            });
        }
      }

      // 5. Mark user's onboarding as complete
      await updateUserOnboardingStatus(userId, true);
      
      // 6. Immediately invalidate the onboarding status cache to prevent stale data
      invalidateOnboardingCache(userId, 'job_seeker');

      return NextResponse.json({ 
        success: true,
        message: "Onboarding completed successfully",
        profileId: userProfile.id,
        redirectUrl: "/job-seeker/dashboard" // Provide redirect URL for client
      });
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json({ 
      error: "Failed to complete onboarding",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 
