import { NextRequest, NextResponse } from "next/server";
import { 
  getJobById, 
  getEmployerByUserId, 
  getJobWorkLocationsByJobId, 
  createJobWorkLocation,
  db,
  jobWorkLocations
} from "@/lib/db";
import { z } from "zod";
import { auth } from '@/lib/auth';
import { eq } from "drizzle-orm";
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
 * Schema for validating job work location data
 */
const jobWorkLocationSchema = z.object({
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  isRemote: z.boolean().default(false),
  address: z.string().optional(),
});

/**
 * GET handler for retrieving job work locations
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
    
    // Get the existing job to check ownership
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
    
    // Get job work locations
    const locations = await getJobWorkLocationsByJobId(jobId);
    
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching job work locations:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data lokasi kerja" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new job work location
 */
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    
    // Get the existing job to check ownership
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
    
    // Parse request body
    const body = await req.json();
    
    // Validate job work location data
    const validationResult = jobWorkLocationSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: "Validasi gagal", details: errors },
        { status: 400 }
      );
    }
    
    // Create job work location
    const location = await createJobWorkLocation({
      ...validationResult.data,
      jobId,
    });
    
    // Revalidate relevant pages to update the static content
    revalidatePath(`/employer/jobs/${jobId}`);
    revalidatePath(`/job-detail/${jobId}`);
    
    return NextResponse.json({
      location,
      revalidated: true
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating job work location:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan lokasi kerja" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing all job work locations before adding new ones
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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
    
    // Get the existing job to check ownership
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
    
    // Delete all work locations for this job
    await db.delete(jobWorkLocations).where(eq(jobWorkLocations.jobId, jobId));
    
    // Revalidate relevant pages to update the static content
    revalidatePath(`/employer/jobs/${jobId}`);
    revalidatePath(`/job-detail/${jobId}`);
    
    return NextResponse.json({
      success: true,
      message: "Semua lokasi kerja berhasil dihapus",
      revalidated: true
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting job work locations:", error);
    return NextResponse.json(
      { error: "Gagal menghapus lokasi kerja" },
      { status: 500 }
    );
  }
} 