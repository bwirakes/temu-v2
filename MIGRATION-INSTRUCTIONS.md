# Database Migration Instructions

This document provides instructions for ensuring your PostgreSQL database schema is in sync with the schema defined in `lib/db.ts`.

## Issue

There is a discrepancy between the database schema defined in `lib/db.ts` (used for runtime) and `lib/db-cli.ts` (used for migrations). This can lead to problems where the application expects columns that don't exist in the database.

## Solution

We've provided a migration script to update your PostgreSQL database schema to match the definitions in `lib/db.ts`.

## Steps to Run the Migration

1. Make sure you have the correct environment variables set in your `.env` file, particularly `POSTGRES_URL`.

2. Run the schema sync migration:

```bash
node scripts/run-schema-sync.js
```

This script will:
- Connect to your PostgreSQL database
- Run the migration in `drizzle/migrations/schema_sync_migration.sql`
- Make the following changes:
  - Update `user_profiles` table:
    - Remove `unique` constraint from `email` column
    - Remove columns: `berat_badan`, `tinggi_badan`, `agama`, `foto_profil_url`
    - Add columns: `tempat_lahir`, `cv_file_url`, `cv_upload_date`, `ekspektasi_kerja`
  - Update `user_pendidikan` table:
    - Add column: `lokasi`
  - Ensure all required enums exist
  - Create `employer_onboarding_progress` table if it doesn't exist

3. Verify the migration was successful by connecting to your database and checking the schema.

## Keeping Schemas in Sync

To avoid similar issues in the future:

1. Always make schema changes in both `lib/db.ts` and `lib/db-cli.ts`
2. After making changes, run `npm run generate` to create proper migration files
3. Apply migrations using Drizzle's migration tools

## Troubleshooting

If you encounter errors during migration:

1. The script uses transactions, so failed migrations should be rolled back automatically
2. Check the error message for details on what went wrong
3. Make sure you have the necessary permissions to modify the database schema
4. If you have data in the affected tables, you may need to handle data migration separately

For persistent issues, you may need to manually modify the database schema or contact a database administrator for assistance. 