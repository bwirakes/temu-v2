-- Migration script to update the database schema
-- For PostgreSQL on Neon DB

-- 1. Update willingToTravelEnum with new options
-- First, drop any existing type constraints or defaults
ALTER TABLE IF EXISTS user_profiles 
    DROP CONSTRAINT IF EXISTS user_profiles_ekspektasi_kerja_check;

-- Create new enum type with updated values if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'willing_to_travel') THEN
        CREATE TYPE willing_to_travel AS ENUM ('wfh', 'wfo', 'travel', 'relocate', 'local_only', 'domestic', 'international');
    ELSE
        -- If the type exists, we need to update it with new values
        -- This approach requires creating a new type temporarily
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'wfh';
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'wfo';
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'travel';
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'relocate';
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'local_only';
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'domestic';
        ALTER TYPE willing_to_travel ADD VALUE IF NOT EXISTS 'international';
    END IF;
END
$$;

-- 2. Update userPendidikan table to include tidakLulus if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_pendidikan' AND column_name = 'tidak_lulus'
    ) THEN
        ALTER TABLE user_pendidikan ADD COLUMN tidak_lulus BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- 3. No need to modify alasanKeluar in userPengalamanKerja as it's already a text field
-- which can accept any string value, so no schema change is required

-- 4. No need to modify ekspektasiKerja in userProfiles as it's already a JSONB type
-- which can store any JSON structure, so no schema change is required

-- Verify the changes
SELECT 
    pg_typeof(willing_to_travel)::text AS willing_to_travel_type,
    pg_typeof(ekspektasi_kerja)::text AS ekspektasi_kerja_type
FROM user_profiles
LIMIT 1;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_pendidikan' AND column_name = 'tidak_lulus';

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully';
END
$$; 
