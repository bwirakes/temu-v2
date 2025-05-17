// scripts/run-schema-sync.js
// Script to run the schema sync migration

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read migration script
async function readMigrationScript(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Apply migration
async function applyMigration() {
  console.log('Connecting to database...');
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Get the migration SQL file
    const migrationFilePath = path.join(__dirname, '../drizzle/migrations/schema_sync_migration.sql');
    const migrationSql = await readMigrationScript(migrationFilePath);

    console.log('Running schema sync migration...');
    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Execute the migration script
      await client.query(migrationSql);
      
      // If successful, update the db-cli.ts file to match db.ts
      console.log('Migration applied successfully');
      console.log('Now you should run: npm run generate to update db-cli.ts');
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('Changes committed to database');
    } catch (migrationError) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('Error during migration, rolling back:', migrationError);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
    console.log('Next steps:');
    console.log('1. Update lib/db-cli.ts to match lib/db.ts');
    console.log('2. Run npm run generate to create proper migration files if needed');
  }
}

// Run the migration
applyMigration(); 