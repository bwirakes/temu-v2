#!/bin/bash

# PostgreSQL connection string (with password masked in output)
DB_URL="postgresql://neondb_owner:npg_A40kcPvIneaD@ep-shiny-shape-a19q0tip-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
MASKED_URL="postgresql://neondb_owner:***@ep-shiny-shape-a19q0tip-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo "Connecting to: $MASKED_URL"

# Run migration commands
echo "Executing migration..."

# Check if willing_to_travel enum exists and create it if necessary
psql "$DB_URL" << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'willing_to_travel') THEN
        CREATE TYPE willing_to_travel AS ENUM ('wfh', 'wfo', 'travel', 'relocate', 'local_only', 'domestic', 'international');
        RAISE NOTICE 'Created willing_to_travel enum type';
    ELSE
        RAISE NOTICE 'willing_to_travel enum already exists';
    END IF;
END
\$\$;
EOF

# Add new values to the enum if it exists
psql "$DB_URL" << EOF
DO \$\$
BEGIN
    -- Add each value if it doesn't exist
    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'wfh';
        RAISE NOTICE 'Added wfh to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value wfh already exists in willing_to_travel';
    END;

    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'wfo';
        RAISE NOTICE 'Added wfo to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value wfo already exists in willing_to_travel';
    END;

    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'travel';
        RAISE NOTICE 'Added travel to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value travel already exists in willing_to_travel';
    END;

    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'relocate';
        RAISE NOTICE 'Added relocate to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value relocate already exists in willing_to_travel';
    END;

    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'local_only';
        RAISE NOTICE 'Added local_only to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value local_only already exists in willing_to_travel';
    END;

    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'domestic';
        RAISE NOTICE 'Added domestic to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value domestic already exists in willing_to_travel';
    END;

    BEGIN
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'international';
        RAISE NOTICE 'Added international to willing_to_travel';
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Value international already exists in willing_to_travel';
    END;
END
\$\$;
EOF

# Add tidak_lulus column to user_pendidikan if it doesn't exist
psql "$DB_URL" << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_pendidikan' AND column_name = 'tidak_lulus'
    ) THEN
        ALTER TABLE user_pendidikan ADD COLUMN tidak_lulus BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added tidak_lulus column to user_pendidikan';
    ELSE
        RAISE NOTICE 'tidak_lulus column already exists in user_pendidikan';
    END IF;
END
\$\$;
EOF

# Verify the enum values
echo "Verifying enum values:"
psql "$DB_URL" -c "SELECT t.typname AS enum_name, e.enumlabel AS enum_value
                  FROM pg_type t
                  JOIN pg_enum e ON t.oid = e.enumtypid
                  WHERE t.typname = 'willing_to_travel'
                  ORDER BY e.enumsortorder;"

# Verify tidak_lulus column
echo "Verifying tidak_lulus column:"
psql "$DB_URL" -c "SELECT column_name, data_type, is_nullable, column_default
                  FROM information_schema.columns
                  WHERE table_name = 'user_pendidikan' AND column_name = 'tidak_lulus';"

echo "Migration completed!"