-- Migration file to drop unused tables

-- First check if the tables exist and drop them

-- Drop user_social_media if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_social_media') THEN
        DROP TABLE "user_social_media";
    END IF;
END
$$;

-- Drop user_keahlian if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_keahlian') THEN
        DROP TABLE "user_keahlian";
    END IF;
END
$$;

-- Drop user_sertifikasi if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sertifikasi') THEN
        DROP TABLE "user_sertifikasi";
    END IF;
END
$$;

-- Drop user_bahasa if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_bahasa') THEN
        DROP TABLE "user_bahasa";
    END IF;
END
$$; 