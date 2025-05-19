import 'server-only';

import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  uuid,
  boolean,
  json,
  jsonb,
  primaryKey,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, and } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Define onboarding steps directly here for server-side use
const onboardingSteps = [
  { id: 1, path: "/job-seeker/onboarding/informasi-dasar", title: "Informasi Dasar" },
  { id: 2, path: "/job-seeker/onboarding/informasi-lanjutan", title: "Informasi Lanjutan" },
  { id: 3, path: "/job-seeker/onboarding/alamat", title: "Alamat" },
  { id: 4, path: "/job-seeker/onboarding/pendidikan", title: "Pendidikan" },
  { id: 5, path: "/job-seeker/onboarding/level-pengalaman", title: "Level Pengalaman" },
  { id: 6, path: "/job-seeker/onboarding/pengalaman-kerja", title: "Pengalaman Kerja" },
  { id: 7, path: "/job-seeker/onboarding/ekspektasi-kerja", title: "Ekspektasi Kerja" },
  { id: 8, path: "/job-seeker/onboarding/cv-upload", title: "CV Upload" },
  { id: 9, path: "/job-seeker/onboarding/foto-profile", title: "Foto Profil" },
  { id: 10, path: "/job-seeker/onboarding/ringkasan", title: "Ringkasan" },
];

// For improved performance in serverless environments
const globalForPg = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
};

// Initialize PostgreSQL connection
const sql = globalForPg.sql ?? postgres(process.env.POSTGRES_URL!, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

// Save the connection in the global object in development to prevent multiple connections during hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPg.sql = sql;
}

// Create drizzle database instance
export const db = drizzle(sql);

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const jenisKelaminEnum = pgEnum('jenis_kelamin', ['Laki-laki', 'Perempuan', 'Lainnya']);
export const lokasiKerjaEnum = pgEnum('lokasi_kerja', ['WFH', 'WFO', 'Hybrid']);
export const tingkatKeahlianEnum = pgEnum('tingkat_keahlian', ['Pemula', 'Menengah', 'Mahir']);
export const agamaEnum = pgEnum('agama', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']);
export const levelPengalamanEnum = pgEnum('level_pengalaman', [
  'Baru lulus',
  'Pengalaman magang',
  'Kurang dari 1 tahun',
  '1-2 tahun',
  '3-5 tahun',
  '5-10 tahun',
  '10 tahun lebih'
]);
export const willingToTravelEnum = pgEnum('willing_to_travel', ['local_only', 'jabodetabek', 'anywhere']);
export const applicationStatusEnum = pgEnum('application_status', [
  'SUBMITTED',
  'REVIEWING',
  'INTERVIEW',
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN'
]);
export const userTypeEnum = pgEnum('user_type', ['job_seeker', 'employer']);
export const lastEducationEnum = pgEnum('last_education', [
  'SD',
  'SMP',
  'SMA/SMK',
  'D1',
  'D2',
  'D3',
  'D4',
  'S1',
  'S2',
  'S3'
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  password: text('password'),
  image: text('image'),
  userType: userTypeEnum('user_type').notNull().default('job_seeker'),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state')
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  expires: timestamp('expires').notNull()
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull()
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  namaLengkap: text('nama_lengkap').notNull(),
  email: text('email').notNull(),
  nomorTelepon: text('nomor_telepon').notNull(),
  tanggalLahir: text('tanggal_lahir').notNull(),
  tempatLahir: text('tempat_lahir'),
  jenisKelamin: jenisKelaminEnum('jenis_kelamin'),
  cvFileUrl: text('cv_file_url'),
  cvUploadDate: timestamp('cv_upload_date'),
  profilePhotoUrl: text('profile_photo_url'),
  levelPengalaman: text('level_pengalaman'),
  ekspektasiKerja: jsonb('ekspektasi_kerja'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userAddresses = pgTable('user_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  jalan: text('jalan'),
  rt: text('rt'),
  rw: text('rw'),
  kelurahan: text('kelurahan'),
  kecamatan: text('kecamatan'),
  kota: text('kota'),
  provinsi: text('provinsi'),
  kodePos: text('kode_pos'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userPengalamanKerja = pgTable('user_pengalaman_kerja', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  levelPengalaman: levelPengalamanEnum('level_pengalaman').notNull(),
  namaPerusahaan: text('nama_perusahaan').notNull(),
  posisi: text('posisi').notNull(),
  tanggalMulai: text('tanggal_mulai').notNull(),
  tanggalSelesai: text('tanggal_selesai').notNull(),
  deskripsiPekerjaan: text('deskripsi_pekerjaan'),
  lokasiKerja: lokasiKerjaEnum('lokasi_kerja'),
  lokasi: text('lokasi'),
  alasanKeluar: text('alasan_keluar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userPendidikan = pgTable('user_pendidikan', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  namaInstitusi: text('nama_institusi').notNull(),
  jenjangPendidikan: text('jenjang_pendidikan').notNull(),
  bidangStudi: text('bidang_studi').notNull(),
  tanggalLulus: text('tanggal_lulus').notNull(),
  nilaiAkhir: text('nilai_akhir'),
  lokasi: text('lokasi'),
  deskripsiTambahan: text('deskripsi_tambahan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const employers = pgTable('employers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  namaPerusahaan: text('nama_perusahaan').notNull(),
  merekUsaha: text('merek_usaha'),
  industri: text('industri').notNull(),
  alamatKantor: text('alamat_kantor').notNull(),
  email: text('email').notNull(),
  website: text('website'),
  socialMedia: jsonb('social_media').$type<{
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  }>(),
  logoUrl: text('logo_url'),
  pic: jsonb('pic').$type<{
    nama: string;
    nomorTelepon: string;
  }>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  employerId: uuid('employer_id')
    .notNull()
    .references(() => employers.id, { onDelete: 'cascade' }),
  jobId: text('job_id').notNull(),
  jobTitle: text('job_title').notNull(),
  minWorkExperience: integer('min_work_experience').notNull(),
  postedDate: timestamp('posted_date').defaultNow().notNull(),
  numberOfPositions: integer('number_of_positions'),
  lastEducation: lastEducationEnum('last_education'),
  requiredCompetencies: jsonb('required_competencies').$type<string[]>(),
  expectations: jsonb('expectations').$type<{
    ageRange?: {
      min: number;
      max: number;
    };
  }>(),
  additionalRequirements: jsonb('additional_requirements').$type<{
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    acceptedDisabilityTypes?: string[];
    numberOfDisabilityPositions?: number;
  }>(),
  isConfirmed: boolean('is_confirmed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const jobWorkLocations = pgTable('job_work_locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  city: text('city').notNull(),
  province: text('province').notNull(),
  isRemote: boolean('is_remote').default(false).notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const jobApplications = pgTable('job_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicantProfileId: uuid('applicant_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  status: applicationStatusEnum('status').default('SUBMITTED').notNull(),
  additionalNotes: text('additional_notes'),
  education: lastEducationEnum('education'),
  resumeUrl: text('resume_url'),
  cvFileUrl: text('cv_file_url'),
}, (t) => {
  return {
    unqApplicantJob: uniqueIndex('unq_applicant_job').on(t.applicantProfileId, t.jobId),
  };
});

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  
  return user;
}

export async function getUserProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  
  return profile;
}

// Define the InsertUserProfile type
export type InsertUserProfile = {
  userId: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tanggalLahir: string;
  tempatLahir?: string | null;
  jenisKelamin?: typeof jenisKelaminEnum.enumValues[number] | null;
  cvFileUrl?: string | null;
  cvUploadDate?: Date | null;
  profilePhotoUrl?: string | null;
  levelPengalaman?: string | null;
  ekspektasiKerja?: any | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function createUserProfile(data: InsertUserProfile) {
  try {
    // Validate required fields, but be more flexible with tanggalLahir during initial creation
    if (!data.userId || !data.namaLengkap || !data.email || !data.nomorTelepon) {
      throw new Error("Missing required user profile fields: userId, namaLengkap, email, or nomorTelepon");
    }

    // Ensure tanggalLahir has at least a placeholder value
    if (!data.tanggalLahir) {
      data.tanggalLahir = "1900-01-01"; // Default placeholder date
    }

    const [profile] = await db
      .insert(userProfiles)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return profile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      throw new Error("A profile with this email already exists");
    }
    throw error; // Re-throw the error
  }
}

export async function updateUserProfile(id: string, data: Partial<InsertUserProfile>) {
  try {
    // Don't allow updating userId
    if ('userId' in data) {
      delete data.userId;
    }
    
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(userProfiles.id, id))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`User profile with ID ${id} not found`);
    }
    
    return updatedProfile;
  } catch (error) {
    console.error(`Error updating user profile ${id}:`, error);
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      throw new Error("A profile with this email already exists");
    }
    throw error; // Re-throw the error
  }
}

export async function getUserPengalamanKerjaByProfileId(profileId: string) {
  return await db
    .select()
    .from(userPengalamanKerja)
    .where(eq(userPengalamanKerja.userProfileId, profileId));
}

export async function getUserPendidikanByProfileId(profileId: string) {
  return await db
    .select()
    .from(userPendidikan)
    .where(eq(userPendidikan.userProfileId, profileId));
}

export async function createEmployer(data: typeof employers.$inferInsert) {
  const [employer] = await db
    .insert(employers)
    .values(data)
    .returning();
  return employer;
}

export async function getEmployerByUserId(userId: string) {
  const [employer] = await db
    .select()
    .from(employers)
    .where(eq(employers.userId, userId));
  return employer;
}

export async function updateEmployer(id: string, data: Partial<typeof employers.$inferInsert>) {
  const [updatedEmployer] = await db
    .update(employers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(employers.id, id))
    .returning();
  return updatedEmployer;
}

export async function createJob(data: typeof jobs.$inferInsert) {
  const [job] = await db
    .insert(jobs)
    .values(data)
    .returning();
  return job;
}

export async function getJobById(jobId: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId));
  return job;
}

/**
 * Get a job by its human-readable ID (e.g., 'job-41058')
 */
export async function getJobByHumanId(humanId: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.jobId, humanId));
  return job;
}

export async function getJobsByEmployerId(employerId: string) {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.employerId, employerId));
}

export async function updateJob(id: string, data: Partial<typeof jobs.$inferInsert>) {
  const [updatedJob] = await db
    .update(jobs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(jobs.id, id))
    .returning();
  return updatedJob;
}

export async function createJobWorkLocation(data: typeof jobWorkLocations.$inferInsert) {
  const [location] = await db
    .insert(jobWorkLocations)
    .values(data)
    .returning();
  return location;
}

export async function getJobWorkLocationsByJobId(jobId: string) {
  return await db
    .select()
    .from(jobWorkLocations)
    .where(eq(jobWorkLocations.jobId, jobId));
}

export async function createJobApplication(data: typeof jobApplications.$inferInsert) {
  const [application] = await db
    .insert(jobApplications)
    .values(data)
    .returning();
  return application;
}

export async function getJobApplicationById(applicationId: string) {
  const [application] = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.id, applicationId));
  return application;
}

export async function getJobApplicationsByJobId(jobId: string) {
  return await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.jobId, jobId));
}

export async function getJobApplicationsByApplicantProfileId(profileId: string) {
  return await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.applicantProfileId, profileId));
}

export async function updateJobApplicationStatus(applicationId: string, status: typeof applicationStatusEnum.enumValues[number]) {
  const [updatedApplication] = await db
    .update(jobApplications)
    .set({ status })
    .where(eq(jobApplications.id, applicationId))
    .returning();
  return updatedApplication;
}

// Comment out the schema creation functions that are causing type errors
// These can be uncommented and fixed later if needed
/*
export const insertEmployerSchema = createInsertSchema(employers, {
  id: (schema) => schema.id.optional(),
  createdAt: (schema) => schema.createdAt.optional(),
  updatedAt: (schema) => schema.updatedAt.optional(),
});

export const insertJobSchema = createInsertSchema(jobs, {
  id: (schema) => schema.id.optional(),
  createdAt: (schema) => schema.createdAt.optional(),
  updatedAt: (schema) => schema.updatedAt.optional(),
});

export const insertJobWorkLocationSchema = createInsertSchema(jobWorkLocations, {
  id: (schema) => schema.id.optional(),
  createdAt: (schema) => schema.createdAt.optional(),
  updatedAt: (schema) => schema.updatedAt.optional(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications, {
  id: (schema) => schema.id.optional(),
});
*/

export async function createUser(data: {
  name: string | null;
  email: string;
  password: string;
  userType: 'job_seeker' | 'employer';
}) {
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      userType: data.userType,
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
  
  return user;
}

export async function getEmployerById(employerId: string) {
  const [employer] = await db
    .select()
    .from(employers)
    .where(eq(employers.id, employerId));
  return employer;
}

/**
 * Gets all employer IDs from the employers table
 * @returns Array of employer IDs
 */
export async function getAllEmployerIds() {
  try {
    const result = await db
      .select({ id: employers.id })
      .from(employers);
    
    return result;
  } catch (error) {
    console.error('Error fetching all employer IDs:', error);
    return [];
  }
}

/**
 * Gets all confirmed job IDs for a specific employer
 * @param employerId The ID of the employer
 * @returns Array of job IDs with both UUID and human-readable IDs
 */
export async function getConfirmedJobIdsByEmployerId(employerId: string) {
  try {
    const result = await db
      .select({ 
        id: jobs.id,
        jobId: jobs.jobId 
      })
      .from(jobs)
      .where(and(
        eq(jobs.employerId, employerId),
        eq(jobs.isConfirmed, true)
      ));
    
    return result;
  } catch (error) {
    console.error(`Error fetching confirmed job IDs for employer ${employerId}:`, error);
    return [];
  }
}

// Onboarding status for employers
export const employerOnboardingStatusEnum = pgEnum('employer_onboarding_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

// Create a table to track employer onboarding progress
export const employerOnboardingProgress = pgTable('employer_onboarding_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentStep: integer('current_step').default(1).notNull(),
  status: employerOnboardingStatusEnum('status').default('NOT_STARTED').notNull(),
  // Simplified data field - no longer storing comprehensive form data
  data: jsonb('data'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Check employer onboarding status
export async function getEmployerOnboardingStatus(userId: string) {
  try {
    console.log(`DB: Checking onboarding status for employer user: ${userId}`);
    
    // First check if the user's onboardingCompleted flag is true
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // If onboardingCompleted is true in users table, respect that as source of truth
    if (user?.onboardingCompleted) {
      console.log(`DB: User ${userId} has onboardingCompleted=true in users table`);
      return {
        completed: true,
        currentStep: 4, // All steps completed
      };
    }
    
    // Then check if the user already has an employer record
    const employer = await getEmployerByUserId(userId);
    
    if (employer) {
      console.log(`DB: User ${userId} has employer record but onboardingCompleted flag not set, updating flag`);
      
      // If employer record exists but onboardingCompleted is not true, update it for consistency
      if (user && !user.onboardingCompleted) {
        try {
          await updateUserOnboardingStatus(userId, true);
          console.log(`DB: Updated onboardingCompleted flag for user ${userId}`);
        } catch (updateError) {
          console.error(`DB: Failed to update onboardingCompleted flag: ${updateError}`);
          // Continue even if the update fails
        }
      }
      
      // If employer record exists, onboarding is completed
      return {
        completed: true,
        currentStep: 4, // All steps completed
      };
    }
    
    console.log(`DB: No employer record found for user ${userId}, checking progress records`);
    
    try {
      // Check if there's an onboarding progress record
      const [progress] = await db
        .select()
        .from(employerOnboardingProgress)
        .where(eq(employerOnboardingProgress.userId, userId));
      
      if (!progress) {
        console.log(`DB: No progress record found for user ${userId}, starting onboarding`);
        // No progress record found, user is starting onboarding
        // Create an initial onboarding record to track progress
        try {
          await updateEmployerOnboardingProgress(userId, {
            currentStep: 1,
            status: 'NOT_STARTED',
          });
          console.log(`DB: Created initial onboarding record for user ${userId}`);
        } catch (error: any) {
          console.error(`DB: Error creating initial onboarding record: ${error.message || 'Unknown error'}`);
          // Continue even if record creation fails
        }
        
        return {
          completed: false,
          currentStep: 1,
        };
      }
      
      console.log(`DB: Found progress record for user ${userId}: step ${progress.currentStep}, status ${progress.status}`);
      
      const completed = progress.status === 'COMPLETED';
      
      // Return minimal status info - no redirectTo, no form data
      return {
        completed,
        currentStep: progress.currentStep,
      };
    } catch (dbError: any) {
      // Specific error handling for database errors
      console.error(`DB: Database error checking onboarding progress: ${dbError.message || 'Unknown error'}`);
      
      // Check if this is a "relation does not exist" error
      if (dbError.message && typeof dbError.message === 'string' && 
          dbError.message.includes("relation") && dbError.message.includes("does not exist")) {
        console.log("DB: Table does not exist - this is expected if migrations haven't been run");
      }
      
      // Default to starting onboarding if there's a database error
      return {
        completed: false,
        currentStep: 1,
      };
    }
    
  } catch (error: any) {
    console.error('DB: Error checking employer onboarding status:', error);
    // Default to starting onboarding if there's an error
    return {
      completed: false,
      currentStep: 1,
    };
  }
}

// Update employer onboarding progress
export async function updateEmployerOnboardingProgress(userId: string, data: {
  currentStep?: number;
  status?: typeof employerOnboardingStatusEnum.enumValues[number];
  data?: any; // This is now an optional minimal data object, not full form data
}) {
  try {
    console.log(`DB: Updating employer onboarding progress for user ${userId}`);
    console.log(`DB: Data to save:`, data);
    
    // Check if a progress record already exists
    const [existingProgress] = await db
      .select()
      .from(employerOnboardingProgress)
      .where(eq(employerOnboardingProgress.userId, userId));
    
    console.log(`DB: Existing progress record found:`, existingProgress ? 'YES' : 'NO');
    
    if (existingProgress) {
      // Update existing record
      console.log(`DB: Updating existing record for user ${userId}`);
      
      // Prepare update data - ensure we're handling data field properly
      const updateData = {
        currentStep: data.currentStep !== undefined ? data.currentStep : existingProgress.currentStep,
        status: data.status || existingProgress.status,
        // Only update data if explicitly provided, otherwise keep existing (likely empty) data
        ...(data.data !== undefined ? { data: data.data } : {}),
        lastUpdated: new Date()
      };
      
      console.log(`DB: Update data:`, updateData);
      
      const [updatedProgress] = await db
        .update(employerOnboardingProgress)
        .set(updateData)
        .where(eq(employerOnboardingProgress.userId, userId))
        .returning();
      
      console.log(`DB: Update successful, returned:`, updatedProgress);
      return updatedProgress;
    } else {
      // Create new record
      console.log(`DB: Creating new record for user ${userId}`);
      
      // Prepare insert data with defaults for missing fields
      const insertData = {
        userId,
        currentStep: data.currentStep || 1,
        status: data.status || 'IN_PROGRESS',
        data: data.data || {}, // Initialize with empty object, not full form data
        lastUpdated: new Date(),
        createdAt: new Date()
      };
      
      console.log(`DB: Insert data:`, insertData);
      
      try {
        const [newProgress] = await db
          .insert(employerOnboardingProgress)
          .values(insertData)
          .returning();
        
        console.log(`DB: Insert successful, returned:`, newProgress);
        return newProgress;
      } catch (insertError) {
        console.error(`DB: Insert failed with error:`, insertError);
        
        // If insert fails, try again with a different approach as fallback
        console.log(`DB: Trying alternative insert approach...`);
        
        const query = `
          INSERT INTO employer_onboarding_progress 
          (id, user_id, current_step, status, data, last_updated, created_at) 
          VALUES 
          (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
          RETURNING *;
        `;
        
        const insertParams = [
          userId,
          insertData.currentStep,
          insertData.status,
          insertData.data,
          insertData.lastUpdated,
          insertData.createdAt
        ];
        
        const result = await sql.unsafe(query, insertParams);
        console.log(`DB: Alternative insert result:`, result);
        
        // Return the first row of the result
        return result[0] || null;
      }
    }
    
  } catch (error) {
    console.error('Error updating employer onboarding progress:', error);
    
    // Log additional details to help diagnose the issue
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Try to extract more details if this is a database error
      if ('code' in error) {
        console.error('SQL Error code:', (error as any).code);
      }
    }
    
    throw error;
  }
}

/**
 * Gets all confirmed job IDs from the jobs table
 * @returns Array of confirmed job IDs with both UUID and human-readable IDs
 */
export async function getAllConfirmedJobIds() {
  try {
    const result = await db
      .select({ 
        id: jobs.id,
        jobId: jobs.jobId 
      })
      .from(jobs)
      .where(eq(jobs.isConfirmed, true));
    
    return result;
  } catch (error) {
    console.error('Error fetching all confirmed job IDs:', error);
    return [];
  }
}

/**
 * Gets a job seeker profile by user ID
 */
export async function getJobSeekerByUserId(userId: string) {
  try {
    const [userProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    
    return userProfile || null;
  } catch (error) {
    console.error("Error getting job seeker by user ID:", error);
    throw error;
  }
}

/**
 * Checks the onboarding status of a job seeker
 */
export async function getJobSeekerOnboardingStatus(userId: string) {
  try {
    console.log(`DB: Checking onboarding status for job seeker user: ${userId}`);
    
    // First check if the user's onboardingCompleted flag is true
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // If onboardingCompleted is true in users table, respect that as source of truth
    if (user?.onboardingCompleted) {
      console.log(`DB: User ${userId} has onboardingCompleted=true in users table`);
      return {
        completed: true,
        currentStep: 10, // All steps completed
        redirectTo: '/job-seeker/dashboard',
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      };
    }
    
    // Get job seeker profile
    const userProfile = await getJobSeekerByUserId(userId);
    
    if (!userProfile) {
      // User hasn't started onboarding
      // Use step 1 path from onboardingSteps
      const firstStep = onboardingSteps.find(step => step.id === 1);
      return {
        completed: false,
        currentStep: 1,
        redirectTo: firstStep?.path || '/job-seeker/onboarding/informasi-dasar',
        completedSteps: []
      };
    }
    
    // Calculate completed steps using a consistent approach
    const completedSteps: number[] = [];
    
    // Step 1: Informasi Dasar
    if (userProfile.namaLengkap && userProfile.email && userProfile.nomorTelepon) {
      completedSteps.push(1);
    }
    
    // Step 2: Informasi Lanjutan
    if (userProfile.tanggalLahir && userProfile.tempatLahir) {
      completedSteps.push(2);
    }
    
    // Step 3: Alamat
    const userAddressesResult = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userProfileId, userProfile.id));
    
    if (userAddressesResult && userAddressesResult.length > 0) {
      // At least one address is stored in the database
      completedSteps.push(3);
    }
    
    // Step 4: Pendidikan
    const educationRecords = await getUserPendidikanByProfileId(userProfile.id);
    if (educationRecords && educationRecords.length > 0) {
      completedSteps.push(4);
    }
    
    // Step 5: Level Pengalaman
    if (userProfile.levelPengalaman) {
      completedSteps.push(5);
    }
    
    // Optional steps (6-9) follow the same pattern as in calculateCompletedSteps
    // Step 6: Pengalaman Kerja (optional)
    const experienceRecords = await getUserPengalamanKerjaByProfileId(userProfile.id);
    if (experienceRecords && experienceRecords.length > 0) {
      // Actual data provided
      completedSteps.push(6);
    } else if (completedSteps.includes(5)) {
      // No data but the user has completed all required steps
      completedSteps.push(6);
    }
    
    // Step 7: Ekspektasi Kerja (optional)
    if (userProfile.ekspektasiKerja && Object.keys(userProfile.ekspektasiKerja).length > 0) {
      completedSteps.push(7);
    } else if (completedSteps.includes(6)) {
      completedSteps.push(7);
    }
    
    // Step 8: CV Upload (optional)
    if (userProfile.cvFileUrl) {
      completedSteps.push(8);
    } else if (completedSteps.includes(7)) {
      completedSteps.push(8);
    }
    
    // Step 9: Profile Photo (optional)
    if (userProfile.profilePhotoUrl) {
      completedSteps.push(9);
    } else if (completedSteps.includes(8)) {
      completedSteps.push(9);
    }
    
    // Determine the current step based on completed steps
    let currentStep = 1;
    let redirectTo = '/job-seeker/onboarding/informasi-dasar';
    let completed = false;
    
    // Find the first incomplete required step
    for (let i = 1; i <= 5; i++) {
      if (!completedSteps.includes(i)) {
        currentStep = i;
        const stepInfo = onboardingSteps.find(step => step.id === i);
        redirectTo = stepInfo?.path || `/job-seeker/onboarding/${getPathForStepNumber(i)}`;
        break;
      }
    }
    
    // If all required steps are complete
    if (completedSteps.includes(1) && 
        completedSteps.includes(2) && 
        completedSteps.includes(3) && 
        completedSteps.includes(4) && 
        completedSteps.includes(5)) {
      
      // If we've reached here, all required steps (1-5) are complete
      // Check for the first incomplete optional step
      for (let i = 6; i <= 9; i++) {
        if (!completedSteps.includes(i)) {
          currentStep = i;
          const stepInfo = onboardingSteps.find(step => step.id === i);
          redirectTo = stepInfo?.path || `/job-seeker/onboarding/${getPathForStepNumber(i)}`;
          break;
        }
      }
      
      // If all steps (1-9) are complete, redirect to summary
      if (completedSteps.length === 9) {
        currentStep = 10; // Summary step
        redirectTo = '/job-seeker/onboarding/ringkasan';
        completed = true;
        
        // If all steps are completed but onboardingCompleted flag is not set,
        // update it for consistency
        if (user && !user.onboardingCompleted && completed) {
          try {
            await updateUserOnboardingStatus(userId, true);
            console.log(`DB: Updated onboardingCompleted flag for job seeker ${userId}`);
          } catch (updateError) {
            console.error(`DB: Failed to update onboardingCompleted flag: ${updateError}`);
            // Continue even if the update fails
          }
        }
      }
    }
    
    console.log(`DB: Calculated onboarding status for job seeker ${userId}:`, {
      completed,
      currentStep,
      redirectTo,
      completedSteps
    });
    
    return {
      completed,
      currentStep,
      redirectTo,
      completedSteps
    };
  } catch (error) {
    console.error("DB: Error checking job seeker onboarding status:", error);
    throw error;
  }
}

// Helper function to get path fragment for a step number
function getPathForStepNumber(stepNumber: number): string {
  const pathMap: Record<number, string> = {
    1: 'informasi-dasar',
    2: 'informasi-lanjutan',
    3: 'alamat',
    4: 'pendidikan',
    5: 'level-pengalaman',
    6: 'pengalaman-kerja',
    7: 'ekspektasi-kerja',
    8: 'cv-upload',
    9: 'foto-profile',
    10: 'ringkasan'
  };
  
  return pathMap[stepNumber] || 'informasi-dasar';
}

// Add a new function to update user onboarding status
export async function updateUserOnboardingStatus(userId: string, completed: boolean) {
  try {
    console.log(`DB: Updating onboarding status for user ${userId} to ${completed}`);
    
    // First check if the user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!existingUser) {
      console.error(`DB: User with ID ${userId} does not exist`);
      throw new Error(`User with ID ${userId} does not exist`);
    }
    
    // Only update if the status is different
    if (existingUser.onboardingCompleted === completed) {
      console.log(`DB: User ${userId} onboardingCompleted is already ${completed}, no update needed`);
      return existingUser;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        onboardingCompleted: completed,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    
    console.log(`DB: Successfully updated onboardingCompleted to ${completed} for user ${userId}`);
    return updatedUser;
  } catch (error) {
    console.error(`DB: Error updating onboarding status for user ${userId}:`, error);
    throw error;
  }
}
