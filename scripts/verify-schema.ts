import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

async function verifySchema() {
  console.log("Verifying database schema...");
  
  // Check if DATABASE_URL or POSTGRES_URL is present
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL or POSTGRES_URL must be defined in environment variables");
    process.exit(1);
  }
  
  // Connect to the database
  const sql = postgres(dbUrl);
  
  try {
    // Check user_profiles table
    console.log("\n=== Checking user_profiles table ===");
    const userProfileColumns = await sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position;
    `;
    
    console.table(userProfileColumns);
    
    // Check if removed columns are gone
    const removedColumns = ['berat_badan', 'tinggi_badan', 'agama', 'foto_profil_url', 'status_pernikahan'];
    for (const column of removedColumns) {
      const hasColumn = userProfileColumns.some(col => col.column_name === column);
      if (hasColumn) {
        console.warn(`⚠️ Column ${column} still exists in user_profiles table`);
      } else {
        console.log(`✅ Column ${column} successfully removed from user_profiles table`);
      }
    }
    
    // Check user_addresses table
    console.log("\n=== Checking user_addresses table ===");
    const userAddressColumns = await sql`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'user_addresses'
      ORDER BY ordinal_position;
    `;
    
    console.table(userAddressColumns);
    
    // Check if new columns are added
    const newAddressColumns = ['rt', 'rw', 'kelurahan', 'kecamatan'];
    for (const column of newAddressColumns) {
      const hasColumn = userAddressColumns.some(col => col.column_name === column);
      if (hasColumn) {
        console.log(`✅ Column ${column} exists in user_addresses table`);
      } else {
        console.warn(`⚠️ Column ${column} not found in user_addresses table`);
      }
    }
    
    // Check if tables are removed
    console.log("\n=== Checking dropped tables ===");
    const droppedTables = ['user_bahasa', 'user_sertifikasi', 'user_keahlian', 'user_social_media'];
    for (const table of droppedTables) {
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        ) as exists;
      `;
      
      if (tableExists[0].exists) {
        console.warn(`⚠️ Table ${table} still exists`);
      } else {
        console.log(`✅ Table ${table} successfully dropped`);
      }
    }
    
    // Check enums
    console.log("\n=== Checking enum types ===");
    const enumTypes = ['willing_to_travel', 'lokasi_kerja'];
    for (const type of enumTypes) {
      const typeExists = await sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = ${type}
        ) as exists;
      `;
      
      if (typeExists[0].exists) {
        console.log(`✅ Enum type ${type} exists`);
        
        // Get enum values
        const enumValues = await sql`
          SELECT e.enumlabel
          FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = ${type}
          ORDER BY e.enumsortorder;
        `;
        
        console.log(`   Values: ${enumValues.map(v => v.enumlabel).join(', ')}`);
      } else {
        console.warn(`⚠️ Enum type ${type} not found`);
      }
    }
    
    console.log("\nSchema verification completed!");
  } catch (error) {
    console.error("Error verifying schema:", error);
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the verification
verifySchema().catch(console.error); 