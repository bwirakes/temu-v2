import { NextRequest, NextResponse } from "next/server";
import { createJob, getEmployerByUserId, getJobsByEmployerId } from "@/lib/db";
import { z } from "zod";
import { auth } from '@/lib/auth';
import { LokasiKerjaEnum, EDUCATION_LEVELS, MinWorkExperienceEnum, MIN_WORK_EXPERIENCE_OPTIONS } from "@/lib/constants";

// Mark this API route as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

// Get MinWorkExperience enum values for Zod validation
const MIN_WORK_EXPERIENCE_VALUES = MIN_WORK_EXPERIENCE_OPTIONS.map(option => option.value);

/**
 * Schema for validating job posting data
 */
const jobPostingSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  minWorkExperience: z.enum(MIN_WORK_EXPERIENCE_VALUES as [string, ...string[]]), // Validate as enum
  numberOfPositions: z.number().int().positive().optional(),
  lastEducation: z.enum(EDUCATION_LEVELS as any as [string, ...string[]]).optional(),
  jurusan: z.string().optional(),
  lokasiKerja: z.string().optional(), // Changed from enum to string
  requiredCompetencies: z.string().optional(),
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
    })
    .optional(),
  additionalRequirements: z
    .object({
      gender: z.enum(["MALE", "FEMALE", "ANY", "ALL"]).optional(),
      acceptedDisabilityTypes: z.array(z.string()).optional(),
      numberOfDisabilityPositions: z.number().int().min(0).optional(),
    })
    .optional(),
  isConfirmed: z.boolean().default(false),
});

// Ensure the createJob function types match
type JobPostingCreateData = z.infer<typeof jobPostingSchema> & {
  employerId: string;
  jobId: string;
};

/**
 * Function to generate a human-readable job ID
 */
function generateJobId(): string {
  const prefix = 'job';
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit number between 10000-99999
  return `${prefix}-${random}`;
}

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

    // Generate a human-readable job ID
    const jobId = generateJobId();

    // Prepare data for insertion
    const jobData = {
      ...validationResult.data,
      employerId,
      jobId,
    } as any; // Cast to any to avoid TypeScript errors

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