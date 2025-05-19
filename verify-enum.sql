-- Check if willing_to_travel enum type exists and its values
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'willing_to_travel'
ORDER BY e.enumsortorder; 