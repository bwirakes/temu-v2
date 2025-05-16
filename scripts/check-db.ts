import 'dotenv/config';
import postgres from 'postgres';

async function checkDatabase() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  try {
    console.log('Checking database tables...');
    
    // PostgreSQL connection
    const sql = postgres(process.env.POSTGRES_URL);
    
    // Get list of tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\nDatabase tables:');
    for (const row of tables) {
      console.log(`- ${row.table_name}`);
    }
    
    // Count rows in important tables
    const importantTables = [
      'users', 
      'user_profiles', 
      'employers', 
      'jobs', 
      'job_applications'
    ];
    
    console.log('\nRow counts:');
    for (const table of importantTables) {
      const countResult = await sql`
        SELECT COUNT(*) as count FROM ${sql(table)}
      `;
      console.log(`- ${table}: ${countResult[0].count} rows`);
    }
    
    // Close the connection
    await sql.end();
    
    console.log('\nDatabase check completed!');
    process.exit(0);
  } catch (err) {
    console.error('Database check failed:', err);
    process.exit(1);
  }
}

checkDatabase().catch((err) => {
  console.error('Check failed:', err);
  process.exit(1);
}); 