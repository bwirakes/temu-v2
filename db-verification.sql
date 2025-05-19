-- Verification script for database migration

-- Check if willing_to_travel enum type exists and its values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'willing_to_travel'
ORDER BY e.enumsortorder;

-- Check if tidak_lulus column exists in user_pendidikan table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_pendidikan' AND column_name = 'tidak_lulus';

-- Check ekspektasi_kerja column in user_profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'ekspektasi_kerja';

-- Check alasanKeluar column in user_pengalaman_kerja table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_pengalaman_kerja' AND column_name = 'alasan_keluar'; 