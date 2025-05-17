import 'dotenv/config';
import postgres from 'postgres';

async function runMigrations() {
  console.log('Starting database migrations...');
  
  // Get the database URL
  const dbUrl = process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.error('Error: POSTGRES_URL must be defined in environment variables');
    return false;
  }
  
  // Initialize database connection
  const sql = postgres(dbUrl, {
    max: 1,
    idle_timeout: 30,
    connect_timeout: 10
  });
  
  try {
    // Check if profile_photo_url column exists in user_profiles table
    const profilePhotoCheckResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'profile_photo_url'
    `;
    
    // Add profile_photo_url column if it doesn't exist
    if (profilePhotoCheckResult.length === 0) {
      console.log('Adding profile_photo_url column to user_profiles table...');
      await sql`
        ALTER TABLE user_profiles
        ADD COLUMN profile_photo_url TEXT
      `;
      console.log('✅ profile_photo_url column added successfully.');
    } else {
      console.log('✅ profile_photo_url column already exists.');
    }
    
    // Check if level_pengalaman column exists in user_profiles table
    const levelPengalamanCheckResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'level_pengalaman'
    `;
    
    // Add level_pengalaman column if it doesn't exist
    if (levelPengalamanCheckResult.length === 0) {
      console.log('Adding level_pengalaman column to user_profiles table...');
      await sql`
        ALTER TABLE user_profiles
        ADD COLUMN level_pengalaman TEXT
      `;
      console.log('✅ level_pengalaman column added successfully.');
    } else {
      console.log('✅ level_pengalaman column already exists.');
    }
    
    console.log('All migrations completed successfully! ✨');
    
    // Close the database connection
    await sql.end();
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    
    // Close the database connection even if there's an error
    try {
      await sql.end();
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
    
    return false;
  }
}

// Run migrations immediately if this script is executed directly
if (require.main === module) {
  runMigrations()
    .then(success => {
      if (success) {
        console.log('Migration process completed successfully.');
        process.exit(0);
      } else {
        console.error('Migration process failed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error during migration:', error);
      process.exit(1);
    });
} 
