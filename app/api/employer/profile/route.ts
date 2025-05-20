import { NextRequest, NextResponse } from "next/server";
import { getEmployerSession } from "@/lib/auth-utils";
import { getEmployerByUserId, updateEmployer, createEmployer } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  namaPerusahaan: z.string().min(1, "Company name is required"),
  merekUsaha: z.string().optional().nullable(),
  industri: z.string().min(1, "Industry is required"),
  alamatKantor: z.string().min(1, "Office address is required"),
  email: z.string().email("Invalid email format"),
  website: z.string().url("Invalid URL format").optional().nullable(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional().nullable(),
  pic: z.object({
    nama: z.string().min(1, "PIC name is required"),
    nomorTelepon: z.string().min(1, "PIC phone number is required"),
  }),
});

/**
 * GET handler to fetch employer profile data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching employer profile data');
    
    // Get employer session
    const session = await getEmployerSession();
    
    if (!session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log('API route: Session user ID:', session.user.id);
    
    // Get employer data
    const employer = await getEmployerByUserId(session.user.id);
    
    console.log('API route: Employer data found:', !!employer);
    
    if (!employer) {
      // Return a 404 with a standardized empty profile structure
      return NextResponse.json(
        { 
          profileExists: false,
          profile: {
            id: '',
            userId: session.user.id,
            namaPerusahaan: '',
            industri: '',
            alamatKantor: '',
            email: session.user.email || '',
            pic: {
              nama: '',
              nomorTelepon: ''
            },
            merekUsaha: '',
            website: '',
            socialMedia: null,
            logoUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      profileExists: true,
      profile: employer
    });
  } catch (error) {
    console.error('API route: Error fetching employer profile:', error);
    
    if (error instanceof Error && error.message.includes('Only employers')) {
      return NextResponse.json(
        { error: "Only employers can access this resource" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch employer profile" },
      { status: 500 }
    );
  }
}

/**
 * POST handler to update employer profile data
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API route: Updating employer profile data');
    
    // Get employer session
    const session = await getEmployerSession();
    
    if (!session.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate profile data
    const result = profileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Invalid profile data",
          validationErrors: result.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }
    
    // Get current employer data
    const employer = await getEmployerByUserId(session.user.id);
    
    if (!employer) {
      // Create new employer profile
      const newEmployer = await createEmployer({
        userId: session.user.id,
        ...result.data
      });
      
      if (!newEmployer) {
        return NextResponse.json(
          { error: "Failed to create employer profile" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "Employer profile created successfully",
        profile: newEmployer
      });
    }
    
    // Update existing employer profile
    const updatedEmployer = await updateEmployer(employer.id, result.data);
    
    return NextResponse.json({
      success: true,
      message: "Employer profile updated successfully",
      profile: updatedEmployer
    });
  } catch (error) {
    console.error('API route: Error updating employer profile:', error);
    
    if (error instanceof Error && error.message.includes('Only employers')) {
      return NextResponse.json(
        { error: "Only employers can access this resource" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update employer profile" },
      { status: 500 }
    );
  }
} 