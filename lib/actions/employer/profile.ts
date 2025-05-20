'use server';

import { getEmployerByUserId, updateEmployer, createEmployer } from "@/lib/db";
import { redirect } from "next/navigation";
import { getEmployerSession } from "@/lib/auth-utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateUserOnboardingStatus } from "@/lib/db";
import {
  EmployerProfileData,
  ActionResult,
  companyInfoSettingsSchema,
  onlinePresenceSettingsSchema,
  picSettingsSchema,
  employerProfileSchema
} from "@/lib/schemas/employer-profile";

/**
 * Server action to fetch employer profile data for the authenticated user
 * This handles auth checks and data fetching in a server context
 */
export async function getEmployerProfileData(): Promise<EmployerProfileData | null> {
  try {
    console.log('Starting getEmployerProfileData function');
    
    // Get typed session for employer (throws error if not authenticated or wrong user type)
    const session = await getEmployerSession();
    console.log('Session retrieved:', session.user?.id, session.user?.userType);
    
    // Ensure user is available (should always be true after getEmployerSession)
    if (!session.user || !session.user.id) {
      console.log('Session user or ID is missing, redirecting to signin');
      redirect("/auth/signin?callbackUrl=/employer");
    }
    
    // Get employer data using the server-side function
    console.log('Fetching employer data for user ID:', session.user.id);
    const employerData = await getEmployerByUserId(session.user.id);
    console.log('Employer data result:', employerData ? 'Found' : 'Not found');
    
    if (!employerData) {
      console.log('No employer data found for user ID:', session.user.id);
      // Instead of returning null, let's create a placeholder data object
      return {
        id: '',
        userId: session.user.id,
        namaPerusahaan: '',
        industri: '',
        alamatKantor: '',
        email: session.user.email || '',
        pic: {
          nama: '',
          nomorTelepon: ''
        },
        // Default empty values for optional fields
        merekUsaha: '',
        website: '',
        socialMedia: null,
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    console.log('Returning employer data for user ID:', session.user.id);
    return employerData as EmployerProfileData;
  } catch (error) {
    console.error('Error fetching employer profile data:', error);
    
    // Redirect to sign-in page if authentication error
    if (error instanceof Error && error.message.includes('Authentication required')) {
      redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/employer")}`);
    }
    
    // Redirect to home page if user type error
    if (error instanceof Error && error.message.includes('Only employers')) {
      console.log('Profile page: Non-job-seeker attempting to access profile, redirecting');
      redirect("/");
    }
    
    return null;
  }
}

/**
 * Server action to update employer profile data
 */
export async function updateEmployerProfile(formData: FormData): Promise<{ 
  success: boolean; 
  message: string; 
  errors?: Record<string, string[]>;
}> {
  try {
    // Get typed session for employer
    const session = await getEmployerSession();
    
    // Ensure user is available
    if (!session.user || !session.user.id) {
      return {
        success: false,
        message: "Authentication required",
      };
    }
    
    // Get current employer data
    const currentEmployer = await getEmployerByUserId(session.user.id);
    
    if (!currentEmployer) {
      return {
        success: false,
        message: "Employer profile not found",
      };
    }
    
    // Parse form data
    const profileData = {
      namaPerusahaan: formData.get('namaPerusahaan') as string,
      merekUsaha: formData.get('merekUsaha') as string,
      industri: formData.get('industri') as string,
      alamatKantor: formData.get('alamatKantor') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      socialMedia: {
        instagram: formData.get('instagram') as string,
        linkedin: formData.get('linkedin') as string,
        facebook: formData.get('facebook') as string,
        twitter: formData.get('twitter') as string,
        tiktok: formData.get('tiktok') as string,
      },
      pic: {
        nama: formData.get('picNama') as string,
        nomorTelepon: formData.get('picNomorTelepon') as string,
      },
    };
    
    // Validate the data
    const result = employerProfileSchema.safeParse(profileData);
    
    if (!result.success) {
      return {
        success: false,
        message: "Data tidak valid",
        errors: result.error.flatten().fieldErrors,
      };
    }
    
    // Update the employer profile
    await updateEmployer(currentEmployer.id, result.data);
    
    // Revalidate the employer profile page
    revalidatePath('/employer/dashboard');
    
    return {
      success: true,
      message: "Profil berhasil diperbarui",
    };
  } catch (error) {
    console.error('Error updating employer profile:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui profil",
    };
  }
}

/**
 * Server action to update employer logo
 */
export async function updateEmployerLogo(formData: FormData): Promise<{ 
  success: boolean; 
  message: string;
  logoUrl?: string;
}> {
  try {
    // Get typed session for employer
    const session = await getEmployerSession();
    
    // Ensure user is available
    if (!session.user || !session.user.id) {
      return {
        success: false,
        message: "Authentication required",
      };
    }
    
    // Get current employer data
    const currentEmployer = await getEmployerByUserId(session.user.id);
    
    if (!currentEmployer) {
      return {
        success: false,
        message: "Employer profile not found",
      };
    }
    
    // Get the logo file from form data
    const logoFile = formData.get('logo') as File;
    
    if (!logoFile || logoFile.size === 0) {
      return {
        success: false,
        message: "No logo file provided",
      };
    }
    
    // TODO: Implement file upload to cloud storage
    // For now, we'll just simulate a successful upload with a placeholder URL
    const logoUrl = `/uploads/employer-logos/${Date.now()}-${logoFile.name}`;
    
    // Update the employer profile with the new logo URL
    await updateEmployer(currentEmployer.id, { logoUrl });
    
    // Revalidate the employer profile page
    revalidatePath('/employer/settings');
    
    return {
      success: true,
      message: "Logo berhasil diperbarui",
      logoUrl,
    };
  } catch (error) {
    console.error('Error updating employer logo:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui logo",
    };
  }
}

/**
 * Server action to create a new employer profile if one doesn't exist
 */
export async function createEmployerProfileIfNotExists(formData: FormData): Promise<{ 
  success: boolean; 
  message: string; 
  employerId?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    console.log('Starting createEmployerProfileIfNotExists function');
    
    // Get typed session for employer
    const session = await getEmployerSession();
    console.log('Session retrieved for user:', session.user?.id);
    
    // Ensure user is available
    if (!session.user || !session.user.id) {
      console.log('No user in session, returning authentication error');
      return {
        success: false,
        message: "Authentication required",
      };
    }
    
    // Check if employer profile already exists
    console.log('Checking if employer profile exists for user:', session.user.id);
    const existingEmployer = await getEmployerByUserId(session.user.id);
    
    if (existingEmployer) {
      console.log('Employer profile already exists with ID:', existingEmployer.id);
      return {
        success: true,
        message: "Employer profile already exists",
        employerId: existingEmployer.id,
      };
    }
    
    console.log('No existing employer profile found, creating new profile');
    
    // Parse form data
    const profileData = {
      userId: session.user.id,
      namaPerusahaan: formData.get('namaPerusahaan') as string,
      merekUsaha: (formData.get('merekUsaha') as string) || null,
      industri: formData.get('industri') as string,
      alamatKantor: formData.get('alamatKantor') as string,
      email: formData.get('email') as string || session.user.email || '',
      website: (formData.get('website') as string) || null,
      socialMedia: {
        instagram: formData.get('instagram') as string,
        linkedin: formData.get('linkedin') as string,
        facebook: formData.get('facebook') as string,
        twitter: formData.get('twitter') as string,
        tiktok: formData.get('tiktok') as string,
      },
      pic: {
        nama: formData.get('picNama') as string,
        nomorTelepon: formData.get('picNomorTelepon') as string,
      },
    };
    
    console.log('Parsed form data:', {
      namaPerusahaan: profileData.namaPerusahaan,
      email: profileData.email,
      // Other fields omitted for brevity
    });
    
    // Validate the data
    const result = employerProfileSchema.safeParse(profileData);
    
    if (!result.success) {
      console.log('Validation failed:', result.error.flatten().fieldErrors);
      return {
        success: false,
        message: "Data tidak valid",
        errors: result.error.flatten().fieldErrors,
      };
    }
    
    console.log('Data validation passed, creating employer profile');
    
    // Create the employer profile
    const newEmployer = await createEmployer({
      userId: session.user.id,
      namaPerusahaan: profileData.namaPerusahaan,
      merekUsaha: profileData.merekUsaha,
      industri: profileData.industri,
      alamatKantor: profileData.alamatKantor,
      email: profileData.email,
      website: profileData.website,
      socialMedia: profileData.socialMedia,
      pic: profileData.pic,
    });
    
    if (!newEmployer) {
      console.log('Failed to create employer profile - unknown error');
      return {
        success: false,
        message: "Failed to create employer profile",
      };
    }
    
    console.log('Successfully created employer profile with ID:', newEmployer.id);
    
    // Update user's onboarding status
    try {
      await updateUserOnboardingStatus(session.user.id, true);
      console.log('Updated user onboarding status to true');
    } catch (error) {
      console.error('Error updating user onboarding status:', error);
      // Continue even if this fails
    }
    
    // Revalidate the employer profile page
    revalidatePath('/employer');
    
    return {
      success: true,
      message: "Employer profile created successfully",
      employerId: newEmployer.id,
    };
  } catch (error) {
    console.error('Error creating employer profile:', error);
    
    // Add specific error handling for common database errors
    const errorMessage = error instanceof Error ? error.message : "Failed to create employer profile";
    
    // Handle potential database constraint errors more gracefully
    if (error instanceof Error && 
        (errorMessage.includes('unique constraint') || 
         errorMessage.includes('duplicate key'))) {
      return {
        success: false,
        message: "An employer profile with this information already exists",
      };
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Server action to update company information
 */
export async function updateCompanyInfoAction(
  data: z.infer<typeof companyInfoSettingsSchema>
): Promise<ActionResult> {
  try {
    const session = await getEmployerSession();
    if (!session.user?.id) return { success: false, message: "Authentication required." };

    const validation = companyInfoSettingsSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: "Data tidak valid.", errors: validation.error.flatten().fieldErrors };
    }

    let employer = await getEmployerByUserId(session.user.id);
    let isNewProfile = false;
    const employerEmail = session.user.email || '';

    if (!employer) {
      // Profile doesn't exist, create it
      const createData = {
        userId: session.user.id,
        ...validation.data, // company info from form
        email: employerEmail, // Default company email
        pic: { nama: '', nomorTelepon: '' }, // Default empty PIC
        // Ensure all other non-nullable fields required by `createEmployer` have defaults
        merekUsaha: validation.data.merekUsaha || null,
        website: null,
        socialMedia: null,
        logoUrl: null,
      };
      employer = await createEmployer(createData);
      if (!employer) {
        return { success: false, message: "Gagal membuat profil perusahaan." };
      }
      await updateUserOnboardingStatus(session.user.id, true);
      isNewProfile = true;
    } else {
      // Profile exists, update it
      await updateEmployer(employer.id, validation.data);
    }

    revalidatePath('/employer/settings');
    revalidatePath('/employer');
    if (employer?.id) revalidatePath(`/careers/${employer.id}`); 

    return { 
      success: true, 
      message: isNewProfile ? "Profil perusahaan berhasil dibuat." : "Informasi perusahaan berhasil diperbarui.",
      employerId: employer.id 
    };
  } catch (error) {
    console.error("Error updating company info:", error);
    return { success: false, message: error instanceof Error ? error.message : "Gagal memperbarui informasi." };
  }
}

/**
 * Server action to update online presence information
 */
export async function updateOnlinePresenceAction(
  data: z.infer<typeof onlinePresenceSettingsSchema>
): Promise<ActionResult> {
  try {
    const session = await getEmployerSession();
    if (!session.user?.id) return { success: false, message: "Authentication required." };

    const validation = onlinePresenceSettingsSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: "Data tidak valid.", errors: validation.error.flatten().fieldErrors };
    }
    
    let employer = await getEmployerByUserId(session.user.id);
    let isNewProfile = false;
    const employerEmail = session.user.email || '';

    const { website, ...socialFields } = validation.data;
    const socialMediaUpdate: Record<string, string> = {};
    let hasSocialMedia = false;
    for (const key in socialFields) {
        const socialKey = key as keyof typeof socialFields;
        if (socialFields[socialKey]) {
            socialMediaUpdate[socialKey] = socialFields[socialKey] as string;
            hasSocialMedia = true;
        }
    }

    const updateData = {
      website: website || null,
      socialMedia: hasSocialMedia ? socialMediaUpdate : null,
    };

    if (!employer) {
      const createData = {
        userId: session.user.id,
        namaPerusahaan: '', // Requires user to fill company info form for these
        industri: '',
        alamatKantor: '',
        email: employerEmail,
        pic: { nama: '', nomorTelepon: '' },
        ...updateData, // Add online presence data
      };
      employer = await createEmployer(createData);
      if (!employer) return { success: false, message: "Gagal membuat profil perusahaan. Harap lengkapi informasi dasar perusahaan terlebih dahulu." };
      await updateUserOnboardingStatus(session.user.id, true);
      isNewProfile = true;
    } else {
      await updateEmployer(employer.id, updateData);
    }
    
    revalidatePath('/employer/settings');
    revalidatePath('/employer');
    if (employer?.id) revalidatePath(`/careers/${employer.id}`);
    return { 
        success: true, 
        message: isNewProfile ? "Profil perusahaan dibuat dan kehadiran online diperbarui." : "Kehadiran online berhasil diperbarui.",
        employerId: employer.id
    };
  } catch (error) {
    console.error("Error updating online presence:", error);
    return { success: false, message: error instanceof Error ? error.message : "Gagal memperbarui kehadiran online." };
  }
}

/**
 * Server action to update PIC information
 */
export async function updatePicInfoAction(
  data: z.infer<typeof picSettingsSchema>
): Promise<ActionResult> {
  try {
    const session = await getEmployerSession();
    if (!session.user?.id) return { success: false, message: "Authentication required." };

    const validation = picSettingsSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: "Data tidak valid.", errors: validation.error.flatten().fieldErrors };
    }

    let employer = await getEmployerByUserId(session.user.id);
    let isNewProfile = false;
    const employerEmail = session.user.email || '';

    if (!employer) {
      const createData = {
        userId: session.user.id,
        namaPerusahaan: '', // Requires user to fill company info form for these
        industri: '',
        alamatKantor: '',
        email: employerEmail,
        pic: validation.data, // Add PIC data
      };
      employer = await createEmployer(createData);
      if (!employer) return { success: false, message: "Gagal membuat profil perusahaan. Harap lengkapi informasi dasar perusahaan terlebih dahulu." };
      await updateUserOnboardingStatus(session.user.id, true);
      isNewProfile = true;
    } else {
      await updateEmployer(employer.id, { pic: validation.data });
    }
    
    revalidatePath('/employer/settings');
    revalidatePath('/employer');
    return { 
        success: true, 
        message: isNewProfile ? "Profil perusahaan dibuat dan PIC diperbarui." : "Informasi PIC berhasil diperbarui.",
        employerId: employer.id
    };
  } catch (error) {
    console.error("Error updating PIC info:", error);
    return { success: false, message: error instanceof Error ? error.message : "Gagal memperbarui informasi PIC." };
  }
} 