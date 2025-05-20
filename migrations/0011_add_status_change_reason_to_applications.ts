import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  await db.execute(sql`
    ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "status_change_reason" TEXT;
  `);
}

export async function down(db: PostgresJsDatabase) {
  await db.execute(sql`
    ALTER TABLE "job_applications" DROP COLUMN IF EXISTS "status_change_reason";
  `);
} 