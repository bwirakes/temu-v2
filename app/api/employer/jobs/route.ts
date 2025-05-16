import { NextRequest, NextResponse } from "next/server";
import { createJob, getEmployerByUserId, getJobsByEmployerId } from "@/lib/db";
import { z } from "zod";
import { auth } from '@/lib/auth';

/**
 * Schema for validating job posting data
 */
const jobPostingSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  contractType: z.string().min(1, "Contract type is required"),
  minWorkExperience: z.number().int().min(0, "Work experience must be a positive number"),
  salaryRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      isNegotiable: z.boolean().default(false),
    })
    .optional(),
  applicationDeadline: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()),
  description: z.string().optional(),
  numberOfPositions: z.number().int().positive().optional(),
  workingHours: z.string().optional(),
  expectations: z
    .object({
      ageRange: z
        .object({
          min: z.number().min(15, "Minimum age should be at least 15"),
          max: z.number(),
        })
        .optional()
        .refine((data) => !data || data.max >= data.min, {
          message: "Maximum age must be greater than or equal to minimum age",
        }),
      expectedCharacter: z.string().optional(),
      foreignLanguage: z.string().optional(),
    })
    .optional(),
  additionalRequirements: z
    .object({
      gender: z.enum(["MALE", "FEMALE", "ANY", "ALL"]).optional(),
      requiredDocuments: z.string().optional(),
      specialSkills: z.string().optional(),
      technologicalSkills: z.string().optional(),
      suitableForDisability: z.boolean().optional(),
    })
    .optional(),
  isConfirmed: z.boolean().default(false),
});

/**
 * POST handler for creating a new job posting
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session using Auth.js 5.0
    const session = await auth() as CustomSession;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Anda harus login terlebih dahulu" },
        { status: 401 }
      );
    }

    // Get the employer ID for the authenticated user
    const employer = await getEmployerByUserId(session.user.id);
    if (!employer) {
       // This might happen if a user is authenticated but not set up as an employer
       // or if the employer record was deleted.
      return NextResponse.json(
        { error: "Profil employer tidak ditemukan untuk pengguna ini" },
        { status: 404 }
      );
    }
    const employerId = employer.id;

    // Parse request body
    const body = await request.json();

    // Validate job posting data
    const validationResult = jobPostingSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: "Validasi gagal", details: errors },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const jobData = {
      ...validationResult.data,
      employerId, // Use the fetched and verified employerId
      // Handle date conversion for applicationDeadline if provided
      applicationDeadline: validationResult.data.applicationDeadline
        ? new Date(validationResult.data.applicationDeadline)
        : null,
    };

    // Create job posting
    const newJob = await createJob(jobData);

    // Return success response
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error("Error creating job posting:", error);

    // Handle specific database errors if possible
    if (error instanceof Error) {
      if (error.message.includes("foreign key constraint")) {
        return NextResponse.json(
          { error: "Kesalahan batasan database" },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: "Gagal membuat lowongan pekerjaan. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}

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

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user's session using Auth.js 5.0
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    // Get employer ID from the user ID
    const employer = await getEmployerByUserId(session.user.id);
    
    if (!employer) {
      return NextResponse.json(
        { error: 'Tidak ditemukan: Akun employer tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get all jobs for this employer
    const jobs = await getJobsByEmployerId(employer.id);
    
    // Count applications for each job (placeholder - in real implementation, you'd fetch this from DB)
    const jobsWithApplicationCounts = jobs.map(job => ({
      ...job,
      applicationCount: Math.floor(Math.random() * 50) // Mock data - replace with actual count
    }));

    return NextResponse.json({ jobs: jobsWithApplicationCounts });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data lowongan' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}