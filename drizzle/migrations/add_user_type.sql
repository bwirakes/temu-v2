-- Create user_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE "user_type" AS ENUM ('job_seeker', 'employer');
    END IF;
END
$$;

-- Add user_type column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'user_type'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "user_type" user_type NOT NULL DEFAULT 'job_seeker';
    END IF;
END
$$; 