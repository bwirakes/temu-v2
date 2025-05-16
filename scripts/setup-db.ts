import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import bcrypt from 'bcryptjs';
import { db, users } from '../lib/db-cli';
import { eq } from 'drizzle-orm';

async function setupDatabase() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  
  console.log('Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Migrations completed!');
  } catch (err) {
    console.error('Migration failed:', err);
    console.log('Continuing to create test user...');
  }
  
  // Create a test user
  try {
    console.log('Creating test user...');
    
    const hashedPassword = await bcrypt.hash('Password123', 10);
    
    const existingUser = await db.select().from(users).where(eq(users.email, 'test@example.com'));
    
    if (existingUser.length > 0) {
      console.log('Test user already exists');
    } else {
      await db.insert(users).values({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        userType: 'job_seeker',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Test user created successfully');
    }
    
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123');
  } catch (err) {
    console.error('Error creating test user:', err);
  }
  
  process.exit(0);
}

setupDatabase().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
}); 