-- Rename the old enum type to a temporary name
ALTER TYPE min_work_experience_enum RENAME TO min_work_experience_enum_old;

-- Create the new enum type with the correct values
CREATE TYPE min_work_experience_enum AS ENUM (
  'LULUSAN_BARU',
  'SATU_DUA_TAHUN',
  'TIGA_LIMA_TAHUN',
  'LIMA_SEPULUH_TAHUN',
  'LEBIH_SEPULUH_TAHUN'
);

-- Update the jobs table to use the new enum type with data conversion
ALTER TABLE jobs 
  ALTER COLUMN min_work_experience TYPE min_work_experience_enum 
  USING (
    CASE
      WHEN min_work_experience::text = 'LULUSAN_BARU' THEN 'LULUSAN_BARU'::min_work_experience_enum
      WHEN min_work_experience::text = 'SATU_DUA_TAHUN' THEN 'SATU_DUA_TAHUN'::min_work_experience_enum
      WHEN min_work_experience::text = 'TIGA_EMPAT_TAHUN' THEN 'TIGA_LIMA_TAHUN'::min_work_experience_enum
      WHEN min_work_experience::text = 'TIGA_LIMA_TAHUN' THEN 'TIGA_LIMA_TAHUN'::min_work_experience_enum
      WHEN min_work_experience::text = 'LEBIH_LIMA_TAHUN' THEN 'LIMA_SEPULUH_TAHUN'::min_work_experience_enum
      ELSE 'LULUSAN_BARU'::min_work_experience_enum
    END
  );

-- Drop the old enum type
DROP TYPE min_work_experience_enum_old; 