-- Check if last_education enum type exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'last_education') THEN
        CREATE TYPE last_education AS ENUM (
            'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'
        );
    END IF;
END$$;

-- Add education column to job_applications table if it doesn't exist
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "education" last_education; 