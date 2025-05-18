import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createEmployer, updateEmployerOnboardingProgress, db, employerOnboardingProgress } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { CustomSession } from '@/lib/types';

// Simplified validation schema for required fields only
const employerRequiredSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  pic: z.object({
    nama: z.string().min(1, "Nama PIC wajib diisi"),
    nomorTelepon: z.string().min(1, "Nomor telepon PIC wajib diisi")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, "Format nomor telepon Indonesia tidak valid"),
  }),
});

// Define the employer data type based on the database schema
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

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if the user has the correct role
    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: "Forbidden: Only employers can access this endpoint" },
        { status: 403 }
      );
    }
    
    const userId = session.user.id;
    
    // Get the saved onboarding data
    const [progress] = await db
      .select()
      .from(employerOnboardingProgress)
      .where(eq(employerOnboardingProgress.userId, userId));
    
    if (!progress || !progress.data) {
      return NextResponse.json(
        { error: "Onboarding data not found" },
        { status: 400 }
      );
    }
    
    // Validate required fields
    const validationResult = employerRequiredSchema.safeParse(progress.data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Required fields missing", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    // Extract valid data and ensure all required fields are present
    const validData = validationResult.data;
    const data = progress.data as Record<string, any>;
    
    // Prepare the employer data for database insertion
    const employerData: EmployerData = {
      userId,
      namaPerusahaan: validData.namaPerusahaan,
      merekUsaha: data.merekUsaha || null,
      industri: data.industri || "",
      alamatKantor: data.alamatKantor || "",
      email: validData.email,
      website: data.website || null,
      // Handle socialMedia - set to null if empty or undefined
      socialMedia: data.socialMedia && typeof data.socialMedia === 'object' && 
        Object.values(data.socialMedia).some(value => value) 
          ? data.socialMedia 
          : null,
      logoUrl: data.logoUrl || null,
      pic: validData.pic, // Required and validated field
    };
    
    // Create the employer record in the database
    const newEmployer = await createEmployer(employerData);
    
    // Update the onboarding progress to mark it as completed
    await updateEmployerOnboardingProgress(userId, {
      currentStep: 4, // Final step
      status: 'COMPLETED',
      data: data
    });
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        employerId: newEmployer.id,
        message: "Employer registration completed successfully"
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