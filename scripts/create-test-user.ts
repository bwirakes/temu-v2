import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, users } from '../lib/db-cli';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  try {
    console.log('Connecting to database...');
    
    // Check if test user already exists
    console.log('Checking if test user exists...');
    const existingUser = await db.select().from(users).where(eq(users.email, 'test@example.com'));
    
    if (existingUser.length > 0) {
      console.log('Test user already exists');
    } else {
      // Hash password
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('Password123', 10);
      
      // Insert test user
      const [newUser] = await db.insert(users).values({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      console.log(`Test user created successfully with ID: ${newUser.id}`);
    }
    
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createTestUser(); 