import { sql } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

export async function up(db: any) {
  // Drop columns: rt, rw, kelurahan, and kecamatan from user_addresses table
  await db.execute(sql`
    ALTER TABLE "user_addresses" 
    DROP COLUMN IF EXISTS "rt",
    DROP COLUMN IF EXISTS "rw",
    DROP COLUMN IF EXISTS "kelurahan",
    DROP COLUMN IF EXISTS "kecamatan"
  `);
  
  console.log('Migration up: Removed RT, RW, kelurahan, and kecamatan columns from user_addresses table');
}

export async function down(db: any) {
  // Add back the columns if we need to rollback
  await db.execute(sql`
    ALTER TABLE "user_addresses" 
    ADD COLUMN IF NOT EXISTS "rt" text,
    ADD COLUMN IF NOT EXISTS "rw" text,
    ADD COLUMN IF NOT EXISTS "kelurahan" text,
    ADD COLUMN IF NOT EXISTS "kecamatan" text
  `);
  
  console.log('Migration down: Added back RT, RW, kelurahan, and kecamatan columns to user_addresses table');
} 