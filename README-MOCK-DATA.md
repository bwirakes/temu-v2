# TEMU Mock Data Setup

This README explains how to set up the TEMU application with mock data for testing and development purposes.

## Prerequisites

Before setting up the mock data, make sure you have the following:

1. Node.js (v18 or higher) and pnpm installed
2. PostgreSQL database (local or using NeonDB)
3. `.env` file with your database configuration

## Setting Up Your Environment

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your PostgreSQL connection string:

   ```
   POSTGRES_URL=postgresql://username:password@localhost:5432/temu
   ```

   If using NeonDB, your connection string will look like:

   ```
   POSTGRES_URL=postgres://username:password@endpoint/database
   ```

## Running the Setup

We've created a one-command script to set up your database:

```bash
pnpm setup-temu
```

This will perform the following steps:

1. Run database migrations to create the schema
2. Create test users if they don't exist
3. Generate mock data for testing

### What Mock Data is Created?

The script generates a complete testing environment with:

- **Users**: 5 test users with Indonesian names
- **User Profiles**: Detailed profiles with personal information
- **Work Experience**: 1-3 work experiences per user profile
- **Education**: 1-2 education entries per user profile
- **Skills and Languages**: Various technical skills and languages
- **Certifications**: 0-2 certifications per user profile
- **Employers**: 5 Indonesian companies with details
- **Jobs**: 2-4 job postings per employer
- **Job Applications**: 0-3 applications per job

All data is in Indonesian to maintain consistency across the application.

## Test Credentials

After setup, you can login with:

- **Email**: `test@example.com`
- **Password**: `Password123`

Additional user accounts are also created with the same password.

## Exploring the Data

To explore your database, you can use Drizzle Studio:

```bash
pnpm studio
```

This will open a browser window with a UI to explore and edit your database.

## Working with Data in Development

When working with the application in development mode:

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Access the application at http://localhost:3000
3. Log in with the test credentials

## Migrating to Production

When ready to migrate to production:

1. Set up a NeonDB instance at https://neon.tech
2. Update your production environment variables with the NeonDB connection string
3. Run migrations on your production database

## Troubleshooting

- **Database Connection Issues**: Make sure your PostgreSQL server is running and the connection string in `.env` is correct.
- **Migration Errors**: If you encounter migration errors, check if your database is already initialized. You might need to drop and recreate it.
- **Script Execution Errors**: Make sure you have installed all dependencies with `pnpm install`. 