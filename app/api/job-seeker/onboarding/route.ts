import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as z from "zod";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfileByUserId,
  db,
  userAddresses,
  userPengalamanKerja,
  userPendidikan,
  jenisKelaminEnum
} from "@/lib/db";
import { eq } from "drizzle-orm";
import { getJobSeekerByUserId, getJobSeekerOnboardingStatus } from '@/lib/db';
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
  3: ['alamat.kota'],
  4: ['pendidikan'],
  5: ['levelPengalaman'],
  6: [], // Optional
  7: [], // Optional
  8: [], // Optional
  9: [], // Optional
  10: []  // Summary
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
          p.namaInstitusi && 
          p.lokasi && 
          p.jenjangPendidikan && 
          p.bidangStudi && 
          p.tanggalLulus
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
  if (currentStep >= 10) {
    return 10;
  }
  
  // Standard progression: move to the next step
  if (currentStep < 10) {
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
 * POST handler for saving onboarding data incrementally
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth() as CustomSession;
    if (!session?.user || session.user.userType !== 'job_seeker') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
      onboardingSchema.parse(body);
    } catch (parseError) {
      console.error("Request body parsing error:", parseError);
      return NextResponse.json({ 
        error: "Invalid request data", 
        message: parseError instanceof Error ? parseError.message : "Failed to parse request body"
      }, { status: 400 });
    }

    const { step, data } = body;
    const userId = session.user.id as string;

    // Get or create user profile
    let userProfile = await getJobSeekerByUserId(userId);
    
    if (!userProfile) {
      try {
        // If this is the first step (informasi dasar), use the provided data
        if (step === 1 && data.namaLengkap && data.email && data.nomorTelepon) {
          // Create profile with data from the current form submission
          userProfile = await createUserProfile({
            userId: userId,
            namaLengkap: data.namaLengkap as string,
            email: data.email as string,
            nomorTelepon: data.nomorTelepon as string,
            tanggalLahir: "1900-01-01" // Placeholder value that will be updated later
          });
        } else {
          // For any other step, create with session data as fallback
          userProfile = await createUserProfile({
            userId: userId,
            namaLengkap: session.user.name || "User",
            email: session.user.email || "user@example.com",
            nomorTelepon: data.nomorTelepon as string || "081234567890", // Try to use provided nomorTelepon if available
            tanggalLahir: "1900-01-01" // Placeholder value
          });
        }
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        
        // Handle the case where profile creation fails
        return NextResponse.json({ 
          error: "Failed to create user profile", 
          message: "Please complete step 1 (Informasi Dasar) first to create your profile."
        }, { status: 400 });
      }
    }

    // Process data based on step
    try {
      switch (step) {
        case 1: // Informasi Dasar
          // Validate only Step 1 required fields
          if (!data.namaLengkap || !data.email || !data.nomorTelepon) {
            return NextResponse.json({ 
              error: "validation_failed", 
              message: "Nama lengkap, email, dan nomor telepon wajib diisi" 
            }, { status: 400 });
          }
          
          const updateDataStep1: Record<string, any> = {
            namaLengkap: data.namaLengkap as string,
            email: data.email as string,
            nomorTelepon: data.nomorTelepon as string,
          };
          
          await updateUserProfile(userProfile.id, updateDataStep1);
          break;

        case 2: // Informasi Lanjutan
          // Validate only Step 2 required fields
          if (!data.tanggalLahir || !data.tempatLahir) {
            return NextResponse.json({ 
              error: "validation_failed", 
              message: "Tanggal lahir dan tempat lahir wajib diisi" 
            }, { status: 400 });
          }
          
          const updateDataStep2: Record<string, any> = {};
          
          if (data.tanggalLahir) {
            updateDataStep2.tanggalLahir = data.tanggalLahir as string;
          }
          if (data.tempatLahir) {
            updateDataStep2.tempatLahir = data.tempatLahir as string;
          }
          if (data.jenisKelamin) {
            updateDataStep2.jenisKelamin = data.jenisKelamin as any;
          }

          await updateUserProfile(userProfile.id, updateDataStep2);
          break;

        case 3: // Alamat
          // Validate Step 3 required fields
          if (!data.alamat || !data.alamat.kota) {
            return NextResponse.json({ 
              error: "validation_failed", 
              message: "Kota wajib diisi" 
            }, { status: 400 });
          }
          
          if (data.alamat) {
            // Delete existing address
            await db.delete(userAddresses).where(eq(userAddresses.userProfileId, userProfile.id));
            
            const alamatData = data.alamat as Record<string, any>;
            
            // Create new address with type-safe approach
            const addressValues: Record<string, any> = {
              userProfileId: userProfile.id,
              jalan: alamatData.jalan || null,
              kota: alamatData.kota || null,
              provinsi: alamatData.provinsi || null,
              kodePos: alamatData.kodePos || null,
            };
            
            // Add optional fields if they exist
            if (alamatData.rt) addressValues.rt = alamatData.rt;
            if (alamatData.rw) addressValues.rw = alamatData.rw;
            if (alamatData.kelurahan) addressValues.kelurahan = alamatData.kelurahan;
            if (alamatData.kecamatan) addressValues.kecamatan = alamatData.kecamatan;
            
            await db.insert(userAddresses).values(addressValues as any);
          }
          break;

        case 4: // Pendidikan
          // Validate Step 4 required fields 
          if (!Array.isArray(data.pendidikan) || data.pendidikan.length === 0 || 
              !data.pendidikan.every((p: any) => 
                p.namaInstitusi && 
                p.lokasi && 
                p.jenjangPendidikan && 
                p.bidangStudi && 
                p.tanggalLulus
              )) {
            return NextResponse.json({ 
              error: "validation_failed", 
              message: "Minimal satu pendidikan dengan data lengkap wajib diisi" 
            }, { status: 400 });
          }
          
          if (Array.isArray(data.pendidikan)) {
            // Delete existing pendidikan
            await db.delete(userPendidikan).where(eq(userPendidikan.userProfileId, userProfile.id));
            
            // Create new pendidikan entries
            for (const pendidikan of data.pendidikan as any[]) {
              await db.insert(userPendidikan).values({
                userProfileId: userProfile.id,
                namaInstitusi: pendidikan.namaInstitusi,
                jenjangPendidikan: pendidikan.jenjangPendidikan,
                bidangStudi: pendidikan.bidangStudi,
                tanggalLulus: pendidikan.tanggalLulus,
                lokasi: pendidikan.lokasi || null,
                nilaiAkhir: pendidikan.nilaiAkhir || null,
                deskripsiTambahan: pendidikan.deskripsiTambahan || null
              });
            }
          }
          break;

        case 5: // Level Pengalaman
          // Validate Step 5 required fields
          if (!data.levelPengalaman) {
            return NextResponse.json({ 
              error: "validation_failed", 
              message: "Level pengalaman wajib diisi" 
            }, { status: 400 });
          }
          
          if (data.levelPengalaman) {
            await updateUserProfile(userProfile.id, {
              levelPengalaman: data.levelPengalaman
            });
          }
          break;

        case 6: // Pengalaman Kerja - Optional
          // Optional step - no validation required
          if (Array.isArray(data.pengalamanKerja)) {
            // Delete existing pengalaman kerja
            await db.delete(userPengalamanKerja).where(eq(userPengalamanKerja.userProfileId, userProfile.id));
            
            // Create new pengalaman kerja entries
            for (const pengalaman of data.pengalamanKerja as any[]) {
              const pengalamanValues: Record<string, any> = {
                userProfileId: userProfile.id,
                levelPengalaman: pengalaman.levelPengalaman,
                namaPerusahaan: pengalaman.namaPerusahaan,
                posisi: pengalaman.posisi,
                tanggalMulai: pengalaman.tanggalMulai,
                tanggalSelesai: pengalaman.tanggalSelesai,
                deskripsiPekerjaan: pengalaman.deskripsiPekerjaan || null,
                lokasiKerja: pengalaman.lokasiKerja || null,
                lokasi: pengalaman.lokasi || null,
                alasanKeluar: pengalaman.alasanKeluar || null,
              };
              
              // Add optional fields if they exist
              if (pengalaman.gajiTerakhir) {
                pengalamanValues.gajiTerakhir = pengalaman.gajiTerakhir;
              }
              
              await db.insert(userPengalamanKerja).values(pengalamanValues as any);
            }
          }
          break;

        case 7: // Ekspektasi Kerja - Optional
          // Optional step - no validation required
          if (data.ekspektasiKerja) {
            const ekspektasiData = data.ekspektasiKerja as Record<string, any>;
            
            // Ensure idealSalary is properly converted to a number
            const idealSalary = ekspektasiData.idealSalary 
              ? (typeof ekspektasiData.idealSalary === 'string' 
                ? parseInt(ekspektasiData.idealSalary, 10) 
                : Number(ekspektasiData.idealSalary)) 
              : null;
            
            // Create a properly structured object to save
            const ekspektasiKerjaToSave = {
              jobTypes: ekspektasiData.jobTypes || null,
              idealSalary: idealSalary,
              willingToTravel: ekspektasiData.willingToTravel || null,
              preferensiLokasiKerja: ekspektasiData.preferensiLokasiKerja || null
            };
            
            console.log('Saving ekspektasiKerja:', JSON.stringify(ekspektasiKerjaToSave));
            
            // Store ekspektasi kerja directly as JSONB in user profile
            await updateUserProfile(userProfile.id, {
              ekspektasiKerja: ekspektasiKerjaToSave
            });
          }
          break;

        case 8: // CV Upload - Optional
          // Optional step - no validation required
          if (data.cvFileUrl) {
            // Store CV URL in user profile
            await updateUserProfile(userProfile.id, {
              cvFileUrl: data.cvFileUrl as string,
              cvUploadDate: new Date()
            });
          }
          break;

        case 9: // Profile Photo Upload - Optional
          // Optional step - no validation required
          if (data.profilePhotoUrl) {
            // Store profile photo URL in user profile
            await updateUserProfile(userProfile.id, {
              profilePhotoUrl: data.profilePhotoUrl
            });
          }
          break;

        default:
          // No need to throw error for unknown step, just log it
          console.warn(`Unknown onboarding step: ${step}`);
          break;
      }

      // Get the updated user profile to prepare proper response
      const updatedUserProfile = await getJobSeekerByUserId(userId);
      if (!updatedUserProfile) {
        throw new Error("Failed to retrieve updated profile");
      }
      
      // Gather all the user data after the update
      const formattedData = await fetchAndFormatJobSeekerData(updatedUserProfile);
      
      // Calculate completed steps based on the updated data
      const completedSteps = await calculateCompletedSteps(formattedData, updatedUserProfile.id);
      
      // Determine the next step 
      let nextStep: number = 1; // Default to first step if no other is found
      
      // Get current status from central function for consistency
      const onboardingStatus = await getJobSeekerOnboardingStatus(userId);
      
      if (onboardingStatus.completed) {
        // If onboarding is complete, go to summary step
        nextStep = 10;
      } else {
        // Use the next logical step based on completed steps
        // This ensures we don't direct users to already completed steps
        for (let i = 1; i <= 9; i++) {
          if (!completedSteps.includes(i)) {
            nextStep = i;
            break;
          }
        }
        
        // If all steps are complete (shouldn't happen if onboardingStatus.completed was false)
        if (!nextStep) {
          nextStep = 10;
        }
      }
      
      console.log(`POST onboarding returning nextStep: ${nextStep}, completedSteps:`, completedSteps);
      
      return NextResponse.json({ 
        success: true, 
        nextStep,
        completedSteps
      });
    } catch (error) {
      console.error("Error processing onboarding step data:", error);
      return NextResponse.json({ error: "Failed to process data" }, { status: 500 });
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ 
      error: "An error occurred", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

/**
 * GET handler for retrieving all onboarding data
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
      return NextResponse.json({ 
        error: "User profile not found" 
      }, { status: 404 });
    }
    
    // Fetch all user information from various tables
    const formattedData = await fetchAndFormatJobSeekerData(userProfile);
    
    // Calculate which steps have been completed
    const completedSteps = await calculateCompletedSteps(formattedData, userProfile.id);
    
    // Default the current step to 1 (first step)
    let currentStep = 1;
    
    // If we have the URL, check if it contains a step number
    const url = req.nextUrl?.pathname || "";
    const stepMatch = url.match(/\/onboarding\/([^\/]+)/);
    if (stepMatch) {
      // Try to find the current step based on URL path
      const pathFragment = stepMatch[1];
      // Find the step in our predefined array that matches the URL path
      const stepPaths = {
        "informasi-dasar": 1,
        "informasi-lanjutan": 2,
        "alamat": 3,
        "pendidikan": 4,
        "level-pengalaman": 5,
        "pengalaman-kerja": 6,
        "ekspektasi-kerja": 7,
        "cv-upload": 8,
        "foto-profile": 9,
        "ringkasan": 10
      };
      
      if (pathFragment in stepPaths) {
        currentStep = stepPaths[pathFragment as keyof typeof stepPaths];
      }
    } else {
      // No specific URL step found, calculate based on completion
      // Find the first incomplete required step
      for (let i = 1; i <= 5; i++) {
        if (!completedSteps.includes(i)) {
          currentStep = i;
          break;
        }
      }
      
      // If all required steps are complete, go to the next non-completed step
      if (currentStep === 1 && completedSteps.includes(1)) {
        // Find the first step that's not completed
        for (let i = 2; i <= onboardingSteps.length; i++) {
          if (!completedSteps.includes(i)) {
            currentStep = i;
            break;
          }
        }
        
        // If all steps are completed, go to the summary step
        if (currentStep === 1) {
          currentStep = 10;
        }
      }
    }

    // Also check with the check-onboarding endpoint for consistent step tracking
    let checkOnboardingResult;
    try {
      // Use the getJobSeekerOnboardingStatus function directly for consistency
      checkOnboardingResult = await getJobSeekerOnboardingStatus(userId);
      
      // If valid result and their currentStep is "further ahead", use that instead
      // This helps ensure we don't accidentally move users backwards in the flow
      if (checkOnboardingResult && 
          checkOnboardingResult.currentStep > currentStep) {
        currentStep = checkOnboardingResult.currentStep;
      }
    } catch (error) {
      console.error("Error checking onboarding status during GET:", error);
      // Continue with what we have if this fails
    }

    console.log(`GET onboarding returning currentStep: ${currentStep}, completedSteps:`, completedSteps);

    return NextResponse.json({ 
      data: formattedData,
      completedSteps,
      currentStep
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
 * Calculate which steps have been completed based on the data
 */
async function calculateCompletedSteps(data: any, userProfileId?: string) {
  const completedSteps: number[] = [];

  // Step 1: Informasi Dasar
  if (data.namaLengkap && data.email && data.nomorTelepon) {
    completedSteps.push(1);
  }

  // Step 2: Informasi Lanjutan
  if (data.tanggalLahir && typeof data.tanggalLahir === 'string' && data.tempatLahir) {
    completedSteps.push(2);
  }

  // Step 3: Alamat
  // First check if we have addresses in the database (more reliable)
  let hasAddress = false;
  if (userProfileId) {
    try {
      const userAddressesResult = await db
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userProfileId, userProfileId));
      
      if (userAddressesResult && userAddressesResult.length > 0) {
        hasAddress = true;
      }
    } catch (error) {
      console.error("Error checking addresses from database:", error);
      // Fall back to the data object check if database query fails
    }
  }
  
  // If no addresses found in DB, fall back to checking the data object
  if (!hasAddress && data.alamat && data.alamat.kota) {
    hasAddress = true;
  }
  
  if (hasAddress) {
    completedSteps.push(3);
  }

  // Step 4: Pendidikan
  if (data.pendidikan && data.pendidikan.length > 0 && 
      data.pendidikan.every((p: any) => 
        p.namaInstitusi && 
        p.lokasi && 
        p.jenjangPendidikan && 
        p.bidangStudi && 
        p.tanggalLulus
      )) {
    completedSteps.push(4);
  }

  // Step 5: Level Pengalaman
  if (data.levelPengalaman) {
    completedSteps.push(5);
  }

  // Steps 6-9 are optional
  // We'll mark each optional step as completed if either:
  // 1. The user has provided data for that step, OR
  // 2. The step has been visited (reaching step 6+ means all required steps are done)
  
  // Step 6: Pengalaman Kerja (optional)
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    // Actual data provided
    completedSteps.push(6);
  } else if (completedSteps.includes(5)) {
    // No data but the user has completed all required steps
    completedSteps.push(6);
  }

  // Step 7: Ekspektasi Kerja (optional)
  if (data.ekspektasiKerja && Object.keys(data.ekspektasiKerja).length > 0) {
    // Actual data provided
    completedSteps.push(7);
  } else if (completedSteps.includes(6)) {
    // No data but previous steps are complete
    completedSteps.push(7);
  }

  // Step 8: CV Upload (optional)
  if (data.cvFileUrl) {
    // Actual data provided
    completedSteps.push(8);
  } else if (completedSteps.includes(7)) {
    // No data but previous steps are complete
    completedSteps.push(8);
  }

  // Step 9: Profile Photo (optional)
  if (data.profilePhotoUrl) {
    // Actual data provided
    completedSteps.push(9);
  } else if (completedSteps.includes(8)) {
    // No data but previous steps are complete
    completedSteps.push(9);
  }

  return completedSteps;
}

// Helper constant for step references
const onboardingSteps = Array.from({ length: 10 }, (_, i) => i + 1);

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
      pendidikan: [],
      ekspektasiKerja: {}
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
      kodePos: addresses[0].kodePos || ""
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
      gajiTerakhir: (p as any).gajiTerakhir || null,
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
    })),
    
    ekspektasiKerja: userProfile.ekspektasiKerja || {}
  };
} 