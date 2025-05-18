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
    
    // Check if additional_notes column exists in job_applications table
    const additionalNotesCheckResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'job_applications' 
      AND column_name = 'additional_notes'
    `;
    
    // Add additional_notes column if it doesn't exist
    if (additionalNotesCheckResult.length === 0) {
      console.log('Adding additional_notes column to job_applications table...');
      await sql`
        ALTER TABLE job_applications
        ADD COLUMN additional_notes TEXT
      `;
      console.log('✅ additional_notes column added successfully.');
    } else {
      console.log('✅ additional_notes column already exists.');
    }
    
    // Check if cv_file_url column exists in job_applications table
    const cvFileUrlCheckResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'job_applications' 
      AND column_name = 'cv_file_url'
    `;
    
    // Add cv_file_url column if it doesn't exist
    if (cvFileUrlCheckResult.length === 0) {
      console.log('Adding cv_file_url column to job_applications table...');
      await sql`
        ALTER TABLE job_applications
        ADD COLUMN cv_file_url TEXT
      `;
      console.log('✅ cv_file_url column added successfully.');
    } else {
      console.log('✅ cv_file_url column already exists.');
    }
    
    // Check if education column exists in job_applications table
    const educationCheckResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'job_applications' 
      AND column_name = 'education'
    `;
    
    // Add education column if it doesn't exist
    if (educationCheckResult.length === 0) {
      console.log('Adding education column to job_applications table...');
      
      // First, check if the last_education enum type exists
      const enumCheckResult = await sql`
        SELECT typname FROM pg_type 
        WHERE typname = 'last_education'
      `;
      
      if (enumCheckResult.length === 0) {
        // Create the enum type if it doesn't exist
        console.log('Creating last_education enum type...');
        await sql`
          CREATE TYPE last_education AS ENUM (
            'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'
          )
        `;
        console.log('✅ last_education enum type created successfully.');
      }
      
      // Add the education column using the enum type
      await sql`
        ALTER TABLE job_applications
        ADD COLUMN education last_education
      `;
      console.log('✅ education column added successfully.');
    } else {
      console.log('✅ education column already exists.');
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
