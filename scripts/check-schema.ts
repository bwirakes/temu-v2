import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Create a direct connection to the database
    const sql = postgres(process.env.POSTGRES_URL!, { max: 1 });
    
    // Check users table columns
    const usersColumns = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    console.log('Users table columns:', usersColumns.map(row => row.column_name));

    // Check if user_type enum exists
    const userTypeEnum = await sql`
      SELECT typname FROM pg_type WHERE typname = 'user_type'
    `;
    console.log('user_type enum exists:', userTypeEnum.length > 0);

    if (userTypeEnum.length === 0) {
      console.log('The user_type enum does not exist in the database.');
    }

    // Get a list of all tables
    const tables = await sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    console.log('Tables in database:', tables.map(row => row.tablename));

    await sql.end();
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema(); 
