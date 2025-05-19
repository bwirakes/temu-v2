import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/db";
import { z } from "zod";
import { nanoid } from "nanoid";

/**
 * Schema for validating job posting data
 */
const jobPostingSchema = z.object({
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
  postedDate: z.date().optional(),
  numberOfPositions: z.number().int().positive().optional(),
  workingHours: z.string().optional(),
  lastEducation: z.enum(["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"]).optional(),
  requiredCompetencies: z.string().optional(),
  acceptedDisabilityTypes: z.array(z.string()).optional(),
  numberOfDisabilityPositions: z.number().int().min(0).optional(),
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
      gender: z.enum(["MALE", "FEMALE", "ANY"]).optional(),
      requiredDocuments: z.string().optional(),
      specialSkills: z.string().optional(),
      technologicalSkills: z.string().optional(),
      suitableForDisability: z.boolean().optional(),
    })
    .optional(),
  isConfirmed: z.boolean().default(false),
});

/**
 * POST handler for creating a new job posting
 */
export async function POST(
  request: NextRequest
) {
  try {
    // Extract employerId from URL parameters
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get("employerId");

    // Validate employerId
    if (!employerId) {
      return NextResponse.json(
        { error: "Employer ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format using regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(employerId)) {
      return NextResponse.json(
        { error: "Invalid Employer ID format" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate job posting data
    const validationResult = jobPostingSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Generate a unique job ID
    const jobId = `JOB-${nanoid(10)}`;

    // Prepare data for insertion
    const jobData = {
      ...validationResult.data,
      employerId,
      jobId,
      // Handle date conversion for applicationDeadline if provided
      applicationDeadline: validationResult.data.applicationDeadline
        ? new Date(validationResult.data.applicationDeadline)
        : null,
    };

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
          { error: "Invalid employer ID. The specified employer does not exist." },
          { status: 400 }
        );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { error: "Failed to create job posting. Please try again later." },
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