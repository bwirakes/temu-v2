// scripts/run-migration.js
// Script to run the latest migration manually

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read migration script
async function readMigrationScript(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Apply migration
async function applyMigration(migrationFile) {
  console.log('Connecting to database...');
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Get the migration SQL file
    const migrationFilePath = migrationFile || path.join(__dirname, '../drizzle/0001_employer_onboarding_progress.sql');
    const migrationSql = await readMigrationScript(migrationFilePath);

    console.log('Running migration...');
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute the migration script
    await client.query(migrationSql);
    
    console.log('Migration applied successfully');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Changes committed to database');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Get the migration file path from command line arguments
const migrationFile = process.argv[2] || null;

// Run the migration from command line arguments
if (migrationFile) {
  applyMigration(migrationFile);
} else {
  // If no file specified, run our requiredCompetencies migration
  const requiredCompetenciesMigration = path.join(__dirname, '..', 'migrations', '0010_convert_required_competencies_to_text.sql');
  console.log('Running migration to convert requiredCompetencies from JSONB to TEXT...');
  applyMigration(requiredCompetenciesMigration);
}

// Note: You need to have the POSTGRES_URL environment variable set
// You can run this script with: POSTGRES_URL=your_postgres_connection_string node scripts/run-migration.js 