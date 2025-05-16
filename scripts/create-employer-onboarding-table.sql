-- Direct SQL script to create employer_onboarding_progress table
-- This can be run directly in your PostgreSQL database if you prefer

-- Create the employer_onboarding_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employer_onboarding_status') THEN
        CREATE TYPE employer_onboarding_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
    END IF;
END $$;

-- Create the employer_onboarding_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS employer_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  status employer_onboarding_status NOT NULL DEFAULT 'NOT_STARTED',
  data JSONB,
  last_updated TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create index for faster lookups by user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS employer_onboarding_user_id_idx ON employer_onboarding_progress (user_id); 