import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  // Add required_competencies column to jobs table
  await db.execute(sql`
    ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "required_competencies" JSONB;
  `);
}

export async function down(db: PostgresJsDatabase) {
  // Remove the column on rollback
  await db.execute(sql`
    ALTER TABLE "jobs" DROP COLUMN IF EXISTS "required_competencies";
  `);
} 