-- Add email field to employers table
ALTER TABLE "employers" ADD COLUMN "email" text NOT NULL DEFAULT '';

-- Update all existing records to use a placeholder email address
-- This is necessary because we're adding a NOT NULL column to existing data
UPDATE "employers" SET "email" = CONCAT('placeholder-', "id", '@example.com');

-- After migration, remove the default value so new entries must provide an email
ALTER TABLE "employers" ALTER COLUMN "email" DROP DEFAULT; 