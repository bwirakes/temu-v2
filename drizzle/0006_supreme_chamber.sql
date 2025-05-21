ALTER TABLE "jobs" ALTER COLUMN "required_competencies" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "additional_notes" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "education" "last_education";--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "cv_file_url" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "status_change_reason" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "tanggal_lahir" date;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "jenis_kelamin" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "kota_domisili" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "pendidikan_full" jsonb;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "pengalaman_kerja_full" jsonb;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "pengalaman_kerja_terakhir" jsonb;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "gaji_terakhir" integer;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "level_pengalaman" text;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "ekspektasi_gaji" jsonb;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "preferensi_lokasi_kerja" jsonb;--> statement-breakpoint
ALTER TABLE "job_applications" ADD COLUMN "preferensi_jenis_pekerjaan" jsonb;--> statement-breakpoint
ALTER TABLE "job_applications" DROP COLUMN IF EXISTS "cover_letter";