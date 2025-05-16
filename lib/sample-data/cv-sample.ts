// This file contains sample CV data without dependencies on server-only modules
// Define types without importing from db.ts
export type SkillLevel = "Pemula" | "Menengah" | "Mahir";
export type ExperienceLevel = "Baru lulus" | "Pengalaman magang" | "Kurang dari 1 tahun" | "1-2 tahun" | "3-5 tahun" | "5-10 tahun" | "10 tahun lebih";
export type WorkLocationType = "WFH" | "WFO" | "Hybrid";
export type GenderType = "Laki-laki" | "Perempuan" | "Lainnya";

// Define the CV interface
export interface SampleCV {
  userId: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  alamat: {
    jalan?: string;
    rt?: string;
    rw?: string;
    kelurahan?: string;
    kecamatan?: string;
    kota?: string;
    provinsi?: string;
    kodePos?: string;
  };
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    other?: string;
  };
  fotoProfilUrl?: string;
  personalInfo: {
    jenisKelamin?: GenderType;
    tanggalLahir: string;
    tempatLahir?: string;
    statusPernikahan?: string;
    agama?: string;
    tinggiBadan?: number;
    beratBadan?: number;
  };
  workSummary?: {
    levelPengalaman?: string;
    status_pekerjaan?: string;
    transportation_for_work?: string;
    alasanKeluarLainnya?: string;
  };
  informasiTambahan?: {
    tentangSaya?: string;
    website?: string;
  };
  ekspektasiKerja?: {
    jobTypes?: string;
    preferredLocation?: string;
    salaryExpectation?: string;
  };
  pendidikan: Array<{
    namaInstitusi: string;
    lokasi?: string;
    jenjangPendidikan: string;
    bidangStudi: string;
    tanggalLulus: string;
    nilaiAkhir?: string;
    deskripsiTambahan?: string;
  }>;
  pengalamanKerja: Array<{
    id?: string;
    levelPengalaman: ExperienceLevel;
    namaPerusahaan: string;
    posisi: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    deskripsiPekerjaan?: string;
    lokasiKerja?: WorkLocationType;
    lokasi?: string;
    gajiTerakhir?: string;
    alasanKeluar?: string;
  }>;
  keahlian: Array<{
    nama: string;
    tingkat?: SkillLevel;
  }>;
  bahasa: Array<{
    nama: string;
    tingkat?: SkillLevel;
  }>;
  sertifikasi?: Array<{
    nama: string;
    penerbit?: string;
    tanggalTerbit?: string;
  }>;
  additionalFields?: {
    photo_upload_option?: boolean;
    it_skills?: string[];
  };
}

// Export the sample CV data
export function getSampleCV(): SampleCV {
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