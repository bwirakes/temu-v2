import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { index, uniqueIndex } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  // Add jobId column to jobs table
  await db.execute(sql`ALTER TABLE "jobs" ADD COLUMN "job_id" TEXT;`);
  
  // Generate random jobIds for existing records
  await db.execute(sql`
    UPDATE "jobs" 
    SET "job_id" = CONCAT('job-', FLOOR(10000 + RANDOM() * 90000)::TEXT);
  `);
  
  // Make the column not nullable
  await db.execute(sql`ALTER TABLE "jobs" ALTER COLUMN "job_id" SET NOT NULL;`);
  
  // Create a unique index to ensure no duplicate jobIds
  await db.execute(sql`CREATE UNIQUE INDEX "idx_job_id_unique" ON "jobs" ("job_id");`);
}

export async function down(db: PostgresJsDatabase) {
  // Remove unique index first
  await db.execute(sql`DROP INDEX IF EXISTS "idx_job_id_unique";`);
  
  // Drop the column
  await db.execute(sql`ALTER TABLE "jobs" DROP COLUMN IF EXISTS "job_id";`);
} 