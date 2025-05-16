-- Create enum types
CREATE TYPE "status" AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE "jenis_kelamin" AS ENUM ('Laki-laki', 'Perempuan', 'Lainnya');
CREATE TYPE "lokasi_kerja" AS ENUM ('WFH', 'WFO', 'Hybrid');
CREATE TYPE "tingkat_keahlian" AS ENUM ('Pemula', 'Menengah', 'Mahir');
CREATE TYPE "level_pengalaman" AS ENUM (
  'Baru lulus',
  'Pengalaman magang',
  'Kurang dari 1 tahun',
  '1-2 tahun',
  '3-5 tahun',
  '5-10 tahun',
  '10 tahun lebih'
);
CREATE TYPE "application_status" AS ENUM (
  'SUBMITTED',
  'REVIEWING',
  'INTERVIEW',
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN'
);

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" TIMESTAMP,
  "password" TEXT,
  "image" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "session_token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP NOT NULL
);

-- Create verification tokens table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "image_url" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" status NOT NULL,
  "price" NUMERIC(10, 2) NOT NULL,
  "stock" INTEGER NOT NULL,
  "available_at" TIMESTAMP NOT NULL
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "nama_lengkap" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "nomor_telepon" TEXT NOT NULL,
  "tanggal_lahir" TEXT NOT NULL,
  "jenis_kelamin" jenis_kelamin,
  "berat_badan" INTEGER,
  "tinggi_badan" INTEGER,
  "agama" TEXT,
  "foto_profil_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS "user_addresses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "jalan" TEXT,
  "rt" TEXT,
  "rw" TEXT,
  "kelurahan" TEXT,
  "kecamatan" TEXT,
  "kota" TEXT,
  "provinsi" TEXT,
  "kode_pos" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_social_media table
CREATE TABLE IF NOT EXISTS "user_social_media" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "instagram" TEXT,
  "twitter" TEXT,
  "facebook" TEXT,
  "tiktok" TEXT,
  "linkedin" TEXT,
  "other" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_pengalaman_kerja table
CREATE TABLE IF NOT EXISTS "user_pengalaman_kerja" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "level_pengalaman" level_pengalaman NOT NULL,
  "nama_perusahaan" TEXT NOT NULL,
  "posisi" TEXT NOT NULL,
  "tanggal_mulai" TEXT NOT NULL,
  "tanggal_selesai" TEXT NOT NULL,
  "deskripsi_pekerjaan" TEXT,
  "lokasi_kerja" lokasi_kerja,
  "lokasi" TEXT,
  "alasan_keluar" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_pendidikan table
CREATE TABLE IF NOT EXISTS "user_pendidikan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "nama_institusi" TEXT NOT NULL,
  "jenjang_pendidikan" TEXT NOT NULL,
  "bidang_studi" TEXT NOT NULL,
  "tanggal_lulus" TEXT NOT NULL,
  "nilai_akhir" TEXT,
  "deskripsi_tambahan" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_keahlian table
CREATE TABLE IF NOT EXISTS "user_keahlian" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "nama" TEXT NOT NULL,
  "tingkat" tingkat_keahlian,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_sertifikasi table
CREATE TABLE IF NOT EXISTS "user_sertifikasi" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "nama" TEXT NOT NULL,
  "penerbit" TEXT,
  "tanggal_terbit" TEXT,
  "file_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create user_bahasa table
CREATE TABLE IF NOT EXISTS "user_bahasa" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "nama" TEXT NOT NULL,
  "tingkat" tingkat_keahlian,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create employers table
CREATE TABLE IF NOT EXISTS "employers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "nama_perusahaan" TEXT NOT NULL,
  "merek_usaha" TEXT,
  "industri" TEXT NOT NULL,
  "alamat_kantor" TEXT NOT NULL,
  "website" TEXT,
  "social_media" JSONB,
  "logo_url" TEXT,
  "pic" JSONB NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS "jobs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employer_id" UUID NOT NULL REFERENCES "employers"("id") ON DELETE CASCADE,
  "job_title" TEXT NOT NULL,
  "contract_type" TEXT NOT NULL,
  "salary_range" JSONB,
  "min_work_experience" INTEGER NOT NULL,
  "application_deadline" TIMESTAMP,
  "requirements" JSONB,
  "responsibilities" JSONB,
  "description" TEXT,
  "posted_date" TIMESTAMP NOT NULL DEFAULT now(),
  "number_of_positions" INTEGER,
  "working_hours" TEXT,
  "expectations" JSONB,
  "additional_requirements" JSONB,
  "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create job_work_locations table
CREATE TABLE IF NOT EXISTS "job_work_locations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_id" UUID NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "city" TEXT NOT NULL,
  "province" TEXT NOT NULL,
  "is_remote" BOOLEAN NOT NULL DEFAULT false,
  "address" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS "job_applications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "applicant_profile_id" UUID NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
  "job_id" UUID NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
  "status" application_status NOT NULL DEFAULT 'SUBMITTED',
  "cover_letter" TEXT,
  "resume_url" TEXT,
  CONSTRAINT "unq_applicant_job" UNIQUE ("applicant_profile_id", "job_id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "accounts" ("user_id");
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "sessions" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "provider_account_id_idx" ON "accounts" ("provider", "provider_account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_token_idx" ON "verification_tokens" ("identifier", "token"); 
