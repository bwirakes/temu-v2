-- Migration for converting required_competencies from JSONB to TEXT

-- Start a transaction to ensure consistency
BEGIN;

-- 1. First create a backup of the existing data we want to preserve
CREATE TEMP TABLE jobs_backup AS
SELECT id, jsonb_typeof(required_competencies) AS rc_type, required_competencies
FROM jobs
WHERE required_competencies IS NOT NULL;

-- 2. Drop the existing JSONB column (this is safer than trying to convert in-place)
ALTER TABLE jobs DROP COLUMN IF EXISTS required_competencies;

-- 3. Add the new TEXT column
ALTER TABLE jobs ADD COLUMN required_competencies TEXT;

-- 4. Restore data from the backup with proper conversion
UPDATE jobs j
SET required_competencies = (
  SELECT 
    CASE
      -- When it was a JSON array, try to convert elements to string and join with newlines
      WHEN b.rc_type = 'array' THEN 
        (SELECT string_agg(value::text, E'\n') 
         FROM jsonb_array_elements_text(b.required_competencies))
      -- When it was a string value in JSON, extract it directly
      WHEN b.rc_type = 'string' THEN 
        b.required_competencies#>>'{}'
      -- Fallback: just convert to empty string to avoid errors
      ELSE ''
    END
  FROM jobs_backup b
  WHERE b.id = j.id
);

-- 5. Drop the temporary table
DROP TABLE jobs_backup;

-- End the transaction
COMMIT; 