// Script to remove contract_type from jobs table
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  try {
    // Create a connection pool
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });

    console.log('Connected to database, removing contract_type column...');

    // Execute the SQL that removes the contract_type column
    const result = await pool.query('ALTER TABLE jobs DROP COLUMN IF EXISTS contract_type;');
    
    console.log('Column removed successfully:', result);
    
    // Close the connection
    await pool.end();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

main(); 