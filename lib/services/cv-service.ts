import { db } from '../db';
import { getUserProfileByUserId, getUserPengalamanKerjaByProfileId, getUserPendidikanByProfileId, getUserKeahlianByProfileId, getUserBahasaByProfileId, getUserSertifikasiByProfileId } from '../db';
import { eq } from 'drizzle-orm';
import { users, userProfiles, userAddresses, userSocialMedia as userSocialMediaTable } from '../db';
import { transformUserProfileToCV, CV } from '../models/cv';
import { getSampleCV, SampleCV } from '../sample-data/cv-sample';

export async function getCVByUserId(userId: string): Promise<CV> {
  try {
    // Get user profile
    const userProfile = await getUserProfileByUserId(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get user addresses
    const [userAddress] = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userProfileId, userProfile.id));

    // Get user social media
    const [userSocialMedia] = await db
      .select()
      .from(userSocialMediaTable)
      .where(eq(userSocialMediaTable.userProfileId, userProfile.id));

    // Get user experience
    const userExperience = await getUserPengalamanKerjaByProfileId(userProfile.id);

    // Get user education
    const userEducation = await getUserPendidikanByProfileId(userProfile.id);

    // Get user skills
    const userSkills = await getUserKeahlianByProfileId(userProfile.id);

    // Get user languages
    const userLanguages = await getUserBahasaByProfileId(userProfile.id);

    // Get user certifications
    const userCertifications = await getUserSertifikasiByProfileId(userProfile.id);

    // Transform data into CV format
    return await transformUserProfileToCV(
      userProfile,
      userExperience,
      userEducation,
      userSkills,
      userLanguages,
      userCertifications,
      userSocialMedia,
      userAddress
    );
  } catch (error) {
    console.error('Error fetching CV data:', error);
    throw error;
  }
}

export async function getCVByProfileId(profileId: string): Promise<CV> {
  try {
    // Get user profile
    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, profileId));

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get user addresses
    const [userAddress] = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userProfileId, userProfile.id));

    // Get user social media
    const [userSocialMedia] = await db
      .select()
      .from(userSocialMediaTable)
      .where(eq(userSocialMediaTable.userProfileId, userProfile.id));

    // Get user experience
    const userExperience = await getUserPengalamanKerjaByProfileId(userProfile.id);

    // Get user education
    const userEducation = await getUserPendidikanByProfileId(userProfile.id);

    // Get user skills
    const userSkills = await getUserKeahlianByProfileId(userProfile.id);

    // Get user languages
    const userLanguages = await getUserBahasaByProfileId(userProfile.id);

    // Get user certifications
    const userCertifications = await getUserSertifikasiByProfileId(userProfile.id);

    // Transform data into CV format
    return await transformUserProfileToCV(
      userProfile,
      userExperience,
      userEducation,
      userSkills,
      userLanguages,
      userCertifications,
      userSocialMedia,
      userAddress
    );
  } catch (error) {
    console.error('Error fetching CV data:', error);
    throw error;
  }
}

// Use our standalone sample data function
export async function getSampleUserCV(): Promise<SampleCV> {
  return getSampleCV();
} 
