import { sql } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export async function up(db: PostgresJsDatabase) {
  // Remove contract_type column from jobs table
  await db.execute(sql`ALTER TABLE "jobs" DROP COLUMN IF EXISTS "contract_type";`);
}

export async function down(db: PostgresJsDatabase) {
  // Add back contract_type column if needed to roll back
  await db.execute(sql`ALTER TABLE "jobs" ADD COLUMN "contract_type" TEXT;`);
  
  // Since we can't restore the data, we'll just set it to a default value
  await db.execute(sql`UPDATE "jobs" SET "contract_type" = 'FULL_TIME';`);
  
  // Make the column not nullable to match the original schema
  await db.execute(sql`ALTER TABLE "jobs" ALTER COLUMN "contract_type" SET NOT NULL;`);
} 