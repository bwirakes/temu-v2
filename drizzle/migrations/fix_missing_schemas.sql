-- Create tingkat_keahlian enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tingkat_keahlian') THEN
        CREATE TYPE "tingkat_keahlian" AS ENUM ('Pemula', 'Menengah', 'Mahir');
    END IF;
END
$$;

-- Add missing columns to user_profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'profile_photo_url'
    ) THEN
        ALTER TABLE "user_profiles" ADD COLUMN "profile_photo_url" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'level_pengalaman'
    ) THEN
        ALTER TABLE "user_profiles" ADD COLUMN "level_pengalaman" TEXT;
    END IF;
END
$$;

-- Add missing columns to jobs table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'job_id'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "job_id" TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'last_education'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "last_education" last_education;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'jobs' AND column_name = 'required_competencies'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "required_competencies" JSONB;
    END IF;
END
$$; 