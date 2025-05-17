-- Create willing_to_travel enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'willing_to_travel') THEN
        CREATE TYPE "willing_to_travel" AS ENUM ('local_only', 'jabodetabek', 'anywhere');
    END IF;
END
$$; 