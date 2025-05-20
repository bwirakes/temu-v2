import * as dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env file
dotenv.config();

async function main() {
  console.log('Adding status_change_reason column to job_applications table...');
  
  // Initialize PostgreSQL connection
  console.log('Connecting to database...');
  const sql = postgres(process.env.POSTGRES_URL!, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10
  });
  
  console.log('Connected to database successfully');
  console.log('Running migration...');
  
  try {
    // Execute the migration
    await sql`
      ALTER TABLE "job_applications" 
      ADD COLUMN IF NOT EXISTS "status_change_reason" TEXT;
    `;
    console.log('✅ status_change_reason column added successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await sql.end();
    console.log('Database connection closed.');
  }
  
  console.log('Migration process completed successfully.');
}

main().catch(console.error); 