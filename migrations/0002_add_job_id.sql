-- Add jobId field to jobs table
ALTER TABLE "jobs" ADD COLUMN "job_id" TEXT;

-- Generate human-readable IDs for existing jobs
UPDATE "jobs" SET "job_id" = CONCAT('job-', FLOOR(10000 + RANDOM() * 90000)::TEXT);

-- Make jobId not nullable after populating data
ALTER TABLE "jobs" ALTER COLUMN "job_id" SET NOT NULL;

-- Add a unique index on job_id to ensure no duplicates
CREATE UNIQUE INDEX "idx_job_id_unique" ON "jobs" ("job_id"); 