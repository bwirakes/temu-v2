import { NextRequest, NextResponse } from "next/server";
import { getJobById, getEmployerByUserId } from "@/lib/db";
import { auth } from '@/lib/auth';

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Access params asynchronously
    const { id: jobId } = params;
    
    if (!jobId) {
      console.error('Missing job ID in params');
      return NextResponse.json(
        { error: 'ID lowongan tidak diberikan' },
        { status: 400 }
      );
    }
    
    console.log(`API: Fetching job details for ID: ${jobId}`);
    
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      console.error('Unauthorized: No user session');
      return NextResponse.json(
        { error: 'Unauthorized: Anda harus login terlebih dahulu' },
        { status: 401 }
      );
    }

    console.log(`API: User authenticated with ID: ${session.user.id}`);

    // Get employer ID from the user ID
    const employer = await getEmployerByUserId(session.user.id);
    
    if (!employer) {
      console.error(`Employer not found for user ID: ${session.user.id}`);
      return NextResponse.json(
        { error: 'Tidak ditemukan: Akun employer tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log(`API: Found employer with ID: ${employer.id}`);

    // Get job details
    console.log(`API: Fetching job with ID: ${jobId}`);
    const job = await getJobById(jobId);
    
    if (!job) {
      console.log(`API: Job with ID ${jobId} not found`);
      return NextResponse.json(
        { error: 'Lowongan tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log(`API: Job found: ${job.jobTitle}`);
    console.log(`API: Job employerId: ${job.employerId}, Current employer ID: ${employer.id}`);

    // Ensure the job belongs to the authenticated employer
    if (job.employerId !== employer.id) {
      console.error(`Access denied: Job ${jobId} belongs to employer ${job.employerId}, not ${employer.id}`);
      return NextResponse.json(
        { error: 'Forbidden: Anda tidak memiliki akses ke lowongan ini' },
        { status: 403 }
      );
    }

    // Add mock application count for now
    // In a real implementation, you would fetch the actual count from the database
    const jobWithApplicationCount = {
      ...job,
      applicationCount: Math.floor(Math.random() * 50) // Mock data
    };

    console.log('API: Returning job data');
    return NextResponse.json({ job: jobWithApplicationCount });
  } catch (error) {
    console.error('Error fetching job details:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil detail lowongan' },
      { status: 500 }
    );
  }
} 