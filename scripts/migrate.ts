import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main migration function
 */
async function runMigrations() {
  console.log("Starting database migration...");
  
  // Check if DATABASE_URL or POSTGRES_URL is present
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL or POSTGRES_URL must be defined in environment variables");
    process.exit(1);
  }
  
  try {
    // Get all migration files from the drizzle/migrations directory
    const migrationsDir = path.join(process.cwd(), "drizzle", "migrations");
    const files = await fs.readdir(migrationsDir);
    
    // Filter for .sql files and sort them
    const sqlFiles = files
      .filter(file => file.endsWith(".sql"))
      .sort();
    
    console.log(`Found ${sqlFiles.length} migration files.`);
    
    // Execute each migration file in sequence
    for (const file of sqlFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      
      // Read the SQL content
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Run the migration using psql command
      await executeSql(dbUrl, sql);
      
      console.log(`Completed migration: ${file}`);
    }
    
    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

/**
 * Execute SQL command against the database
 */
function executeSql(dbUrl: string, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use environment variable to pass the SQL and run psql
    const child = exec(
      `psql "${dbUrl}" -c "${sql.replace(/"/g, '\\"')}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("SQL execution error:", stderr);
          reject(error);
          return;
        }
        
        console.log(stdout);
        resolve();
      }
    );
  });
}

// Run the migrations
runMigrations().catch(console.error); 