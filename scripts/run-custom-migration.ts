import 'dotenv/config';
import postgres from 'postgres';

async function runMigrations() {
  console.log('Starting database migrations for extended job application fields...');
  
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
    // Add new columns to job_applications table
    const newColumns = [
      { name: 'tanggal_lahir', type: 'DATE' },
      { name: 'jenis_kelamin', type: 'VARCHAR(50)' },
      { name: 'kota_domisili', type: 'VARCHAR(255)' },
      { name: 'pendidikan_full', type: 'JSONB' },
      { name: 'pengalaman_kerja_full', type: 'JSONB' },
      { name: 'pengalaman_kerja_terakhir', type: 'JSONB' },
      { name: 'gaji_terakhir', type: 'INTEGER' },
      { name: 'level_pengalaman', type: 'VARCHAR(100)' },
      { name: 'ekspektasi_gaji', type: 'JSONB' },
      { name: 'preferensi_lokasi_kerja', type: 'JSONB' },
      { name: 'preferensi_jenis_pekerjaan', type: 'JSONB' }
    ];
    
    for (const column of newColumns) {
      // Check if column exists
      const columnCheckResult = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'job_applications' 
        AND column_name = ${column.name}
      `;
      
      // Add column if it doesn't exist
      if (columnCheckResult.length === 0) {
        console.log(`Adding ${column.name} column to job_applications table...`);
        await sql.unsafe(`
          ALTER TABLE job_applications
          ADD COLUMN ${column.name} ${column.type}
        `);
        console.log(`✅ ${column.name} column added successfully.`);
      } else {
        console.log(`✅ ${column.name} column already exists.`);
      }
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