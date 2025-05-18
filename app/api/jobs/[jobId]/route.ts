import { NextRequest, NextResponse } from 'next/server';
import { getJobById, getJobByHumanId, getEmployerById, getJobWorkLocationsByJobId } from '@/lib/db';

export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  try {
    const jobId = params.jobId;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Check if jobId is a UUID or a human-readable ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
  
    // Use the appropriate function based on the ID format
    const job = isUuid 
      ? await getJobById(jobId)
      : await getJobByHumanId(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    // Get employer details
    const employer = await getEmployerById(job.employerId);
    
    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found" },
        { status: 404 }
      );
    }
    
    // Get job locations
    const locations = await getJobWorkLocationsByJobId(job.id);
    
    // Return job details with employer and locations
    return NextResponse.json({
      job,
      employer,
      locations
    });
    
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: "An error occurred while fetching the job" },
      { status: 500 }
    );
  }
} 