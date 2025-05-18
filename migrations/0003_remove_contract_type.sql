-- Migration to remove contract_type column from jobs table
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "contract_type"; 