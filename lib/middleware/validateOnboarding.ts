import { NextRequest, NextResponse } from "next/server";
import { auth } from "lib/auth";
import {
  db,
  userProfiles,
  userAddresses,
  userPengalamanKerja,
  userPendidikan,
} from "@/lib/db";
import { eq, count } from "drizzle-orm";

// Import the optionalSteps array from OnboardingContext
// These are the steps that are optional in the onboarding flow
const optionalSteps = [6, 7, 8, 9]; // Pengalaman Kerja, Ekspektasi Kerja, CV Upload, and Foto Profile are optional

// Define a type for ekspektasiKerja to fix TypeScript errors
type EkspektasiKerja = {
  jobTypes?: string | null;
  idealSalary?: number | null;
  willingToTravel?: string | null;
  preferensiLokasiKerja?: string | null;
  [key: string]: any; // Allow for other properties
};

type ValidationResult = 
  | { isValid: true; userProfile: typeof userProfiles.$inferSelect }
  | { isValid: false; response: NextResponse; userProfile?: undefined };

export async function validateOnboardingCompletion(req: NextRequest): Promise<ValidationResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        isValid: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      };
    }

    // Get user profile
    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id as string));

    if (!userProfile) {
      return {
        isValid: false,
        response: NextResponse.json({ error: "User profile not found" }, { status: 404 })
      };
    }

    // Check required fields in user profile - Step 1 and 2
    if (!userProfile.namaLengkap || !userProfile.email || !userProfile.nomorTelepon || !userProfile.tanggalLahir || !userProfile.tempatLahir) {
      return {
        isValid: false,
        response: NextResponse.json({
          error: "Incomplete profile information",
          missingFields: ["Basic profile information is incomplete"]
        }, { status: 400 })
      };
    }

    // Check for address - Step 3
    const [addressCount] = await db
      .select({ count: count() })
      .from(userAddresses)
      .where(eq(userAddresses.userProfileId, userProfile.id));

    if (!addressCount || addressCount.count === 0) {
      return {
        isValid: false,
        response: NextResponse.json({
          error: "Incomplete profile information",
          missingFields: ["Address information is missing"]
        }, { status: 400 })
      };
    }

    // Check for education - Step 4
    const [educationCount] = await db
      .select({ count: count() })
      .from(userPendidikan)
      .where(eq(userPendidikan.userProfileId, userProfile.id));

    if (!educationCount || educationCount.count === 0) {
      return {
        isValid: false,
        response: NextResponse.json({
          error: "Incomplete profile information",
          missingFields: ["Education information is missing"]
        }, { status: 400 })
      };
    }

    // Check for level pengalaman - Step 5
    if (!userProfile.levelPengalaman) {
      return {
        isValid: false,
        response: NextResponse.json({
          error: "Incomplete profile information",
          missingFields: ["Level pengalaman is missing"]
        }, { status: 400 })
      };
    }
    
    // Note: Steps 6, 7, 8, and 9 are optional, so we don't validate them

    // All validations passed
    return {
      isValid: true,
      userProfile
    };
  } catch (error) {
    console.error("Error validating onboarding completion:", error);
    return {
      isValid: false,
      response: NextResponse.json({ error: "Failed to validate onboarding completion" }, { status: 500 })
    };
  }
} 
