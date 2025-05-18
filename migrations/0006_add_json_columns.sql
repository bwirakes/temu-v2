-- Add expectations and additional_requirements columns to jobs table
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "expectations" JSONB;
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "additional_requirements" JSONB; 