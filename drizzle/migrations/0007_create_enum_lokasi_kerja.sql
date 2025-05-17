-- Create lokasi_kerja enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lokasi_kerja') THEN
        CREATE TYPE "lokasi_kerja" AS ENUM ('WFH', 'WFO', 'Hybrid');
    END IF;
END
$$; 