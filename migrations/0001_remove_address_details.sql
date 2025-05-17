-- Migration to remove detailed address fields
-- This is a more direct SQL approach for running the migration without Drizzle ORM

-- Drop columns: rt, rw, kelurahan, and kecamatan from user_addresses table
ALTER TABLE "user_addresses" 
DROP COLUMN IF EXISTS "rt",
DROP COLUMN IF EXISTS "rw",
DROP COLUMN IF EXISTS "kelurahan",
DROP COLUMN IF EXISTS "kecamatan";

-- Record migration in _migrations table if it exists
INSERT INTO _migrations (migration_name, created_at)
SELECT '0001_remove_address_details', NOW()
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_migrations')
ON CONFLICT (migration_name) DO NOTHING; 