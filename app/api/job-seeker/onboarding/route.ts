import { NextRequest, NextResponse } from "next/server";
import { auth } from "lib/auth";
import * as z from "zod";
import {
  createUserProfile,
  updateUserProfile,
  getUserProfileByUserId,
  db,
  userProfiles,
  userAddresses,
  userSocialMedia,
  userPengalamanKerja,
  userPendidikan,
  userKeahlian,
  userSertifikasi,
  userBahasa,
  agamaEnum
} from "@/lib/db";
import { eq } from "drizzle-orm";

// Schema for validation
const onboardingSchema = z.object({
  step: z.number(),
  data: z.record(z.unknown())
});

// Agama validation schema
const agamaSchema = z.enum(agamaEnum.enumValues);

/**
 * POST handler for saving onboarding data incrementally
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { step, data } = onboardingSchema.parse(body);

    // Get or create user profile
    let userProfile = await getUserProfileByUserId(session.user.id as string);
    
    if (!userProfile) {
      // Create basic profile if it doesn't exist
      userProfile = await createUserProfile({
        userId: session.user.id as string,
        namaLengkap: session.user.name || "",
        email: session.user.email || "",
        nomorTelepon: "",
        tanggalLahir: ""
      });
    }

    // Process data based on step
    switch (step) {
      case 1: // Informasi Pribadi
        const updateDataStep1: Record<string, any> = {
          namaLengkap: data.namaLengkap as string,
          email: data.email as string,
          nomorTelepon: data.nomorTelepon as string,
        };
        
        // Only add optional fields if they exist
        if (data.tempatLahir) {
          updateDataStep1.tempatLahir = data.tempatLahir as string;
        }
        if (data.statusPernikahan) {
          updateDataStep1.statusPernikahan = data.statusPernikahan as string;
        }
        
        await updateUserProfile(userProfile.id, updateDataStep1);
        break;

      case 2: // Informasi Lanjutan
        // Validate agama if provided
        let agama = null;
        if (data.agama) {
          try {
            agama = agamaSchema.parse(data.agama);
          } catch (error) {
            return NextResponse.json({ error: "Invalid agama value" }, { status: 400 });
          }
        }

        const updateDataStep2: Record<string, any> = {};
        
        if (data.tanggalLahir) {
          updateDataStep2.tanggalLahir = data.tanggalLahir as string;
        }
        if (data.jenisKelamin) {
          updateDataStep2.jenisKelamin = data.jenisKelamin as any;
        }
        if (data.beratBadan) {
          updateDataStep2.beratBadan = Number(data.beratBadan);
        }
        if (data.tinggiBadan) {
          updateDataStep2.tinggiBadan = Number(data.tinggiBadan);
        }
        if (agama) {
          updateDataStep2.agama = agama;
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

      case 4: // Social Media
        if (data.socialMedia) {
          // Delete existing social media
          await db.delete(userSocialMedia).where(eq(userSocialMedia.userProfileId, userProfile.id));
          
          const socialMediaData = data.socialMedia as Record<string, any>;
          
          // Create new social media
          await db.insert(userSocialMedia).values({
            userProfileId: userProfile.id,
            instagram: socialMediaData.instagram || null,
            twitter: socialMediaData.twitter || null,
            facebook: socialMediaData.facebook || null,
            tiktok: socialMediaData.tiktok || null,
            linkedin: socialMediaData.linkedin || null,
            other: socialMediaData.other || null
          });
        }
        break;

      case 5: // Upload Foto
        if (data.fotoProfilUrl) {
          await updateUserProfile(userProfile.id, {
            fotoProfilUrl: data.fotoProfilUrl as string
          });
        }
        break;

      case 6: // Level Pengalaman
        // This is typically handled in the pengalaman kerja step
        break;

      case 7: // Pengalaman Kerja
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

      case 8: // Pendidikan
        if (Array.isArray(data.pendidikan)) {
          // Delete existing pendidikan
          await db.delete(userPendidikan).where(eq(userPendidikan.userProfileId, userProfile.id));
          
          // Create new pendidikan entries
          for (const pendidikan of data.pendidikan as any[]) {
            const pendidikanValues: Record<string, any> = {
              userProfileId: userProfile.id,
              namaInstitusi: pendidikan.namaInstitusi,
              jenjangPendidikan: pendidikan.jenjangPendidikan,
              bidangStudi: pendidikan.bidangStudi,
              tanggalLulus: pendidikan.tanggalLulus,
              nilaiAkhir: pendidikan.nilaiAkhir || null,
              deskripsiTambahan: pendidikan.deskripsiTambahan || null,
            };
            
            // Add optional fields if they exist
            if (pendidikan.lokasi) {
              pendidikanValues.lokasi = pendidikan.lokasi;
            }
            
            await db.insert(userPendidikan).values(pendidikanValues as any);
          }
        }
        break;

      case 9: // Keahlian
        if (Array.isArray(data.keahlian)) {
          // Delete existing keahlian
          await db.delete(userKeahlian).where(eq(userKeahlian.userProfileId, userProfile.id));
          
          // Create new keahlian entries
          for (const keahlian of data.keahlian as any[]) {
            await db.insert(userKeahlian).values({
              userProfileId: userProfile.id,
              nama: keahlian.nama,
              tingkat: keahlian.tingkat || null
            });
          }
        }
        break;

      case 10: // Sertifikasi
        if (Array.isArray(data.sertifikasi)) {
          // Delete existing sertifikasi
          await db.delete(userSertifikasi).where(eq(userSertifikasi.userProfileId, userProfile.id));
          
          // Create new sertifikasi entries
          for (const sertifikasi of data.sertifikasi as any[]) {
            await db.insert(userSertifikasi).values({
              userProfileId: userProfile.id,
              nama: sertifikasi.nama,
              penerbit: sertifikasi.penerbit || null,
              tanggalTerbit: sertifikasi.tanggalTerbit || null,
              fileUrl: sertifikasi.file || null
            });
          }
        }
        break;

      case 11: // Bahasa
        if (Array.isArray(data.bahasa)) {
          // Delete existing bahasa
          await db.delete(userBahasa).where(eq(userBahasa.userProfileId, userProfile.id));
          
          // Create new bahasa entries
          for (const bahasa of data.bahasa as any[]) {
            await db.insert(userBahasa).values({
              userProfileId: userProfile.id,
              nama: bahasa.nama,
              tingkat: bahasa.tingkat || null
            });
          }
        }
        break;

      case 12: // Informasi Tambahan
        if (data.informasiTambahan) {
          // Store in user profile or a separate table if needed
          // For now, we'll just log it
          console.log("Informasi Tambahan:", data.informasiTambahan);
        }
        break;

      case 13: // Ekspektasi Kerja
        if (data.ekspektasiKerja) {
          // Store in user profile or a separate table if needed
          // For now, we'll just log it
          console.log("Ekspektasi Kerja:", data.ekspektasiKerja);
        }
        break;

      case 14: // Ringkasan
        // This step is typically just a review, no data to save
        break;

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully saved data for step ${step}`,
      step
    });
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to save data",
      message: error instanceof Error ? error.message : "Unknown error"
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
      socialMedia,
      pengalamanKerja,
      pendidikan,
      keahlian,
      sertifikasi,
      bahasa
    ] = await Promise.all([
      db.select().from(userAddresses).where(eq(userAddresses.userProfileId, userProfile.id)),
      db.select().from(userSocialMedia).where(eq(userSocialMedia.userProfileId, userProfile.id)),
      db.select().from(userPengalamanKerja).where(eq(userPengalamanKerja.userProfileId, userProfile.id)),
      db.select().from(userPendidikan).where(eq(userPendidikan.userProfileId, userProfile.id)),
      db.select().from(userKeahlian).where(eq(userKeahlian.userProfileId, userProfile.id)),
      db.select().from(userSertifikasi).where(eq(userSertifikasi.userProfileId, userProfile.id)),
      db.select().from(userBahasa).where(eq(userBahasa.userProfileId, userProfile.id))
    ]);

    // Format data to match OnboardingContext structure
    const formattedData: Record<string, any> = {
      namaLengkap: userProfile.namaLengkap,
      email: userProfile.email,
      nomorTelepon: userProfile.nomorTelepon,
      tanggalLahir: userProfile.tanggalLahir,
      tempatLahir: "", // Default empty string
      statusPernikahan: undefined, // Default undefined
      jenisKelamin: userProfile.jenisKelamin,
      beratBadan: userProfile.beratBadan,
      tinggiBadan: userProfile.tinggiBadan,
      agama: userProfile.agama,
      fotoProfilUrl: userProfile.fotoProfilUrl,
      
      alamat: addresses[0] ? {
        jalan: addresses[0].jalan,
        kota: addresses[0].kota,
        provinsi: addresses[0].provinsi,
        kodePos: addresses[0].kodePos,
        rt: addresses[0].rt || undefined,
        rw: addresses[0].rw || undefined,
        kelurahan: addresses[0].kelurahan || undefined,
        kecamatan: addresses[0].kecamatan || undefined
      } : {},
      
      socialMedia: socialMedia[0] ? {
        instagram: socialMedia[0].instagram,
        twitter: socialMedia[0].twitter,
        facebook: socialMedia[0].facebook,
        tiktok: socialMedia[0].tiktok,
        linkedin: socialMedia[0].linkedin,
        other: socialMedia[0].other
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
          result.lokasi = (p as any).lokasi;
        }
        
        return result;
      }),
      
      keahlian: keahlian.map(k => ({
        nama: k.nama,
        tingkat: k.tingkat
      })),
      
      sertifikasi: sertifikasi.map(s => ({
        nama: s.nama,
        penerbit: s.penerbit,
        tanggalTerbit: s.tanggalTerbit,
        file: s.fileUrl
      })),
      
      bahasa: bahasa.map(b => ({
        nama: b.nama,
        tingkat: b.tingkat
      })),
      
      // Add placeholders for other data that might not be stored in the database yet
      informasiTambahan: {},
      ekspektasiKerja: {}
    };

    // Add tempatLahir and statusPernikahan if they exist in the userProfile
    if ('tempatLahir' in userProfile) {
      formattedData.tempatLahir = (userProfile as any).tempatLahir || "";
    }
    
    if ('statusPernikahan' in userProfile) {
      formattedData.statusPernikahan = (userProfile as any).statusPernikahan;
    }

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

  // Step 1: Informasi Pribadi
  if (data.namaLengkap && data.email && data.nomorTelepon) {
    completedSteps.push(1);
  }

  // Step 2: Informasi Lanjutan
  if (data.tanggalLahir) {
    completedSteps.push(2);
  }

  // Step 3: Alamat
  if (data.alamat && data.alamat.jalan && data.alamat.kota && data.alamat.provinsi) {
    completedSteps.push(3);
  }

  // Step 4: Social Media (optional)
  completedSteps.push(4);

  // Step 5: Upload Foto (optional)
  completedSteps.push(5);

  // Step 6: Level Pengalaman (part of pengalaman kerja)
  completedSteps.push(6);

  // Step 7: Pengalaman Kerja
  if (data.pengalamanKerja && data.pengalamanKerja.length > 0) {
    completedSteps.push(7);
  }

  // Step 8: Pendidikan
  if (data.pendidikan && data.pendidikan.length > 0) {
    completedSteps.push(8);
  }

  // Step 9: Keahlian
  if (data.keahlian && data.keahlian.length > 0) {
    completedSteps.push(9);
  }

  // Step 10: Sertifikasi (optional)
  completedSteps.push(10);

  // Step 11: Bahasa (optional)
  completedSteps.push(11);

  // Step 12: Informasi Tambahan (optional)
  completedSteps.push(12);

  // Step 13: Ekspektasi Kerja
  if (data.ekspektasiKerja && data.ekspektasiKerja.minSalary && data.ekspektasiKerja.idealSalary) {
    completedSteps.push(13);
  }

  return completedSteps;
} 