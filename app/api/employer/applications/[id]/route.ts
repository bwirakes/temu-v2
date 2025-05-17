import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { 
  db, 
  getJobApplicationById,
  getJobById,
  getEmployerByUserId,
  updateJobApplicationStatus,
  applicationStatusEnum
} from '@/lib/db';
import { z } from "zod";
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

// Validate the request body using Zod
const updateStatusSchema = z.object({
  status: z.enum(applicationStatusEnum.enumValues)
});

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Get the application ID from params
    const applicationId = await params.id;
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'ID aplikasi tidak diberikan' },
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

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const result = updateStatusSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Status tidak valid', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { status } = result.data;

    // Get the application
    const application = await getJobApplicationById(applicationId);
    
    if (!application) {
      return NextResponse.json(
        { error: 'Aplikasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get the job to check if the employer owns it
    const job = await getJobById(application.jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Lowongan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if the job belongs to the authenticated employer
    if (job.employerId !== employer.id) {
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses ke aplikasi ini' },
        { status: 403 }
      );
    }

    // Update the application status
    const updatedApplication = await updateJobApplicationStatus(applicationId, status);

    // Revalidate the job detail page to update applicant count and status
    revalidatePath(`/employer/jobs/${job.id}`);
    
    // Also revalidate the applicant detail page if it exists
    revalidatePath(`/employer/applicants/${applicationId}`);

    // Return the updated application
    return NextResponse.json({
      success: true,
      application: updatedApplication,
      revalidated: true
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui status aplikasi' },
      { status: 500 }
    );
  }
} 