-- Add extended fields to job_applications table
ALTER TABLE job_applications
ADD COLUMN tanggal_lahir DATE,
ADD COLUMN jenis_kelamin VARCHAR(50),
ADD COLUMN kota_domisili VARCHAR(255),
ADD COLUMN pendidikan_full JSONB,
ADD COLUMN pengalaman_kerja_full JSONB,
ADD COLUMN pengalaman_kerja_terakhir JSONB,
ADD COLUMN gaji_terakhir INTEGER,
ADD COLUMN level_pengalaman VARCHAR(100),
ADD COLUMN ekspektasi_gaji JSONB,
ADD COLUMN preferensi_lokasi_kerja JSONB,
ADD COLUMN preferensi_jenis_pekerjaan JSONB; 