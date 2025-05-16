import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, getEmployerById } from "@/lib/db";

/**
 * PATCH handler for updating job confirmation status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { employerId: string; jobId: string } }
) {
  try {
    // Extract parameters
    const { employerId, jobId } = params;

    // Validate parameters
    if (!employerId || !jobId) {
      return NextResponse.json(
        { error: "Employer ID and Job ID are required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(employerId) || !uuidRegex.test(jobId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Check if employer exists
    const employer = await getEmployerById(employerId);
    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found" },
        { status: 404 }
      );
    }

    // Get the job
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Verify that the job belongs to the specified employer
    if (job.employerId !== employerId) {
      return NextResponse.json(
        { error: "Job does not belong to the specified employer" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { isConfirmed } = body;

    // Validate isConfirmed field
    if (typeof isConfirmed !== 'boolean') {
      return NextResponse.json(
        { error: "isConfirmed must be a boolean value" },
        { status: 400 }
      );
    }

    // Update the job confirmation status
    const updatedJob = await updateJob(jobId, { isConfirmed });

    // Return the updated job
    return NextResponse.json(updatedJob, { status: 200 });
  } catch (error) {
    console.error("Error updating job confirmation status:", error);
    return NextResponse.json(
      { error: "Failed to update job confirmation status" },
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