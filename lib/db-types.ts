/**
 * This file contains database type definitions and enums that can be safely used in client components
 * without requiring server-only functionality.
 */

import {
  pgEnum,
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  serial,
  uuid,
  boolean,
  json,
  jsonb,
  primaryKey,
  uniqueIndex,
  date
} from 'drizzle-orm/pg-core';

// Define onboarding steps
export const onboardingSteps = [
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

// Define which steps are optional
export const optionalSteps = [6, 7, 9]; // Pengalaman Kerja, Ekspektasi Kerja, and Foto Profile are optional

// Enum definitions - these are safe to use in client components
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
export const willingToTravelEnum = pgEnum('willing_to_travel', ['wfh', 'wfo', 'travel', 'relocate', 'local_only', 'domestic', 'international']);
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
export const employerOnboardingStatusEnum = pgEnum('employer_onboarding_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

// Table definitions - these are type-only and safe to use in client components
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
  tidakLulus: boolean('tidak_lulus').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: text('job_id').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  employerId: uuid('employer_id').notNull(),
  status: text('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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

// Type definitions

export type PengalamanKerja = {
  id: string;
  levelPengalaman: "Baru lulus" | "Pengalaman magang" | "Kurang dari 1 tahun" | "1-2 tahun" | "3-5 tahun" | "5-10 tahun" | "10 tahun lebih";
  namaPerusahaan: string;
  posisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsiPekerjaan?: string;
  lokasiKerja?: "WFH" | "WFO" | "Hybrid";
  lokasi?: string;
  gajiTerakhir?: string;
  alasanKeluar?: "Dapat Tawaran Lebih Baik" | "Cari Peluang Lebih Baik" | "Tidak ada peluang karir jangka-panjang" | "Lainnya" | string;
  alasanKeluarLainnya?: string;
};

export type Pendidikan = {
  id: string;
  namaInstitusi: string;
  lokasi: string;
  jenjangPendidikan: string;
  bidangStudi: string;
  tanggalLulus: string; // "Masih Kuliah" | "Tidak Lulus" | actual date
  deskripsiTambahan?: string;
  nilaiAkhir?: string;
  tidakLulus?: boolean;
};

export type WillingToTravel = "local_only" | "domestic" | "international";
export type LokasiKerja = "WFH" | "WFO" | "Hybrid";

export interface EkspektasiKerja {
  jobTypes: string;
  idealSalary: number;
  willingToTravel: "wfh" | "wfo" | "travel" | "relocate";
  preferensiLokasiKerja: "local_only" | "domestic" | "international";
}

export type OnboardingData = {
  // Step 1: Informasi Dasar
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  
  // Step 2: Informasi Lanjutan
  tanggalLahir: string;
  tempatLahir: string;
  jenisKelamin?: "Laki-laki" | "Perempuan" | "Lainnya";
  
  // Step 3: Alamat
  alamat?: {
    kota?: string;
    provinsi?: string;
    kodePos?: string;
    jalan?: string;
  };
  
  // Step 4: Pendidikan
  pendidikan: Pendidikan[];
  
  // Step 5: Level Pengalaman
  levelPengalaman?: string;
  
  // Step 6: Pengalaman Kerja
  pengalamanKerja: PengalamanKerja[];
  
  // Step 7: Ekspektasi Kerja
  ekspektasiKerja?: EkspektasiKerja;
  
  // Step 8: CV Upload
  cvFile?: File;
  cvFileUrl?: string;
  
  // Step 9: Profile Photo
  profilePhotoFile?: File;
  profilePhotoUrl?: string;
}; 
