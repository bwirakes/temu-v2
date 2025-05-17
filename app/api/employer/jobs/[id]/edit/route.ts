import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, getEmployerByUserId } from "@/lib/db";
import { z } from "zod";
import { auth } from '@/lib/auth';
import { revalidatePath } from "next/cache";

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

/**
 * Schema for validating job update data
 */
const jobUpdateSchema = z.object({
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
  isConfirmed: z.boolean().optional(),
});

/**
 * PUT handler for updating an existing job posting
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get job ID from params
    const jobId = await params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "ID lowongan tidak diberikan" },
        { status: 400 }
      );
    }
    
    // Get the authenticated user session
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
    const body = await request.json();

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
      // Handle date conversion for applicationDeadline if provided
      applicationDeadline: validationResult.data.applicationDeadline
        ? new Date(validationResult.data.applicationDeadline)
        : null,
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
  return PUT(request, { params });
}

/**
 * Handle other HTTP methods
 */
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get job ID from params
    const jobId = await params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "ID lowongan tidak diberikan" },
        { status: 400 }
      );
    }
    
    // Get the authenticated user session
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
      // Convert applicationDeadline to ISO string if it exists
      applicationDeadline: job.applicationDeadline 
        ? job.applicationDeadline.toISOString() 
        : null,
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
