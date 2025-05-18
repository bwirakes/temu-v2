-- First, check if the last_education enum type exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'last_education') THEN
        -- Create the last_education enum type if it does not exist
        CREATE TYPE last_education AS ENUM (
            'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'
        );
    END IF;
END $$;

-- Then, add the last_education column to the jobs table if it doesn't exist
ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "last_education" last_education; 