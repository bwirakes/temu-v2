import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  console.log('Running migration to add cv_file_url to job_applications table...');
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'drizzle', 'migrations', '0009_add_cv_file_url_to_job_applications.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSql);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error); 