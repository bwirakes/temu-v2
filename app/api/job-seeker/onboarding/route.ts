import { NextRequest, NextResponse } from "next/server";
import { auth } from "lib/auth";
import * as z from "zod";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfileByUserId,
  db,
  userAddresses,
  userPengalamanKerja,
  userPendidikan,
  
} from "@/lib/db";
import { eq } from "drizzle-orm";

// Schema for validation
const onboardingSchema = z.object({
  step: z.number(),
  data: z.record(z.unknown())
});


/**
 * POST handler for saving onboarding data incrementally
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
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

    // Get or create user profile
    let userProfile = await getUserProfileByUserId(session.user.id as string);
    
    if (!userProfile) {
      try {
        // Create basic profile if it doesn't exist
        userProfile = await createUserProfile({
          userId: session.user.id as string,
          namaLengkap: session.user.name || "",
          email: session.user.email || "",
          nomorTelepon: "",
          tanggalLahir: ""
        });
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        return NextResponse.json({ 
          error: "Failed to create user profile", 
          message: profileError instanceof Error ? profileError.message : "Unknown error creating profile"
        }, { status: 500 });
      }
    }

    // Process data based on step
    try {
      switch (step) {
        case 1: // Informasi Dasar
          const updateDataStep1: Record<string, any> = {
            namaLengkap: data.namaLengkap as string,
            email: data.email as string,
            nomorTelepon: data.nomorTelepon as string,
          };
          
          await updateUserProfile(userProfile.id, updateDataStep1);
          break;

        case 2: // Informasi Lanjutan
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
          if (data.levelPengalaman) {
            await updateUserProfile(userProfile.id, {
              levelPengalaman: data.levelPengalaman
            });
          }
          break;

        case 6: // Pengalaman Kerja
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

        case 7: // Ekspektasi Kerja
          if (data.ekspektasiKerja) {
            const ekspektasiData = data.ekspektasiKerja as Record<string, any>;
            
            // Store ekspektasi kerja directly as JSONB in user profile
            await updateUserProfile(userProfile.id, {
              ekspektasiKerja: {
                jobTypes: ekspektasiData.jobTypes || null,
                idealSalary: ekspektasiData.idealSalary ? Number(ekspektasiData.idealSalary) : null,
                willingToTravel: ekspektasiData.willingToTravel || null,
                preferensiLokasiKerja: ekspektasiData.preferensiLokasiKerja || null
              }
            });
          }
          break;

        case 8: // CV Upload
          if (data.cvFileUrl) {
            // Store CV URL in user profile
            await updateUserProfile(userProfile.id, {
              cvFileUrl: data.cvFileUrl as string,
              cvUploadDate: new Date()
            });
          }
          break;

        case 9: // Profile Photo Upload
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

      return NextResponse.json({ 
        success: true,
        message: `Step ${step} data saved successfully`
      });
    } catch (stepError) {
      console.error(`Error processing step ${step}:`, stepError);
      return NextResponse.json({ 
        error: `Failed to save data for step ${step}`, 
        message: stepError instanceof Error ? stepError.message : "Unknown error processing step"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        message: JSON.stringify(error.errors)
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: "Failed to process request",
      message: error instanceof Error ? error.message : "Unknown server error"
    }, { status: 500 });
  }
}

/**
 * GET handler for retrieving all onboarding data
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const userProfile = await getUserProfileByUserId(session.user.id as string);
    if (!userProfile) {
      return NextResponse.json({ data: null });
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
    const formattedData: Record<string, any> = {
      namaLengkap: userProfile.namaLengkap,
      email: userProfile.email,
      nomorTelepon: userProfile.nomorTelepon,
      tanggalLahir: userProfile.tanggalLahir,
      tempatLahir: userProfile.tempatLahir || "", // Use the new field
      statusPernikahan: undefined, // Default undefined
      jenisKelamin: userProfile.jenisKelamin,
      cvFileUrl: userProfile.cvFileUrl || "", // Add CV file URL
      profilePhotoUrl: userProfile.profilePhotoUrl || "", // Add Profile Photo URL
      levelPengalaman: userProfile.levelPengalaman || "", // Add level pengalaman
      
      alamat: addresses[0] ? {
        jalan: addresses[0].jalan,
        kota: addresses[0].kota,
        provinsi: addresses[0].provinsi,
        kodePos: addresses[0].kodePos
      } : {},
      
      pengalamanKerja: pengalamanKerja.map(p => {
        // Create base object with known properties
        const result: Record<string, any> = {
          id: p.id,
          levelPengalaman: p.levelPengalaman,
          namaPerusahaan: p.namaPerusahaan,
          posisi: p.posisi,
          tanggalMulai: p.tanggalMulai,
          tanggalSelesai: p.tanggalSelesai,
          deskripsiPekerjaan: p.deskripsiPekerjaan,
          lokasiKerja: p.lokasiKerja,
          lokasi: p.lokasi,
          alasanKeluar: p.alasanKeluar,
        };
        
        // Add gajiTerakhir if it exists in the database record
        if ('gajiTerakhir' in p) {
          result.gajiTerakhir = (p as any).gajiTerakhir;
        }
        
        return result;
      }),
      
      pendidikan: pendidikan.map(p => {
        // Create base object with known properties
        const result: Record<string, any> = {
          id: p.id,
          namaInstitusi: p.namaInstitusi,
          jenjangPendidikan: p.jenjangPendidikan,
          bidangStudi: p.bidangStudi,
          tanggalLulus: p.tanggalLulus,
          nilaiAkhir: p.nilaiAkhir,
          deskripsiTambahan: p.deskripsiTambahan,
        };
        
        // Add lokasi if it exists in the database record
        if ('lokasi' in p) {
          result.lokasi = p.lokasi;
        }
        
        return result;
      }),
      
      // Empty arrays for tables that are no longer used
      keahlian: [],
      sertifikasi: [],
      bahasa: [],
      
      // Parse ekspektasiKerja JSON if it exists
      ekspektasiKerja: userProfile.ekspektasiKerja ? 
        (typeof userProfile.ekspektasiKerja === 'string' ? 
          JSON.parse(userProfile.ekspektasiKerja) : userProfile.ekspektasiKerja) : {}
    };

    return NextResponse.json({ 
      data: formattedData,
      completedSteps: calculateCompletedSteps(formattedData)
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
function calculateCompletedSteps(data: any) {
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
  if (data.alamat && data.alamat.kota) {
    completedSteps.push(3);
  }

  // Step 4: Pendidikan
  if (data.pendidikan && data.pendidikan.length > 0) {
    completedSteps.push(4);
  }

  // Step 5: Level Pengalaman
  if (data.levelPengalaman) {
    completedSteps.push(5);
  }

  // Step 6: Pengalaman Kerja (optional)
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    completedSteps.push(6);
  } else if (data.levelPengalaman) {
    // If the user has set level pengalaman and has no experience, consider step 6 completed
    completedSteps.push(6);
  }

  // Step 7: Ekspektasi Kerja
  const ekspektasiKerja = data.ekspektasiKerja;
    
  if (ekspektasiKerja && 
      ((typeof ekspektasiKerja === 'object' && ekspektasiKerja.idealSalary && ekspektasiKerja.willingToTravel) || 
       (typeof ekspektasiKerja === 'string' && ekspektasiKerja))) {
    completedSteps.push(7);
  }

  // Step 8: CV Upload (optional)
  if (data.cvFileUrl) {
    completedSteps.push(8);
  } else {
    // Optional step
    completedSteps.push(8);
  }

  // Step 9: Profile Photo (optional)
  if (data.profilePhotoUrl) {
    completedSteps.push(9);
  } else {
    // Optional step
    completedSteps.push(9);
  }

  return completedSteps;
} 