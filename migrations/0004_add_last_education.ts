import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  // Check if last_education enum exists, if not create it
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'last_education') THEN
        CREATE TYPE last_education AS ENUM (
          'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'
        );
      END IF;
    END $$;
  `);
  
  // Add the last_education column to the jobs table
  await db.execute(sql`
    ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "last_education" last_education;
  `);
}

export async function down(db: PostgresJsDatabase) {
  // Remove the last_education column
  await db.execute(sql`
    ALTER TABLE "jobs" DROP COLUMN IF EXISTS "last_education";
  `);
  
  // Optionally, drop the enum type if we want a complete rollback
  // Be careful with this in production as it might affect other tables using the same enum
  // await db.execute(sql`DROP TYPE IF EXISTS last_education;`);
} 