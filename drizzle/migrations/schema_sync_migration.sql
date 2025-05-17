-- Migration file to sync PostgreSQL schema with db.ts definitions

-- Update user_profiles table
ALTER TABLE "user_profiles" 
  DROP CONSTRAINT IF EXISTS "user_profiles_email_unique";

-- Remove columns from user_profiles
ALTER TABLE "user_profiles" 
  DROP COLUMN IF EXISTS "berat_badan",
  DROP COLUMN IF EXISTS "tinggi_badan",
  DROP COLUMN IF EXISTS "agama",
  DROP COLUMN IF EXISTS "foto_profil_url";

-- Add new columns to user_profiles
ALTER TABLE "user_profiles" 
  ADD COLUMN IF NOT EXISTS "tempat_lahir" TEXT,
  ADD COLUMN IF NOT EXISTS "cv_file_url" TEXT,
  ADD COLUMN IF NOT EXISTS "cv_upload_date" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "ekspektasi_kerja" JSONB;

-- Add lokasi to user_pendidikan
ALTER TABLE "user_pendidikan"
  ADD COLUMN IF NOT EXISTS "lokasi" TEXT;

-- Create agama enum if needed for future use
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agama') THEN
        CREATE TYPE "agama" AS ENUM ('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu');
    END IF;
END
$$;

-- Create willing_to_travel enum if needed for future use
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'willing_to_travel') THEN
        CREATE TYPE "willing_to_travel" AS ENUM ('local_only', 'jabodetabek', 'anywhere');
    END IF;
END
$$;

-- Create employer_onboarding_status enum if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employer_onboarding_status') THEN
        CREATE TYPE "employer_onboarding_status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
    END IF;
END
$$;

-- Create employer_onboarding_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS "employer_onboarding_progress" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "current_step" INTEGER NOT NULL DEFAULT 1,
  "status" employer_onboarding_status NOT NULL DEFAULT 'NOT_STARTED',
  "data" JSONB,
  "last_updated" TIMESTAMP NOT NULL DEFAULT now(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
); 