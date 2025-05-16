import { NextRequest, NextResponse } from "next/server";
import { createJob, getEmployerByUserId } from "@/lib/db";
import { z } from "zod";
// Assuming you have an auth function like NextAuth's auth()
import { auth } from '@/lib/auth';// Adjust import based on your auth setup

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
  isConfirmed: z.boolean().default(false),
});

/**
 * POST handler for creating a new job posting
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the employer ID for the authenticated user
    const employer = await getEmployerByUserId(session.user.id);
    if (!employer) {
       // This might happen if a user is authenticated but not set up as an employer
       // or if the employer record was deleted.
      return NextResponse.json(
        { error: "Employer profile not found for this user" },
        { status: 404 }
      );
    }
    const employerId = employer.id;


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

    // Prepare data for insertion
    const jobData = {
      ...validationResult.data,
      employerId, // Use the fetched and verified employerId
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
        // This specific error handling might be less relevant now if employerId is fetched internally
        // but keeping it as an example.
        return NextResponse.json(
          { error: "Database constraint error" },
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