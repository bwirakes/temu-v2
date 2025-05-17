-- Add columns to user_addresses
ALTER TABLE "user_addresses" 
  ADD COLUMN IF NOT EXISTS "rt" TEXT,
  ADD COLUMN IF NOT EXISTS "rw" TEXT,
  ADD COLUMN IF NOT EXISTS "kelurahan" TEXT,
  ADD COLUMN IF NOT EXISTS "kecamatan" TEXT; 