-- Create the status enum type
CREATE TYPE "status" AS ENUM ('active', 'inactive', 'archived');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" TIMESTAMP,
  "password" TEXT,
  "image" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "session_token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP NOT NULL
);

-- Create verification tokens table
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "image_url" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" status NOT NULL,
  "price" NUMERIC(10, 2) NOT NULL,
  "stock" INTEGER NOT NULL,
  "available_at" TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "accounts" ("user_id");
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "sessions" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "provider_account_id_idx" ON "accounts" ("provider", "provider_account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_token_idx" ON "verification_tokens" ("identifier", "token"); 