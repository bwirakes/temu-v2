import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createEmployer, updateEmployerOnboardingProgress } from '@/lib/db';
import { z } from 'zod';

// Validation schema for the request body
const onboardingRequestSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  merekUsaha: z.string().optional(),
  industri: z.string().min(1, "Industri wajib diisi"),
  alamatKantor: z.string().min(1, "Alamat kantor wajib diisi"),
  website: z.string().optional(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
  logoUrl: z.string().optional(),
  pic: z.object({
    nama: z.string().min(1, "Nama PIC wajib diisi"),
    nomorTelepon: z.string().min(1, "Nomor telepon PIC wajib diisi")
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, "Format nomor telepon Indonesia tidak valid"),
  }),
});

// Define the custom session type to match what's in lib/auth.ts
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

export async function POST(request: Request) {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session || !session.user) {
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
    
    // Get the user ID from the session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }
    
    // Parse and validate the request body
    const requestData = await request.json();
    const validationResult = onboardingRequestSchema.safeParse(requestData);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Prepare the employer data for database insertion
    const employerData = {
      userId,
      namaPerusahaan: data.namaPerusahaan,
      merekUsaha: data.merekUsaha || null,
      industri: data.industri,
      alamatKantor: data.alamatKantor,
      website: data.website || null,
      // Handle socialMedia - set to null if empty or undefined
      socialMedia: data.socialMedia && Object.values(data.socialMedia).some(value => value) 
        ? data.socialMedia 
        : null,
      logoUrl: data.logoUrl || null,
      pic: data.pic, // Required field
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
        employerId: newEmployer.id 
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