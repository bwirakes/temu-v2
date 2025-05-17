-- Drop unnecessary columns from user_profiles
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "status_pernikahan";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "berat_badan";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "tinggi_badan";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "agama";
ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "foto_profil_url";
DROP TYPE IF EXISTS "agama"; 