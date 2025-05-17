// scripts/run-drop-tables.js
// Script to run the migration to drop unused tables

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
    const migrationFilePath = path.join(__dirname, '../drizzle/migrations/drop_unused_tables.sql');
    const migrationSql = await readMigrationScript(migrationFilePath);

    console.log('Running migration to drop unused tables...');
    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Execute the migration script
      await client.query(migrationSql);
      
      console.log('Migration applied successfully');
      
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
    console.log('1. Run npm run generate to create proper migration files if needed');
  }
}

// Run the migration
applyMigration(); 