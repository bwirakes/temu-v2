import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// List of tables and their expected columns based on db.ts
const expectedTables = {
  users: ['id', 'name', 'email', 'email_verified', 'password', 'image', 'user_type', 'created_at', 'updated_at'],
  accounts: ['id', 'user_id', 'type', 'provider', 'provider_account_id', 'refresh_token', 'access_token', 'expires_at', 'token_type', 'scope', 'id_token', 'session_state'],
  sessions: ['id', 'user_id', 'session_token', 'expires'],
  verification_tokens: ['identifier', 'token', 'expires'],
  products: ['id', 'image_url', 'name', 'status', 'price', 'stock', 'available_at'],
  user_profiles: ['id', 'user_id', 'nama_lengkap', 'email', 'nomor_telepon', 'tanggal_lahir', 'tempat_lahir', 'jenis_kelamin', 'cv_file_url', 'cv_upload_date', 'profile_photo_url', 'level_pengalaman', 'ekspektasi_kerja', 'created_at', 'updated_at'],
  user_addresses: ['id', 'user_profile_id', 'jalan', 'rt', 'rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'kode_pos', 'created_at', 'updated_at'],
  user_pengalaman_kerja: ['id', 'user_profile_id', 'level_pengalaman', 'nama_perusahaan', 'posisi', 'tanggal_mulai', 'tanggal_selesai', 'deskripsi_pekerjaan', 'lokasi_kerja', 'lokasi', 'alasan_keluar', 'created_at', 'updated_at'],
  user_pendidikan: ['id', 'user_profile_id', 'nama_institusi', 'jenjang_pendidikan', 'bidang_studi', 'tanggal_lulus', 'nilai_akhir', 'lokasi', 'deskripsi_tambahan', 'created_at', 'updated_at'],
  employers: ['id', 'user_id', 'nama_perusahaan', 'merek_usaha', 'industri', 'alamat_kantor', 'email', 'website', 'social_media', 'logo_url', 'pic', 'created_at', 'updated_at'],
  jobs: ['id', 'employer_id', 'job_id', 'job_title', 'min_work_experience', 'posted_date', 'number_of_positions', 'last_education', 'required_competencies', 'expectations', 'additional_requirements', 'is_confirmed', 'created_at', 'updated_at'],
  job_work_locations: ['id', 'job_id', 'city', 'province', 'is_remote', 'address', 'created_at', 'updated_at'],
  job_applications: ['id', 'applicant_profile_id', 'job_id', 'status', 'additional_notes', 'education', 'resume_url', 'cv_file_url'],
  employer_onboarding_progress: ['id', 'user_id', 'current_step', 'status', 'data', 'last_updated', 'created_at']
};

// Expected enums
const expectedEnums = [
  'status', 'jenis_kelamin', 'lokasi_kerja', 'tingkat_keahlian', 'agama', 
  'level_pengalaman', 'willing_to_travel', 'application_status', 'user_type',
  'last_education', 'employer_onboarding_status'
];

async function verifyTables() {
  try {
    const sql = postgres(process.env.POSTGRES_URL!, { max: 1 });

    console.log('Verifying database schema...');

    // Get list of all tables
    const tables = await sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tableNames = tables.map(row => row.tablename);
    
    console.log('\n--- Tables ---');
    console.log('Tables in database:', tableNames);
    
    const missingTables = Object.keys(expectedTables).filter(table => !tableNames.includes(table));
    if (missingTables.length > 0) {
      console.log('\n⚠️ Missing tables:', missingTables);
    } else {
      console.log('\n✅ All expected tables exist');
    }

    // Check columns for each table
    console.log('\n--- Columns ---');
    for (const tableName of tableNames) {
      if (expectedTables[tableName as keyof typeof expectedTables]) {
        const columns = await sql`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = ${tableName}
        `;
        const columnNames = columns.map(row => row.column_name);
        
        const expectedCols = expectedTables[tableName as keyof typeof expectedTables];
        const missingColumns = expectedCols.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`\n⚠️ Table '${tableName}' is missing columns:`, missingColumns);
        } else {
          console.log(`✅ Table '${tableName}' has all expected columns`);
        }
      }
    }

    // Check enums
    console.log('\n--- Enums ---');
    const enums = await sql`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e'::char
    `;
    const enumNames = enums.map(row => row.typname);
    
    console.log('Enums in database:', enumNames);
    
    const missingEnums = expectedEnums.filter(enum_ => !enumNames.includes(enum_));
    if (missingEnums.length > 0) {
      console.log('\n⚠️ Missing enums:', missingEnums);
    } else {
      console.log('\n✅ All expected enums exist');
    }

    await sql.end();
  } catch (error) {
    console.error('Error verifying tables:', error);
  } finally {
    process.exit(0);
  }
}

verifyTables(); 