import { NextRequest, NextResponse } from "next/server";
import { auth } from "lib/auth";
import {
  db,
  userProfiles,
  userAddresses,
  userPengalamanKerja,
  userPendidikan,
  userKeahlian,
  userBahasa
} from "@/lib/db";
import { eq, count } from "drizzle-orm";

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

    // Check required fields in user profile
    if (!userProfile.namaLengkap || !userProfile.email || !userProfile.nomorTelepon || !userProfile.tanggalLahir) {
      return {
        isValid: false,
        response: NextResponse.json({
          error: "Incomplete profile information",
          missingFields: ["Basic profile information is incomplete"]
        }, { status: 400 })
      };
    }

    // Check for address
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

    // Check for work experience
    const [workExperienceCount] = await db
      .select({ count: count() })
      .from(userPengalamanKerja)
      .where(eq(userPengalamanKerja.userProfileId, userProfile.id));

    // Check for education
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

    // Check for skills
    const [skillsCount] = await db
      .select({ count: count() })
      .from(userKeahlian)
      .where(eq(userKeahlian.userProfileId, userProfile.id));

    if (!skillsCount || skillsCount.count === 0) {
      return {
        isValid: false,
        response: NextResponse.json({
          error: "Incomplete profile information",
          missingFields: ["Skills information is missing"]
        }, { status: 400 })
      };
    }

    // Check for languages
    const [languagesCount] = await db
      .select({ count: count() })
      .from(userBahasa)
      .where(eq(userBahasa.userProfileId, userProfile.id));

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
