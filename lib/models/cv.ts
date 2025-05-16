import { z } from 'zod';
import { tingkatKeahlianEnum, levelPengalamanEnum, lokasiKerjaEnum, jenisKelaminEnum } from '../db';

// Define types that match the database schema but are specifically for the CV builder
export type SkillLevel = typeof tingkatKeahlianEnum.enumValues[number];
export type ExperienceLevel = typeof levelPengalamanEnum.enumValues[number];
export type WorkLocationType = typeof lokasiKerjaEnum.enumValues[number];
export type GenderType = typeof jenisKelaminEnum.enumValues[number];

// Address schema
export const AddressSchema = z.object({
  jalan: z.string().optional(),
  rt: z.string().optional(),
  rw: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kota: z.string().optional(),
  provinsi: z.string().optional(),
  kodePos: z.string().optional(),
});

// Social media schema
export const SocialMediaSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  linkedin: z.string().optional(),
  other: z.string().optional(),
});

// Additional information schema
export const AdditionalInfoSchema = z.object({
  tentangSaya: z.string().optional(),
  website: z.string().optional(),
});

// Work expectations schema
export const ExpectationsSchema = z.object({
  jobTypes: z.string().optional(),
  preferredLocation: z.string().optional(),
  salaryExpectation: z.string().optional(),
});

// Education schema
export const EducationSchema = z.object({
  id: z.string().optional(),
  namaInstitusi: z.string(),
  lokasi: z.string().optional(),
  jenjangPendidikan: z.string(),
  bidangStudi: z.string(),
  tanggalLulus: z.string(),
  nilaiAkhir: z.string().optional(),
  deskripsiTambahan: z.string().optional(),
});

// Work experience schema
export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  levelPengalaman: z.enum(levelPengalamanEnum.enumValues),
  namaPerusahaan: z.string(),
  posisi: z.string(),
  tanggalMulai: z.string(),
  tanggalSelesai: z.string(),
  deskripsiPekerjaan: z.string().optional(),
  lokasiKerja: z.enum(lokasiKerjaEnum.enumValues).optional(),
  lokasi: z.string().optional(),
  gajiTerakhir: z.string().optional(),
  alasanKeluar: z.string().optional(),
});

// Skill schema
export const SkillSchema = z.object({
  id: z.string().optional(),
  nama: z.string(),
  tingkat: z.enum(tingkatKeahlianEnum.enumValues).optional(),
});

// Language schema
export const LanguageSchema = z.object({
  id: z.string().optional(),
  nama: z.string(),
  tingkat: z.enum(tingkatKeahlianEnum.enumValues).optional(),
});

// Certification schema
export const CertificationSchema = z.object({
  id: z.string().optional(),
  nama: z.string(),
  penerbit: z.string().optional(),
  tanggalTerbit: z.string().optional(),
  fileUrl: z.string().optional(),
});

// Work summary schema
export const WorkSummarySchema = z.object({
  levelPengalaman: z.string().optional(),
  status_pekerjaan: z.string().optional(),
  transportation_for_work: z.string().optional(),
  alasanKeluarLainnya: z.string().optional(),
});

// Personal information schema
export const PersonalInfoSchema = z.object({
  tanggalLahir: z.string(),
  tempatLahir: z.string().optional(),
  jenisKelamin: z.enum(jenisKelaminEnum.enumValues).optional(),
  statusPernikahan: z.string().optional(),
  agama: z.string().optional(),
  tinggiBadan: z.number().int().positive().optional(),
  beratBadan: z.number().int().positive().optional(),
});

// Additional CV fields not in the database schema
export const AdditionalCVFieldsSchema = z.object({
  photo_upload_option: z.boolean().optional().default(true),
  it_skills: z.array(z.string()).optional(),
});

// Complete CV schema that combines all parts
export const CVSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  namaLengkap: z.string(),
  email: z.string().email(),
  nomorTelepon: z.string(),
  fotoProfilUrl: z.string().optional(),
  alamat: AddressSchema,
  socialMedia: SocialMediaSchema.optional(),
  informasiTambahan: AdditionalInfoSchema.optional(),
  ekspektasiKerja: ExpectationsSchema.optional(),
  pendidikan: z.array(EducationSchema),
  pengalamanKerja: z.array(WorkExperienceSchema),
  keahlian: z.array(SkillSchema),
  bahasa: z.array(LanguageSchema),
  sertifikasi: z.array(CertificationSchema).optional(),
  workSummary: WorkSummarySchema.optional(),
  personalInfo: PersonalInfoSchema,
  additionalFields: AdditionalCVFieldsSchema.optional(),
});

export type CV = z.infer<typeof CVSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type SocialMedia = z.infer<typeof SocialMediaSchema>;
export type AdditionalInfo = z.infer<typeof AdditionalInfoSchema>;
export type Expectations = z.infer<typeof ExpectationsSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type WorkSummary = z.infer<typeof WorkSummarySchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// CV Service functions
export async function transformUserProfileToCV(
  userProfile: any,
  userPengalamanKerja: any[],
  userPendidikan: any[],
  userKeahlian: any[],
  userBahasa: any[],
  userSertifikasi: any[],
  userSocialMedia?: any,
  userAddress?: any
): Promise<CV> {
  // Basic profile data
  const cv: CV = {
    userId: userProfile.userId,
    namaLengkap: userProfile.namaLengkap,
    email: userProfile.email,
    nomorTelepon: userProfile.nomorTelepon,
    fotoProfilUrl: userProfile.fotoProfilUrl,
    
    // Personal info
    personalInfo: {
      tanggalLahir: userProfile.tanggalLahir,
      jenisKelamin: userProfile.jenisKelamin as GenderType,
      agama: userProfile.agama,
      tinggiBadan: userProfile.tinggiBadan,
      beratBadan: userProfile.beratBadan,
      statusPernikahan: '',
      tempatLahir: '',
    },
    
    // Empty defaults for optional sections
    alamat: userAddress || {
      jalan: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      kodePos: '',
    },
    
    // Education data
    pendidikan: userPendidikan.map(edu => ({
      id: edu.id,
      namaInstitusi: edu.namaInstitusi,
      jenjangPendidikan: edu.jenjangPendidikan,
      bidangStudi: edu.bidangStudi,
      tanggalLulus: edu.tanggalLulus,
      nilaiAkhir: edu.nilaiAkhir || '',
      deskripsiTambahan: edu.deskripsiTambahan || '',
      lokasi: '', // Not in database schema, but needed for the CV
    })),
    
    // Work experience data
    pengalamanKerja: userPengalamanKerja.map(exp => ({
      id: exp.id,
      levelPengalaman: exp.levelPengalaman,
      namaPerusahaan: exp.namaPerusahaan,
      posisi: exp.posisi,
      tanggalMulai: exp.tanggalMulai,
      tanggalSelesai: exp.tanggalSelesai,
      deskripsiPekerjaan: exp.deskripsiPekerjaan || '',
      lokasi: exp.lokasi || '',
      lokasiKerja: exp.lokasiKerja,
      alasanKeluar: exp.alasanKeluar || '',
      gajiTerakhir: '', // Not in database schema, but needed for the CV
    })),
    
    // Skills data
    keahlian: userKeahlian.map(skill => ({
      id: skill.id,
      nama: skill.nama,
      tingkat: skill.tingkat as SkillLevel,
    })),
    
    // Language data
    bahasa: userBahasa.map(lang => ({
      id: lang.id,
      nama: lang.nama,
      tingkat: lang.tingkat as SkillLevel,
    })),
    
    // Additional fields
    additionalFields: {
      photo_upload_option: true,
      it_skills: [],
    },
  };

  // Social media data if available
  if (userSocialMedia) {
    cv.socialMedia = {
      instagram: userSocialMedia.instagram || '',
      twitter: userSocialMedia.twitter || '',
      facebook: userSocialMedia.facebook || '',
      linkedin: userSocialMedia.linkedin || '',
      tiktok: userSocialMedia.tiktok || '',
      other: userSocialMedia.other || '',
    };
  }

  // Certification data if available
  if (userSertifikasi && userSertifikasi.length > 0) {
    cv.sertifikasi = userSertifikasi.map(cert => ({
      id: cert.id,
      nama: cert.nama,
      penerbit: cert.penerbit || '',
      tanggalTerbit: cert.tanggalTerbit || '',
      fileUrl: cert.fileUrl || '',
    }));
  }

  // Default work summary
  cv.workSummary = {
    levelPengalaman: cv.pengalamanKerja.length > 0 ? `${cv.pengalamanKerja.length} Years` : '0 Years',
    status_pekerjaan: 'Searching',
    transportation_for_work: '',
    alasanKeluarLainnya: '',
  };

  // Default additional info
  cv.informasiTambahan = {
    tentangSaya: '',
    website: '',
  };

  // Default work expectations
  cv.ekspektasiKerja = {
    jobTypes: cv.pengalamanKerja.length > 0 ? cv.pengalamanKerja[0].posisi : 'Job Seeker',
    preferredLocation: '',
    salaryExpectation: '',
  };

  return cv;
}

// Sample CV data function for testing
export function getSampleCV(): CV {
  return {
    userId: "sample-user-id-123",
    namaLengkap: 'Eliana Garcia',
    email: 'elianagarcia997@example.com',
    nomorTelepon: '+62 812 3456 7890',
    alamat: {
      jalan: 'Jl. Sudirman No. 123',
      kelurahan: 'Setiabudi',
      kecamatan: 'Setiabudi',
      kota: 'Jakarta Selatan',
      provinsi: 'DKI Jakarta',
      kodePos: '12910'
    },
    socialMedia: {
      instagram: 'elianagarcia',
      twitter: 'elianagarcia',
      linkedin: 'elianagarcia',
      facebook: 'elianagarcia'
    },
    fotoProfilUrl: 'https://images.unsplash.com/photo-1510706019500-d23a509eecd4?q=80&w=2667&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    personalInfo: {
      jenisKelamin: 'Perempuan',
      tanggalLahir: '1997-05-15',
      tempatLahir: 'Jakarta',
      statusPernikahan: 'Belum Menikah',
      agama: 'Islam',
      tinggiBadan: 165,
      beratBadan: 55,
    },
    workSummary: {
      levelPengalaman: '8 Years',
      status_pekerjaan: 'Employed',
      transportation_for_work: 'Private Car',
      alasanKeluarLainnya: 'Seeking better work-life balance',
    },
    informasiTambahan: {
      tentangSaya: 'I am a seasoned graphic designer with over 14 years of experience in creating visually appealing and user-centric designs. My expertise spans across UI design, design systems, and custom illustrations, helping clients bring their digital visions to life.\n\nCurrently, I work remotely for Notion, where I design template UIs, convert them into HTML and CSS, and provide comprehensive support to our users. I am passionate about crafting elegant and functional designs that enhance user experiences.',
      website: 'eliana-garcia.design'
    },
    ekspektasiKerja: {
      jobTypes: 'Graphic Designer, Web Designer/Developer'
    },
    pendidikan: [
      {
        namaInstitusi: 'Universitas Stanford',
        lokasi: 'California, USA',
        jenjangPendidikan: 'Magister',
        bidangStudi: 'Ilmu Komputer',
        tanggalLulus: '2010-06-30',
        deskripsiTambahan: 'Spesialisasi dalam Interaksi Manusia-Komputer dan Desain Antarmuka Pengguna. Lulus dengan predikat kehormatan.',
        nilaiAkhir: '3.95/4.0'
      },
      {
        namaInstitusi: 'Rhode Island School of Design',
        lokasi: 'Rhode Island, USA',
        jenjangPendidikan: 'Sarjana',
        bidangStudi: 'Desain Grafis',
        tanggalLulus: '2008-05-15',
        deskripsiTambahan: 'Fokus pada desain digital dan media interaktif. Masuk Daftar Dekan setiap semester.',
        nilaiAkhir: '3.8/4.0'
      }
    ],
    pengalamanKerja: [
      {
        id: '1',
        levelPengalaman: '5-10 tahun',
        namaPerusahaan: 'Notion',
        posisi: 'Web Designer & Web Developer',
        tanggalMulai: '2023-01-01',
        tanggalSelesai: 'Sekarang',
        deskripsiPekerjaan: 'Designed template UIs and design systems in Figma.\nConverted UIs into responsive HTML and CSS with a mobile-first approach.\nCreated custom illustrations and item description banners.\nProvided detailed documentation and customer support on GitHub.\nEngaged with users to address setup inquiries, bug issues, and feedback.',
        lokasi: 'Remote',
        gajiTerakhir: 'Rp 15.000.000/month',
        alasanKeluar: 'Still employed',
        lokasiKerja: 'WFH'
      },
      {
        id: '2',
        levelPengalaman: '3-5 tahun',
        namaPerusahaan: 'Mailchimp',
        posisi: 'Senior Software Engineer',
        tanggalMulai: '2021-02-15',
        tanggalSelesai: '2022-12-31',
        deskripsiPekerjaan: 'Led the development of Studio by Mailchimp, an innovative broadcast studio platform.\nImplemented responsive design patterns across the product.\nCollaborated with cross-functional teams to deliver high-quality features.',
        lokasi: 'Atlanta, USA',
        gajiTerakhir: 'Rp 12.000.000/month',
        alasanKeluar: 'Career growth opportunity',
        lokasiKerja: 'WFO'
      },
      {
        id: '3',
        levelPengalaman: '1-2 tahun',
        namaPerusahaan: 'Slack',
        posisi: 'Junior Software Engineer',
        tanggalMulai: '2011-05-10',
        tanggalSelesai: '2021-02-01',
        deskripsiPekerjaan: 'Developed and maintained key features for the Slack platform.\nCollaborated with design team to implement UI/UX improvements.\nParticipated in code reviews and mentorship programs.',
        lokasi: 'San Francisco, USA',
        gajiTerakhir: 'Rp 8.000.000/month',
        alasanKeluar: 'Seeking new challenges',
        lokasiKerja: 'Hybrid'
      }
    ],
    keahlian: [
      {
        nama: 'UI/UX Design',
        tingkat: 'Mahir'
      },
      {
        nama: 'Figma',
        tingkat: 'Mahir'
      },
      {
        nama: 'HTML/CSS',
        tingkat: 'Menengah'
      },
      {
        nama: 'JavaScript',
        tingkat: 'Menengah'
      },
      {
        nama: 'React',
        tingkat: 'Menengah'
      }
    ],
    bahasa: [
      {
        nama: 'English',
        tingkat: 'Mahir'
      },
      {
        nama: 'Indonesian',
        tingkat: 'Mahir'
      },
      {
        nama: 'Spanish',
        tingkat: 'Menengah'
      }
    ],
    sertifikasi: [
      {
        nama: 'Google UX Design Professional Certificate',
        penerbit: 'Google',
        tanggalTerbit: '2022-03'
      },
      {
        nama: 'Adobe Certified Expert - Photoshop',
        penerbit: 'Adobe',
        tanggalTerbit: '2020-09'
      },
      {
        nama: 'Frontend Web Developer Nanodegree',
        penerbit: 'Udacity',
        tanggalTerbit: '2019-12'
      }
    ],
    additionalFields: {
      photo_upload_option: true,
      it_skills: ['Git', 'Docker', 'AWS', 'Responsive Design', 'SEO', 'Accessibility']
    }
  };
} 