import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, getEmployerByUserId } from "@/lib/db";
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
 * PATCH handler for updating job confirmation status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract job ID from params asynchronously
    const jobId = await params.id;

    // Validate job ID
    if (!jobId) {
      return NextResponse.json(
        { error: "ID lowongan diperlukan" },
        { status: 400 }
      );
    }

    // Get the authenticated user's session
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

    // Get the job
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
    const body = await request.json();
    const { isConfirmed } = body;

    // Validate isConfirmed field
    if (typeof isConfirmed !== 'boolean') {
      return NextResponse.json(
        { error: "isConfirmed harus berupa nilai boolean" },
        { status: 400 }
      );
    }

    // Update the job confirmation status
    const updatedJob = await updateJob(jobId, { isConfirmed });

    // Revalidate the job detail page to update the static content
    revalidatePath(`/employer/jobs/${jobId}`);
    
    // Also revalidate the public job detail page if it exists
    revalidatePath(`/job-detail/${jobId}`);
    
    // Revalidate the jobs listing page
    revalidatePath('/employer/jobs');

    // Return the updated job
    return NextResponse.json({
      job: updatedJob,
      revalidated: true
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating job confirmation status:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status konfirmasi lowongan" },
      { status: 500 }
    );
  }
}

/**
 * Handle other HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
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