import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createEmployer, db, users, updateUserOnboardingStatus } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { CustomSession } from '@/lib/types';

// Validation schema for required fields
const employerRequiredSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  pic: z.object({
    nama: z.string().min(1, "Nama PIC wajib diisi"),
    nomorTelepon: z.string().min(1, "Nomor telepon PIC wajib diisi")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, "Format nomor telepon Indonesia tidak valid"),
  }),
});

// Define the employer data type
type EmployerData = {
  userId: string;
  namaPerusahaan: string;
  merekUsaha: string | null;
  industri: string;
  alamatKantor: string;
  email: string;
  website: string | null;
  socialMedia: Record<string, string> | null;
  logoUrl: string | null;
  pic: {
    nama: string;
    nomorTelepon: string;
  };
};

/**
 * Endpoint to handle final submission of employer onboarding data
 * With the new approach, this is the only endpoint that saves data to the database
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check authentication and role
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }
    
    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: "Forbidden: Only employers can access this endpoint" },
        { status: 403 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if onboarding is already completed to prevent duplicate submissions
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (user?.onboardingCompleted) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Onboarding already completed",
          completed: true
        }
      );
    }
    
    // Get form data from request - we now expect it to always be present
    let formData;
    try {
      formData = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body - no data provided" },
        { status: 400 }
      );
    }
    
    // Validate required fields
    const validationResult = employerRequiredSchema.safeParse(formData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Required fields missing", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    // Prepare the employer data
    const validData = validationResult.data;
    const employerData: EmployerData = {
      userId,
      namaPerusahaan: validData.namaPerusahaan,
      merekUsaha: formData.merekUsaha || null,
      industri: formData.industri || "",
      alamatKantor: formData.alamatKantor || "",
      email: validData.email,
      website: formData.website || null,
      socialMedia: formData.socialMedia ? formData.socialMedia : null,
      logoUrl: formData.logoUrl || null,
      pic: validData.pic,
    };
    
    // Create the employer record and update user status
    let newEmployer;
    try {
      // 1. Create the employer record
      newEmployer = await createEmployer(employerData);
      
      // 2. Update the user's onboardingCompleted status to true
      // Use the dedicated function for better error handling and logging
      await updateUserOnboardingStatus(userId, true);
      
      console.log(`Employer onboarding completed successfully for user ${userId}`);
    } catch (dbError) {
      console.error("Database error during employer creation:", dbError);
      return NextResponse.json(
        { error: "Failed to create employer record", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        employerId: newEmployer.id,
        message: "Employer registration completed successfully",
        completed: true
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Error during employer onboarding:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred during employer onboarding", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 