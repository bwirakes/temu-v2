import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../lib/db-cli';

async function runMigrations() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('Migration script error:', err);
  process.exit(1);
}); 