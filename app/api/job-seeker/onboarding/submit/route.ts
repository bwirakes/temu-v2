import { NextRequest, NextResponse } from "next/server";
import { 
  db, 
  userProfiles, 
  userAddresses, 
  userPengalamanKerja, 
  userPendidikan, 
  updateUserOnboardingStatus,
  getJobSeekerByUserId,
  levelPengalamanEnum,
  lokasiKerjaEnum
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { CustomSession } from "@/lib/types";
import * as z from "zod";
import { invalidateOnboardingCache } from '@/lib/db-edge';
import crypto from "crypto";
import { OnboardingData } from "@/lib/db-types";

/**
 * Gets the current authenticated user from the session
 * @returns The user object if authenticated, null otherwise
 */
async function getSessionUser() {
  const session = await auth() as CustomSession;
  return session?.user || null;
}

// Define validation schema for the complete onboarding data
const requiredProfileSchema = z.object({
  // Step 1: Informasi Dasar (Required)
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Email harus valid"),
  nomorTelepon: z.string().min(1, "Nomor telepon wajib diisi"),
  
  // Step 2: Informasi Lanjutan (Required)
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  tempatLahir: z.string().nullable().optional(),
  jenisKelamin: z.string().nullable().optional(),
  
  // Step 4: Level Pengalaman (Required)
  levelPengalaman: z.enum(['LULUSAN_BARU', 'SATU_DUA_TAHUN', 'TIGA_LIMA_TAHUN', 'LIMA_SEPULUH_TAHUN', 'LEBIH_SEPULUH_TAHUN']),
  
  // Step 7: CV Upload (Required)
  cvFileUrl: z.string().min(1, "CV/Resume wajib diunggah"),
  
  // Optional fields
  profilePhotoUrl: z.string().nullable().optional(),
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
  id: z.string(),  // Ensure this field is required to match the Pendidikan type
  namaInstitusi: z.string().optional(),
  jenjangPendidikan: z.string().min(1, "Jenjang pendidikan wajib diisi"),
  bidangStudi: z.string().nullable().optional(),
  tanggalLulus: z.string().optional(),
  lokasi: z.string().optional(),
  // Remove deskripsiTambahan field completely from validation
  // Remove nilaiAkhir field
});

const pengalamanKerjaSchema = z.object({
  // Step 6: Pengalaman Kerja (Optional)
  levelPengalaman: z.string().nullable().optional(),
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  posisi: z.string().min(1, "Posisi wajib diisi"),
  tanggalMulai: z.string().min(1, "Tanggal mulai kerja wajib diisi"),
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
  
  // Alamat - now optional object with optional fields that can be null
  alamat: addressSchema.nullable().optional(),
  
  // Arrays of related data
  pendidikan: z.array(pendidikanSchema).optional(),
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
      pendidikanFields: data.pendidikan?.[0] ? Object.keys(data.pendidikan[0]) : [],
      tempatLahir: data.tempatLahir === null ? "is null" : (data.tempatLahir === undefined ? "is undefined" : "has value"),
      hasAlamat: !!data.alamat,
      alamatFields: data.alamat ? Object.keys(data.alamat) : []
    }));
    
    // Check for and remove deskripsiTambahan if it exists before validation
    if (data.pendidikan?.length > 0) {
      data.pendidikan = data.pendidikan.map((item: any) => {
        // Remove deskripsiTambahan and nilaiAkhir if they exist
        const { deskripsiTambahan, nilaiAkhir, ...rest } = item;
        return rest;
      });
    }
    
    // Ensure alamat is properly formatted
    if (data.alamat && typeof data.alamat === 'object') {
      // Keep only the fields defined in addressSchema
      data.alamat = {
        kota: data.alamat.kota || null,
        provinsi: data.alamat.provinsi || null,
        kodePos: data.alamat.kodePos || null,
        jalan: data.alamat.jalan || null
      };
    }
    
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

/**
 * Standardize onboarding data from client for storage
 */
function standardizeOnboardingData(data: any): OnboardingData {
  // Sanitize and standardize the onboarding data
  const standardized = {
    ...data,
    // Ensure pendidikan is correctly formatted
    pendidikan: data.pendidikan?.map((p: any) => ({
      id: p.id || crypto.randomUUID(),
      namaInstitusi: p.namaInstitusi || null,
      lokasi: p.lokasi || null,
      jenjangPendidikan: p.jenjangPendidikan,
      bidangStudi: p.bidangStudi || '',
      tanggalLulus: p.tanggalLulus || null,
      tidakLulus: p.tidakLulus || false,
      // Explicitly setting these to null, ensuring they're removed
      nilaiAkhir: null,
      deskripsiTambahan: null
    })) || [],
    
    // Ensure pengalamanKerja is correctly formatted
    pengalamanKerja: data.pengalamanKerja?.map((p: any) => ({
      id: p.id || crypto.randomUUID(),
      namaPerusahaan: p.namaPerusahaan || '',
      posisi: p.posisi || '',
      tanggalMulai: p.tanggalMulai || '',
      tanggalSelesai: p.tanggalSelesai || '',
      deskripsiPekerjaan: p.deskripsiPekerjaan || null,
      lokasiKerja: p.lokasiKerja || null,
      lokasi: p.lokasi || null,
      gajiTerakhir: p.gajiTerakhir || null,
      alasanKeluar: p.alasanKeluar || null,
      levelPengalaman: p.levelPengalaman || null
    })) || [],
    
    // Normalize other fields
    tempatLahir: data.tempatLahir || null,
    
    // Properly handle alamat object - can be null, undefined, or an object with nullable fields
    alamat: data.alamat ? {
      kota: data.alamat.kota || null,
      provinsi: data.alamat.provinsi || null,
      kodePos: data.alamat.kodePos || null,
      jalan: data.alamat.jalan || null
    } : null
  };
  
  // Log standardized data for debugging
  console.log("hasAlamat:", !!standardized.alamat);
  
  return standardized;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to submit onboarding data" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const rawData = await req.json();
    
    // Standardize data before validation
    const standardizedData = standardizeOnboardingData(rawData);
    
    // Log the data for debugging
    console.log("Validating standardized data:", JSON.stringify({
      pendidikanCount: standardizedData.pendidikan?.length,
      pengalamanKerjaCount: standardizedData.pengalamanKerja?.length,
      pendidikanFields: standardizedData.pendidikan?.[0] ? Object.keys(standardizedData.pendidikan[0]) : [],
      tempatLahir: standardizedData.tempatLahir === null ? "is null" : (standardizedData.tempatLahir === undefined ? "is undefined" : "has value"),
      hasAlamat: !!standardizedData.alamat,
    }));
    
    // Validate the data against our schema
    const validationResult = await validateCompleteOnboarding(standardizedData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          error: "ValidationError", 
          message: "Invalid onboarding data", 
          validationErrors: validationResult.errors 
        },
        { status: 400 }
      );
    }

    const userId = user.id as string;

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
            namaLengkap: standardizedData.namaLengkap,
            email: standardizedData.email,
            nomorTelepon: standardizedData.nomorTelepon,
            tanggalLahir: standardizedData.tanggalLahir,
            tempatLahir: standardizedData.tempatLahir, // Can be null now
            jenisKelamin: standardizedData.jenisKelamin,
            levelPengalaman: standardizedData.levelPengalaman,
            cvFileUrl: standardizedData.cvFileUrl,
            profilePhotoUrl: standardizedData.profilePhotoUrl,
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
            namaLengkap: standardizedData.namaLengkap,
            email: standardizedData.email,
            nomorTelepon: standardizedData.nomorTelepon,
            tanggalLahir: standardizedData.tanggalLahir,
            tempatLahir: standardizedData.tempatLahir, // Can be null now
            jenisKelamin: standardizedData.jenisKelamin,
            levelPengalaman: standardizedData.levelPengalaman,
            cvFileUrl: standardizedData.cvFileUrl,
            profilePhotoUrl: standardizedData.profilePhotoUrl,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        userProfile = newProfile;
      }

      // 2. Handle address data - only process if alamat object exists
      if (standardizedData.alamat) {
        // Delete existing addresses
        await tx
          .delete(userAddresses)
          .where(eq(userAddresses.userProfileId, userProfile.id));
        
        // Insert new address - with only the fields from OnboardingContext
        await tx
          .insert(userAddresses)
          .values({
            userProfileId: userProfile.id,
            jalan: standardizedData.alamat.jalan || null,
            kota: standardizedData.alamat.kota || null,
            provinsi: standardizedData.alamat.provinsi || null,
            kodePos: standardizedData.alamat.kodePos || null,
            // Explicitly set these fields to null
            rt: null,
            rw: null,
            kelurahan: null,
            kecamatan: null
          });
      }

      // 3. Handle pendidikan data
      if (Array.isArray(standardizedData.pendidikan) && standardizedData.pendidikan.length > 0) {
        // Delete existing pendidikan records
        await tx
          .delete(userPendidikan)
          .where(eq(userPendidikan.userProfileId, userProfile.id));
        
        // Insert new pendidikan records
        for (const pendidikan of standardizedData.pendidikan) {
          // Ensure no deskripsiTambahan or nilaiAkhir is passed
          const { deskripsiTambahan, nilaiAkhir, ...cleanPendidikan } = pendidikan;
          
          await tx
            .insert(userPendidikan)
            .values({
              userProfileId: userProfile.id,
              namaInstitusi: cleanPendidikan.namaInstitusi || null,
              jenjangPendidikan: cleanPendidikan.jenjangPendidikan,
              bidangStudi: cleanPendidikan.bidangStudi || "",
              tanggalLulus: cleanPendidikan.tanggalLulus || null,
              lokasi: cleanPendidikan.lokasi || null,
              nilaiAkhir: null, // Explicitly set to null as requested
              deskripsiTambahan: null, // Explicitly set to null as requested
              tidakLulus: cleanPendidikan.tidakLulus || false // Default value
            });
        }
      }

      // 4. Handle pengalaman kerja data (optional)
      if (Array.isArray(standardizedData.pengalamanKerja) && standardizedData.pengalamanKerja.length > 0) {
        // Delete existing pengalaman kerja records
        await tx
          .delete(userPengalamanKerja)
          .where(eq(userPengalamanKerja.userProfileId, userProfile.id));
        
        // Insert new pengalaman kerja records
        for (const pengalaman of standardizedData.pengalamanKerja) {
          // Map to a valid levelPengalamanEnum value
          // Default to one of the valid enum values
          let levelPengalamanValue: typeof levelPengalamanEnum.enumValues[number] = "Kurang dari 1 tahun";
          
          // Map from MinWorkExperienceEnum to levelPengalamanEnum if possible
          if (pengalaman.levelPengalaman) {
            switch(pengalaman.levelPengalaman) {
              case "LULUSAN_BARU":
                levelPengalamanValue = "Baru lulus";
                break;
              case "SATU_DUA_TAHUN":
                levelPengalamanValue = "1-2 tahun";
                break;
              case "TIGA_LIMA_TAHUN":
                levelPengalamanValue = "3-5 tahun";
                break;
              case "LIMA_SEPULUH_TAHUN":
                levelPengalamanValue = "5-10 tahun";
                break;
              case "LEBIH_SEPULUH_TAHUN":
                levelPengalamanValue = "10 tahun lebih";
                break;
            }
          }
          
          // Convert lokasiKerja to a valid enum value if present
          const lokasiKerjaValue = pengalaman.lokasiKerja as typeof lokasiKerjaEnum.enumValues[number] || null;

          await tx
            .insert(userPengalamanKerja)
            .values({
              userProfileId: userProfile.id,
              levelPengalaman: levelPengalamanValue,
              namaPerusahaan: pengalaman.namaPerusahaan || "",
              posisi: pengalaman.posisi || "",
              tanggalMulai: pengalaman.tanggalMulai || "",
              tanggalSelesai: pengalaman.tanggalSelesai || "",
              deskripsiPekerjaan: pengalaman.deskripsiPekerjaan || null,
              lokasiKerja: lokasiKerjaValue,
              lokasi: pengalaman.lokasi || null,
              alasanKeluar: pengalaman.alasanKeluar || null,
            });
        }
      }

      // 5. Mark user's onboarding as complete
      await updateUserOnboardingStatus(userId, true);
      
      // 6. Immediately invalidate the onboarding status cache to prevent stale data
      await invalidateOnboardingCache(userId, 'job_seeker');

      // Return the success response with cache headers to ensure fresh data
      return NextResponse.json({ 
        success: true,
        message: "Onboarding completed successfully",
        profileId: userProfile.id,
        redirectUrl: "/job-seeker/dashboard" // Provide redirect URL for client
      }, {
        status: 200,
        headers: {
          // Add cache control headers to prevent caching of this response
          'Cache-Control': 'no-store, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json({ 
      error: "Failed to complete onboarding",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache',
      }
    });
  }
} 
