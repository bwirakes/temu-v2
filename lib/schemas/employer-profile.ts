import { z } from "zod";

// Define types for the employer profile data
export type EmployerProfileData = {
  id: string;
  userId: string;
  namaPerusahaan: string;
  merekUsaha?: string | null;
  industri: string;
  alamatKantor: string;
  email: string;
  website?: string | null;
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  } | null;
  logoUrl?: string | null;
  pic: {
    nama: string;
    nomorTelepon: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

// Define ActionResult types for server actions
export type ActionResultSuccess = {
  success: true;
  message: string;
  data?: any;
  employerId?: string;
  logoUrl?: string;
};

export type ActionResultError = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type ActionResult = ActionResultSuccess | ActionResultError;

// Zod schemas for validation
export const companyInfoSettingsSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  merekUsaha: z.string().optional(),
  industri: z.string().min(1, "Industri wajib diisi"),
  alamatKantor: z.string().min(1, "Alamat kantor wajib diisi"),
});

export const onlinePresenceSettingsSchema = z.object({
  website: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
});

export const picSettingsSchema = z.object({
  nama: z.string().min(1, "Nama PIC wajib diisi"),
  nomorTelepon: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor telepon Indonesia tidak valid"
    ),
});

// Zod schema for employer profile validation
export const employerProfileSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan harus diisi"),
  merekUsaha: z.string().optional().nullable(),
  industri: z.string().min(1, "Industri harus diisi"),
  alamatKantor: z.string().min(1, "Alamat kantor harus diisi"),
  email: z.string().email("Format email tidak valid"),
  website: z.string().url("Format URL tidak valid").optional().nullable(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  pic: z.object({
    nama: z.string().min(1, "Nama PIC harus diisi"),
    nomorTelepon: z.string().min(1, "Nomor telepon PIC harus diisi"),
  }),
}); 