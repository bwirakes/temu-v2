import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  db, 
  getUserProfileByUserId, 
  updateUserProfile, 
  userAddresses, 
  userPengalamanKerja, 
  userPendidikan 
} from '@/lib/db';
import { eq } from 'drizzle-orm';

// Export as dynamic to ensure the data is always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching for API routes

/**
 * GET handler to retrieve user profile data
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    
    // Check if the user is authenticated and is a job seeker
    if (!session?.user?.id) {
      console.error('Profile API: Unauthorized access attempt - no user ID');
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }
    
    // Check user type for additional security
    const userType = (session.user as any).userType;
    if (userType !== 'job_seeker') {
      console.error(`Profile API: Unauthorized access attempt - wrong user type: ${userType}`);
      return NextResponse.json({ error: "Unauthorized", code: "INVALID_USER_TYPE" }, { status: 403 });
    }

    // Get user profile
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    if (!userProfile) {
      console.log(`Profile API: Profile not found for user ID: ${session.user.id}`);
      return NextResponse.json({ 
        error: "Profile not found", 
        code: "PROFILE_NOT_FOUND" 
      }, { status: 404 });
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

    // Format data to return a complete profile
    const formattedProfile = {
      id: userProfile.id,
      userId: userProfile.userId,
      namaLengkap: userProfile.namaLengkap,
      email: userProfile.email,
      nomorTelepon: userProfile.nomorTelepon,
      tanggalLahir: userProfile.tanggalLahir,
      tempatLahir: userProfile.tempatLahir || null,
      jenisKelamin: userProfile.jenisKelamin,
      cvFileUrl: userProfile.cvFileUrl || null,
      cvUploadDate: userProfile.cvUploadDate,
      profilePhotoUrl: userProfile.profilePhotoUrl || null,
      levelPengalaman: userProfile.levelPengalaman || null,
      
      // Parse JSONB data
      ekspektasiKerja: userProfile.ekspektasiKerja ? 
        (typeof userProfile.ekspektasiKerja === 'string' ? 
          JSON.parse(userProfile.ekspektasiKerja) : userProfile.ekspektasiKerja) : null,
      
      // Add related data
      alamat: addresses[0] || null,
      pendidikan: pendidikan,
      pengalamanKerja: pengalamanKerja
    };

    return NextResponse.json({ 
      success: true,
      data: formattedProfile 
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json({ 
      error: "Failed to fetch profile data",
      message: error instanceof Error ? error.message : "Unknown error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  }
}

/**
 * PUT handler to update user profile data
 */
export async function PUT(req: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    
    // Check if the user is authenticated and is a job seeker
    if (!session?.user?.id) {
      console.error('Profile API: Unauthorized update attempt - no user ID');
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }
    
    // Check user type for additional security
    const userType = (session.user as any).userType;
    if (userType !== 'job_seeker') {
      console.error(`Profile API: Unauthorized update attempt - wrong user type: ${userType}`);
      return NextResponse.json({ error: "Unauthorized", code: "INVALID_USER_TYPE" }, { status: 403 });
    }

    // Get user profile
    const userProfile = await getUserProfileByUserId(session.user.id);
    
    if (!userProfile) {
      console.log(`Profile API: Profile not found for update - user ID: ${session.user.id}`);
      return NextResponse.json({ 
        error: "Profile not found", 
        code: "PROFILE_NOT_FOUND" 
      }, { status: 404 });
    }

    // Get update data from request
    const updateData = await req.json();

    // Update fields that can be changed directly on the profile
    const allowedFields = [
      'namaLengkap',
      'nomorTelepon',
      'tanggalLahir',
      'tempatLahir',
      'jenisKelamin',
      'levelPengalaman',
      'ekspektasiKerja',
      'profilePhotoUrl',
      'cvFileUrl'
    ];

    // Filter to only allowed fields
    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as Record<string, any>);

    // Update the profile
    const updatedProfile = await updateUserProfile(userProfile.id, filteredUpdateData);

    // Handle address update separately if provided
    if (updateData.alamat) {
      const addressData = updateData.alamat;
      
      // Check if an address record already exists
      const [existingAddress] = await db
        .select()
        .from(userAddresses)
        .where(eq(userAddresses.userProfileId, userProfile.id));
      
      if (existingAddress) {
        // Update existing address
        await db
          .update(userAddresses)
          .set({ 
            ...addressData,
            updatedAt: new Date() 
          })
          .where(eq(userAddresses.id, existingAddress.id));
      } else {
        // Create new address
        await db
          .insert(userAddresses)
          .values({
            userProfileId: userProfile.id,
            ...addressData,
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
    }

    // Handle pendidikan (education) updates
    if (Array.isArray(updateData.pendidikan)) {
      try {
        // Delete existing records
        await db.delete(userPendidikan).where(eq(userPendidikan.userProfileId, userProfile.id));
        
        // Insert new records
        for (const pendidikan of updateData.pendidikan) {
          await db.insert(userPendidikan).values({
            userProfileId: userProfile.id,
            namaInstitusi: pendidikan.namaInstitusi,
            jenjangPendidikan: pendidikan.jenjangPendidikan,
            bidangStudi: pendidikan.bidangStudi || '',
            tanggalLulus: pendidikan.tanggalLulus || '',
            lokasi: pendidikan.lokasi || null,
            nilaiAkhir: pendidikan.nilaiAkhir || null,
            deskripsiTambahan: pendidikan.deskripsiTambahan || null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        console.log(`Profile API: Updated ${updateData.pendidikan.length} education records for profile ID ${userProfile.id}`);
      } catch (error) {
        console.error("Error updating education data:", error);
        return NextResponse.json({ 
          error: "Failed to update education data",
          message: error instanceof Error ? error.message : "Unknown error",
          code: "EDUCATION_UPDATE_ERROR"
        }, { status: 500 });
      }
    }

    // Handle pengalamanKerja (work experience) updates
    if (Array.isArray(updateData.pengalamanKerja)) {
      try {
        // Delete existing records
        await db.delete(userPengalamanKerja).where(eq(userPengalamanKerja.userProfileId, userProfile.id));
        
        // Insert new records
        for (const pengalaman of updateData.pengalamanKerja) {
          await db.insert(userPengalamanKerja).values({
            userProfileId: userProfile.id,
            levelPengalaman: pengalaman.levelPengalaman || 'Lulusan Baru / Fresh Graduate',
            namaPerusahaan: pengalaman.namaPerusahaan,
            posisi: pengalaman.posisi,
            tanggalMulai: pengalaman.tanggalMulai,
            tanggalSelesai: pengalaman.tanggalSelesai || 'Sekarang',
            deskripsiPekerjaan: pengalaman.deskripsiPekerjaan || null,
            lokasiKerja: pengalaman.lokasiKerja || 'WFO',
            lokasi: pengalaman.lokasi || null,
            alasanKeluar: pengalaman.alasanKeluar || null,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        console.log(`Profile API: Updated ${updateData.pengalamanKerja.length} work experience records for profile ID ${userProfile.id}`);
      } catch (error) {
        console.error("Error updating work experience data:", error);
        return NextResponse.json({ 
          error: "Failed to update work experience data",
          message: error instanceof Error ? error.message : "Unknown error",
          code: "WORK_EXPERIENCE_UPDATE_ERROR"
        }, { status: 500 });
      }
    }

    // Retrieve updated profile data to send back in response
    const [
      addresses,
      pengalamanKerja,
      pendidikan
    ] = await Promise.all([
      db.select().from(userAddresses).where(eq(userAddresses.userProfileId, userProfile.id)),
      db.select().from(userPengalamanKerja).where(eq(userPengalamanKerja.userProfileId, userProfile.id)),
      db.select().from(userPendidikan).where(eq(userPendidikan.userProfileId, userProfile.id))
    ]);

    // Format the updated profile data for response
    const formattedProfile = {
      ...updatedProfile,
      alamat: addresses[0] || null,
      pendidikan: pendidikan,
      pengalamanKerja: pengalamanKerja,
      ekspektasiKerja: updatedProfile.ekspektasiKerja ? 
        (typeof updatedProfile.ekspektasiKerja === 'string' ? 
          JSON.parse(updatedProfile.ekspektasiKerja) : updatedProfile.ekspektasiKerja) : null,
    };

    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully",
      data: formattedProfile
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ 
      error: "Failed to update profile",
      message: error instanceof Error ? error.message : "Unknown error",
      code: "SERVER_ERROR"
    }, { status: 500 });
  }
} 