import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, getEmployerByUserId, db, jobs, jobWorkLocations, minWorkExperienceEnum } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from '@/lib/auth';
import { revalidatePath } from "next/cache";
import { EDUCATION_LEVELS, MIN_WORK_EXPERIENCE_OPTIONS, MinWorkExperienceEnum } from "@/lib/constants";
import { mapFrontendWorkExperienceToDb } from "@/lib/utils/enum-mappers";

// Mark this API route as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

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

// Get enum values for Zod validation
const MIN_WORK_EXPERIENCE_VALUES = MIN_WORK_EXPERIENCE_OPTIONS.map(option => option.value);

/**
 * Schema for validating job update data
 */
const jobUpdateSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  minWorkExperience: z.enum(MIN_WORK_EXPERIENCE_VALUES as [string, ...string[]]),
  numberOfPositions: z.number().int().positive().optional().nullable(),
  lastEducation: z.enum(EDUCATION_LEVELS as any as [string, ...string[]]).optional().nullable(),
  jurusan: z.string().optional().nullable(),
  lokasiKerja: z.string().optional().nullable(),
  requiredCompetencies: z.string().optional().nullable(),
  expectations: z
    .object({
      ageRange: z
        .object({
          min: z.number().min(15, "Minimum age should be at least 15"),
          max: z.number(),
        })
        .optional()
        .nullable()
        .refine((data) => !data || data.max >= data.min, {
          message: "Maximum age must be greater than or equal to minimum age",
          path: ["max"],
        }),
    })
    .optional()
    .nullable(),
  additionalRequirements: z
    .object({
      gender: z.enum(["MALE", "FEMALE", "ANY", "ALL"]).optional().nullable(),
      acceptedDisabilityTypes: z.array(z.string()).optional().nullable(),
      numberOfDisabilityPositions: z.number().int().min(0).optional().nullable(),
    })
    .optional()
    .nullable(),
  isConfirmed: z.boolean().optional(),
});

/**
 * PUT handler for updating an existing job posting
 */
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }
    
    // Get the job ID from the URL parameters
    const jobId = await params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "ID lowongan tidak diberikan" },
        { status: 400 }
      );
    }
    
    // Get the employer ID for the authenticated user
    const employer = await getEmployerByUserId(session.user.id);
    if (!employer) {
      return NextResponse.json(
        { error: "Profil employer tidak ditemukan untuk pengguna ini" },
        { status: 404 }
      );
    }
    
    // Get the existing job
    const existingJob = await getJobById(jobId);
    if (!existingJob) {
      return NextResponse.json(
        { error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Verify that the job belongs to the authenticated employer
    if (existingJob.employerId !== employer.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke lowongan ini" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate job update data
    const validationResult = jobUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: "Validasi gagal", details: errors },
        { status: 400 }
      );
    }

    // Prepare data for update
    const jobData = {
      ...validationResult.data,
      // Map the frontend enum value to database-compatible enum value using the shared mapper
      minWorkExperience: mapFrontendWorkExperienceToDb(validationResult.data.minWorkExperience as MinWorkExperienceEnum) || 'LULUSAN_BARU',
      lokasiKerja: validationResult.data.lokasiKerja,
      // Ensure new fields are properly included
      lastEducation: validationResult.data.lastEducation as any,
      jurusan: validationResult.data.jurusan,
      requiredCompetencies: validationResult.data.requiredCompetencies || '',
      acceptedDisabilityTypes: validationResult.data.additionalRequirements?.acceptedDisabilityTypes || [],
      numberOfDisabilityPositions: validationResult.data.additionalRequirements?.numberOfDisabilityPositions || 0,
      // Handle expectations explicitly to avoid null issues
      expectations: validationResult.data.expectations ? {
        ageRange: validationResult.data.expectations.ageRange || undefined
      } : undefined,
      // Handle additionalRequirements explicitly to avoid null issues
      additionalRequirements: validationResult.data.additionalRequirements ? {
        gender: validationResult.data.additionalRequirements.gender || "ANY",
        acceptedDisabilityTypes: undefined,
        numberOfDisabilityPositions: undefined
      } : undefined,
      updatedAt: new Date() // Ensure updatedAt is refreshed
    };

    // Update job posting
    const updatedJob = await updateJob(jobId, jobData);

    // Revalidate relevant pages to update the static content
    revalidatePath(`/employer/jobs/${jobId}`);
    revalidatePath(`/job-detail/${jobId}`);
    revalidatePath('/employer/jobs');

    // Return success response
    return NextResponse.json({
      job: updatedJob,
      revalidated: true
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating job posting:", error);

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
      { error: "Gagal memperbarui lowongan pekerjaan. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler - alias for PUT for partial updates
 */
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return PUT(request, props);
}

/**
 * Handle other HTTP methods
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in' },
        { status: 401 }
      );
    }
    
    // Get the job ID from the URL parameters
    const jobId = await params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "ID lowongan tidak diberikan" },
        { status: 400 }
      );
    }
    
    // Get the employer ID for the authenticated user
    const employer = await getEmployerByUserId(session.user.id);
    if (!employer) {
      return NextResponse.json(
        { error: "Profil employer tidak ditemukan untuk pengguna ini" },
        { status: 404 }
      );
    }
    
    // Get the existing job
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Lowongan tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Verify that the job belongs to the authenticated employer
    if (job.employerId !== employer.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke lowongan ini" },
        { status: 403 }
      );
    }
    
    // Format the job data for the frontend
    const formattedJob = {
      ...job,
      // Convert postedDate to ISO string
      postedDate: job.postedDate.toISOString(),
    };
    
    return NextResponse.json({ job: formattedJob });
  } catch (error) {
    console.error("Error fetching job for edit:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lowongan untuk diedit" },
      { status: 500 }
    );
  }
}

export async function POST() {
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
