-- Add required_competencies column to the jobs table
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "required_competencies" JSONB; 