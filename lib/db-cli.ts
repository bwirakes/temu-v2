// This file is a copy of db.ts but without the 'server-only' import for CLI usage

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
  uniqueIndex,
  date
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, and } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// Define onboarding steps directly here for CLI usage
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

// Initialize PostgreSQL connection
const sql = postgres(process.env.POSTGRES_URL!, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10
});

// Create drizzle database instance
export const db = drizzle(sql);

// Schema definitions
export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const jenisKelaminEnum = pgEnum('jenis_kelamin', ['Laki-laki', 'Perempuan', 'Lainnya']);
export const lokasiKerjaEnum = pgEnum('lokasi_kerja', ['WFH', 'WFO', 'Hybrid']);
export const tingkatKeahlianEnum = pgEnum('tingkat_keahlian', ['Pemula', 'Menengah', 'Mahir']);
export const agamaEnum = pgEnum('agama', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']);
export const levelPengalamanEnum = pgEnum('level_pengalaman', [
  'Lulusan Baru / Fresh Graduate',
  '1-2 Tahun',
  '3-5 Tahun',
  '5> Tahun',
  '10+ Tahun'
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
  minWorkExperience: integer('min_work_experience').notNull(),
  postedDate: timestamp('posted_date').defaultNow().notNull(),
  numberOfPositions: integer('number_of_positions'),
  lastEducation: lastEducationEnum('last_education'),
  jurusan: text('jurusan'),
  requiredCompetencies: text('required_competencies'),
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
  statusChangeReason: text('status_change_reason'),
  tanggalLahir: date('tanggal_lahir'),
  jenisKelamin: text('jenis_kelamin'),
  kotaDomisili: text('kota_domisili'),
  pendidikanFull: jsonb('pendidikan_full'),
  pengalamanKerjaFull: jsonb('pengalaman_kerja_full'),
  pengalamanKerjaTerakhir: jsonb('pengalaman_kerja_terakhir'),
  gajiTerakhir: integer('gaji_terakhir'),
  levelPengalaman: text('level_pengalaman'),
  ekspektasiGaji: jsonb('ekspektasi_gaji'),
  preferensiLokasiKerja: jsonb('preferensi_lokasi_kerja'),
  preferensiJenisPekerjaan: jsonb('preferensi_jenis_pekerjaan'),
}, (t) => {
  return {
    unqApplicantJob: uniqueIndex('unq_applicant_job').on(t.applicantProfileId, t.jobId),
  };
});

// Type for user profile insert
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

// Helper functions
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

// Ensure the employerOnboardingStatusEnum is defined above other tables
export const employerOnboardingStatusEnum = pgEnum('employer_onboarding_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

// Make sure this table is properly defined with all fields
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
