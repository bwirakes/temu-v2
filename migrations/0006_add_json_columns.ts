import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  // Add expectations column to jobs table
  await db.execute(sql`
    ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "expectations" JSONB;
  `);
  
  // Add additional_requirements column to jobs table
  await db.execute(sql`
    ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "additional_requirements" JSONB;
  `);
}

export async function down(db: PostgresJsDatabase) {
  // Remove the columns on rollback
  await db.execute(sql`
    ALTER TABLE "jobs" DROP COLUMN IF EXISTS "expectations";
    ALTER TABLE "jobs" DROP COLUMN IF EXISTS "additional_requirements";
  `);
} 