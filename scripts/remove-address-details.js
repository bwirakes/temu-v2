// Script to remove detailed address fields from user_addresses table
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Connecting to database...');
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Migration SQL (inline for simplicity)
    const migrationSql = `
      -- Migration to remove detailed address fields
      ALTER TABLE "user_addresses" 
      DROP COLUMN IF EXISTS "rt",
      DROP COLUMN IF EXISTS "rw",
      DROP COLUMN IF EXISTS "kelurahan",
      DROP COLUMN IF EXISTS "kecamatan";
      
      -- Record migration in _migrations table if it exists
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_migrations') THEN
          INSERT INTO _migrations (migration_name, created_at)
          VALUES ('0001_remove_address_details', NOW())
          ON CONFLICT (migration_name) DO NOTHING;
        END IF;
      END $$;
    `;

    console.log('Running migration to remove detailed address fields...');
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

// Run the migration
runMigration(); 