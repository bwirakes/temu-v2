-- Add cv_file_url column to job_applications table
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "cv_file_url" text;

-- Ensure additional_notes column exists (in case it's missing)
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "additional_notes" text; 