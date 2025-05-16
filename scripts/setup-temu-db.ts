import 'dotenv/config';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Script to set up the TEMU database with mock data for testing.
 * This script will run the following tasks in sequence:
 * 1. Run database migrations to create the schema
 * 2. Create test users if they don't exist
 * 3. Generate mock data for testing
 */

function executeScript(scriptPath: string, description: string): boolean {
  const fullScriptPath = path.join(process.cwd(), scriptPath);
  
  if (!existsSync(fullScriptPath)) {
    console.error(`❌ Script not found: ${scriptPath}`);
    return false;
  }
  
  try {
    console.log(`\nRunning: ${description}...`);
    execSync(`pnpm tsx ${scriptPath}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error);
    return false;
  }
}

async function setupTemuDatabase() {
  try {
    // Check if POSTGRES_URL is defined
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not defined. Please check your .env file.');
    }

    console.log('Starting TEMU database setup...');
    console.log('=================================');
    console.log(`Using database: ${process.env.POSTGRES_URL.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);

    // Step 1: Run migrations
    console.log('\n[1/3] Running database migrations...');
    if (!executeScript('scripts/migrate.ts', 'database migrations')) {
      console.log('⚠️ Migration failed or was incomplete. Continuing with setup...');
    }

    // Step 2: Create test users
    console.log('\n[2/3] Setting up test users...');
    if (!executeScript('scripts/create-test-user.ts', 'test user creation')) {
      console.log('⚠️ Test user creation failed. Continuing with mock data generation...');
    }

    // Step 3: Generate mock data
    console.log('\n[3/3] Generating mock data...');
    if (!executeScript('scripts/generate-mock-data.ts', 'mock data generation')) {
      console.log('⚠️ Mock data generation failed.');
      throw new Error('Failed to generate mock data');
    }

    console.log('\n=================================');
    console.log('✅ TEMU database setup completed!');
    console.log('\nYou can now use the following test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Password123');
    console.log('\nRandom user accounts have also been generated with the same password.');
    console.log('=================================');
  } catch (error) {
    console.error('\n❌ Error setting up TEMU database:', error);
    process.exit(1);
  }
}

setupTemuDatabase(); 