import 'dotenv/config';
import postgres from 'postgres';

async function addUserTypeColumn() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  
  console.log('Connecting to database...');
  const sql = postgres(process.env.POSTGRES_URL);
  
  try {
    console.log('Creating user_type enum if it does not exist...');
    await sql.unsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
          CREATE TYPE user_type AS ENUM ('job_seeker', 'employer');
        END IF;
      END
      $$;
    `);
    
    console.log('Checking if user_type column exists...');
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'user_type'
    `;
    
    if (columnExists.length === 0) {
      console.log('Adding user_type column to users table...');
      await sql.unsafe(`
        ALTER TABLE users
        ADD COLUMN user_type user_type NOT NULL DEFAULT 'job_seeker'
      `);
      console.log('Column added successfully!');
    } else {
      console.log('Column user_type already exists.');
    }
  } catch (err) {
    console.error('Error adding user_type column:', err);
    process.exit(1);
  } finally {
    await sql.end();
    console.log('Connection closed.');
  }
  
  console.log('Migration completed successfully!');
  process.exit(0);
}

addUserTypeColumn().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 