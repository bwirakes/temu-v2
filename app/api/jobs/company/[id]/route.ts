import { NextRequest, NextResponse } from "next/server";
import { getJobsByEmployerId } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Access params asynchronously
    const employerId = await params.id;
    
    if (!employerId) {
      console.error('Missing employer ID in params');
      return NextResponse.json(
        { error: 'Employer ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`API: Fetching jobs for employer ID: ${employerId}`);
    
    // Get all jobs for this employer
    const allJobs = await getJobsByEmployerId(employerId);
    
    // Filter for confirmed jobs only and sort by posted date (newest first)
    const jobs = allJobs
      .filter(job => job.isConfirmed)
      .sort((a, b) => {
        const dateA = new Date(a.postedDate).getTime();
        const dateB = new Date(b.postedDate).getTime();
        return dateB - dateA;
      });

    console.log(`API: Found ${jobs.length} jobs for employer ID: ${employerId}`);
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching jobs' },
      { status: 500 }
    );
  }
} 