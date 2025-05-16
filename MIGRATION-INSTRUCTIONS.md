# Database Migration Instructions

This document provides instructions on how to apply the missing `employer_onboarding_progress` table to the database.

## Background

The application encounters a Postgres error indicating that the `employer_onboarding_progress` table does not exist:

```
Error updating employer onboarding progress: [Error [PostgresError]: relation "employer_onboarding_progress" does not exist]
```

This happens because the table is defined in the code but not created in the database.

## Option 1: Run the Migration Script (Recommended)

1. Make sure you have all dependencies installed:

```bash
npm install
```

2. Run the migration script using npm:

```bash
npm run migration:run
```

This script will connect to your database using the `POSTGRES_URL` from your environment variables and execute the SQL script to create the necessary table and enum type.

## Option 2: Run SQL Directly in Database

If you prefer to run the SQL directly in your database management tool:

1. Open `scripts/create-employer-onboarding-table.sql`
2. Copy the contents of the file
3. Paste and execute the SQL in your PostgreSQL client (pgAdmin, psql, etc.)

## Option 3: Use Drizzle Migration

If you're using Drizzle for migrations:

1. The migration files have already been created in `drizzle/0001_employer_onboarding_progress.sql`
2. The journal file has been updated in `drizzle/meta/_journal.json`
3. Run Drizzle migrate command if you have it set up in your workflow:

```bash
npx drizzle-kit push:pg
```

## Verification

To verify that the table has been created successfully:

1. Check the database to confirm the table exists:

```sql
SELECT * FROM pg_tables WHERE tablename = 'employer_onboarding_progress';
```

2. Restart your application server
3. Try using the employer onboarding functionality again

## Troubleshooting

If you encounter issues:

1. Check that your database connection string in the `.env` file is correct
2. Verify that the user has permissions to create tables in the database
3. Look for any error messages in the console when running the migration

For additional help, please contact the development team. 