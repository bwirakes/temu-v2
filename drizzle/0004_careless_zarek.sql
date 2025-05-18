DO $$ BEGIN
 CREATE TYPE "public"."last_education" AS ENUM('SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "last_education" "last_education";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "required_competencies" jsonb;--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "salary_range";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "application_deadline";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "requirements";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "responsibilities";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "description";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "working_hours";