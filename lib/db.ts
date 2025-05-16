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

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  password: text('password'),
  image: text('image'),
  userType: userTypeEnum('user_type').notNull().default('job_seeker'),
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
  email: text('email').notNull().unique(),
  nomorTelepon: text('nomor_telepon').notNull(),
  tanggalLahir: text('tanggal_lahir').notNull(),
  jenisKelamin: jenisKelaminEnum('jenis_kelamin'),
  beratBadan: integer('berat_badan'),
  tinggiBadan: integer('tinggi_badan'),
  agama: agamaEnum('agama'),
  fotoProfilUrl: text('foto_profil_url'),
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

export const userSocialMedia = pgTable('user_social_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  instagram: text('instagram'),
  twitter: text('twitter'),
  facebook: text('facebook'),
  tiktok: text('tiktok'),
  linkedin: text('linkedin'),
  other: text('other'),
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
  deskripsiTambahan: text('deskripsi_tambahan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userKeahlian = pgTable('user_keahlian', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  tingkat: tingkatKeahlianEnum('tingkat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userSertifikasi = pgTable('user_sertifikasi', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  penerbit: text('penerbit'),
  tanggalTerbit: text('tanggal_terbit'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const userBahasa = pgTable('user_bahasa', {
  id: uuid('id').defaultRandom().primaryKey(),
  userProfileId: uuid('user_profile_id')
    .notNull()
    .references(() => userProfiles.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  tingkat: tingkatKeahlianEnum('tingkat'),
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
  jobTitle: text('job_title').notNull(),
  contractType: text('contract_type').notNull(),
  salaryRange: jsonb('salary_range').$type<{
    min?: number;
    max?: number;
    isNegotiable: boolean;
  }>(),
  minWorkExperience: integer('min_work_experience').notNull(),
  applicationDeadline: timestamp('application_deadline'),
  requirements: jsonb('requirements').$type<string[]>(),
  responsibilities: jsonb('responsibilities').$type<string[]>(),
  description: text('description'),
  postedDate: timestamp('posted_date').defaultNow().notNull(),
  numberOfPositions: integer('number_of_positions'),
  workingHours: text('working_hours'),
  expectations: jsonb('expectations').$type<{
    ageRange?: {
      min: number;
      max: number;
    };
    expectedCharacter?: string;
    foreignLanguage?: string;
  }>(),
  additionalRequirements: jsonb('additional_requirements').$type<{
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    requiredDocuments?: string;
    specialSkills?: string;
    technologicalSkills?: string;
    suitableForDisability?: boolean;
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
  coverLetter: text('cover_letter'),
  resumeUrl: text('resume_url'),
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
  jenisKelamin?: typeof jenisKelaminEnum.enumValues[number] | null;
  beratBadan?: number | null;
  tinggiBadan?: number | null;
  agama?: typeof agamaEnum.enumValues[number] | null;
  fotoProfilUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function createUserProfile(data: InsertUserProfile) {
  const [profile] = await db
    .insert(userProfiles)
    .values(data)
    .returning();
  
  return profile;
}

export async function updateUserProfile(id: string, data: Partial<InsertUserProfile>) {
  const [updatedProfile] = await db
    .update(userProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(userProfiles.id, id))
    .returning();
  
  return updatedProfile;
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

export async function getUserKeahlianByProfileId(profileId: string) {
  return await db
    .select()
    .from(userKeahlian)
    .where(eq(userKeahlian.userProfileId, profileId));
}

export async function getUserSertifikasiByProfileId(profileId: string) {
  return await db
    .select()
    .from(userSertifikasi)
    .where(eq(userSertifikasi.userProfileId, profileId));
}

export async function getUserBahasaByProfileId(profileId: string) {
  return await db
    .select()
    .from(userBahasa)
    .where(eq(userBahasa.userProfileId, profileId));
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
 * @returns Array of job IDs
 */
export async function getConfirmedJobIdsByEmployerId(employerId: string) {
  try {
    const result = await db
      .select({ id: jobs.id })
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
  data: jsonb('data').$type<Partial<{
    // Step 1: Informasi Dasar Badan Usaha
    namaPerusahaan: string;
    merekUsaha?: string;
    industri: string;
    alamatKantor: string;
    
    // Step 2: Kehadiran Online dan Identitas Merek
    website?: string;
    socialMedia?: {
      instagram?: string;
      linkedin?: string;
      facebook?: string;
      twitter?: string;
      tiktok?: string;
    };
    logoUrl?: string;
    
    // Step 3: Penanggung Jawab (PIC)
    pic?: {
      nama: string;
      nomorTelepon: string;
    };
  }>>(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Check employer onboarding status
export async function getEmployerOnboardingStatus(userId: string) {
  try {
    console.log(`Checking onboarding status for user: ${userId}`);
    
    // First check if the user already has an employer record
    const employer = await getEmployerByUserId(userId);
    
    if (employer) {
      console.log(`User ${userId} has completed onboarding`);
      // If employer record exists, onboarding is completed
      return {
        completed: true,
        currentStep: 4, // All steps completed
        redirectTo: '/employer' // Redirect to employer dashboard
      };
    }
    
    console.log(`No employer record found for user ${userId}, checking progress records`);
    
    try {
      // Check if there's an onboarding progress record
      const [progress] = await db
        .select()
        .from(employerOnboardingProgress)
        .where(eq(employerOnboardingProgress.userId, userId));
      
      if (!progress) {
        console.log(`No progress record found for user ${userId}, starting onboarding`);
        // No progress record found, user is starting onboarding
        // Create an initial onboarding record to track progress
        try {
          await updateEmployerOnboardingProgress(userId, {
            currentStep: 1,
            status: 'NOT_STARTED',
            data: {}
          });
          console.log(`Created initial onboarding record for user ${userId}`);
        } catch (error: any) {
          console.error(`Error creating initial onboarding record: ${error.message || 'Unknown error'}`);
          // Continue even if record creation fails
        }
        
        return {
          completed: false,
          currentStep: 1,
          redirectTo: '/employer/onboarding/informasi-perusahaan'
        };
      }
      
      console.log(`Found progress record for user ${userId}: step ${progress.currentStep}, status ${progress.status}`);
      
      // Map current step to the correct route
      const stepRoutes = [
        '/employer/onboarding/informasi-perusahaan',
        '/employer/onboarding/kehadiran-online',
        '/employer/onboarding/penanggung-jawab',
        '/employer/onboarding/konfirmasi'
      ];
      
      const redirectTo = progress.currentStep <= stepRoutes.length 
        ? stepRoutes[progress.currentStep - 1] 
        : '/employer';
      
      return {
        completed: progress.status === 'COMPLETED',
        currentStep: progress.currentStep,
        redirectTo
      };
    } catch (dbError: any) {
      // Specific error handling for database errors
      console.error(`Database error checking onboarding progress: ${dbError.message || 'Unknown error'}`);
      
      // Check if this is a "relation does not exist" error
      if (dbError.message && typeof dbError.message === 'string' && 
          dbError.message.includes("relation") && dbError.message.includes("does not exist")) {
        console.log("Table does not exist - this is expected if migrations haven't been run");
      }
      
      // Default to starting onboarding if there's a database error
      return {
        completed: false,
        currentStep: 1,
        redirectTo: '/employer/onboarding/informasi-perusahaan'
      };
    }
    
  } catch (error: any) {
    console.error('Error checking employer onboarding status:', error);
    // Default to starting onboarding if there's an error
    return {
      completed: false,
      currentStep: 1,
      redirectTo: '/employer/onboarding/informasi-perusahaan'
    };
  }
}

// Update employer onboarding progress
export async function updateEmployerOnboardingProgress(userId: string, data: {
  currentStep?: number;
  status?: typeof employerOnboardingStatusEnum.enumValues[number];
  data?: any;
}) {
  try {
    // Check if a progress record already exists
    const [existingProgress] = await db
      .select()
      .from(employerOnboardingProgress)
      .where(eq(employerOnboardingProgress.userId, userId));
    
    if (existingProgress) {
      // Update existing record
      const [updatedProgress] = await db
        .update(employerOnboardingProgress)
        .set({
          ...data,
          lastUpdated: new Date()
        })
        .where(eq(employerOnboardingProgress.userId, userId))
        .returning();
      
      return updatedProgress;
    } else {
      // Create new record
      const [newProgress] = await db
        .insert(employerOnboardingProgress)
        .values({
          userId,
          currentStep: data.currentStep || 1,
          status: data.status || 'IN_PROGRESS',
          data: data.data || {},
          lastUpdated: new Date(),
          createdAt: new Date()
        })
        .returning();
      
      return newProgress;
    }
    
  } catch (error) {
    console.error('Error updating employer onboarding progress:', error);
    throw error;
  }
}
