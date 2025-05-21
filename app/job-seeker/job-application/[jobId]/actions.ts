'use server';

import { getJobSeekerSession } from "@/lib/auth-utils";
import { 
  getUserProfileByUserId, 
  getJobById, 
  getJobByHumanId, 
  getUserPendidikanByProfileId, 
  getJobWorkLocationsByJobId, 
  getEmployerById,
  db,
  jobApplications,
  userAddresses,
  userPengalamanKerja
} from "@/lib/db";
import { eq, and } from "drizzle-orm";

// Add back the required types
export interface JobDetails {
  id: string;
  jobId: string;
  jobTitle: string;
  contractType: string;
  minWorkExperience: number | string; // Can be number (old data) or string (enum value)
  lokasiKerja?: string | null;
  salaryRange: { min?: number; max?: number; isNegotiable?: boolean; };
  lastEducation?: string;
  requiredCompetencies?: string;
  numberOfPositions?: number;
  workLocations: { city: string; province: string; isRemote: boolean; }[];
  companyInfo: {
    name: string;
    industry: string;
    address: string;
    website?: string;
    logoUrl?: string;
    socialMedia?: any;
    description?: string;
  };
}

export interface JobSeekerProfileData {
  id: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  cvFileUrl?: string | null;
  cvUploadDate?: string | Date | null;
  pendidikanTerakhir?: string;
  tanggalLahir?: string | null;
  jenisKelamin?: string | null; // e.g., "Laki-laki", "Perempuan"
  kotaDomisili?: string | null; // derived from alamat.kota
  pengalamanKerjaTerakhir?: { 
    posisi?: string | null; 
    namaPerusahaan?: string | null; 
  } | null;
  gajiTerakhir?: number | null;
  levelPengalaman?: string | null;
  ekspektasiGaji?: { 
    min?: number; 
    max?: number; 
  } | null;
  preferensiLokasiKerja?: string[] | null;
  preferensiJenisPekerjaan?: string[] | null;
  pendidikan?: Array<{
    jenjangPendidikan?: string | null;
    namaInstitusi?: string | null;
    bidangStudi?: string | null;
    tanggalLulus?: string | Date | null;
  }>;
  pengalamanKerja?: Array<{
    posisi?: string | null;
    namaPerusahaan?: string | null;
    tanggalMulai?: string | Date | null;
    tanggalSelesai?: string | Date | null;
    deskripsiPekerjaan?: string | null;
  }>;
}

// Application status interface
export interface ApplicationStatus {
  hasApplied: boolean;
  referenceCode?: string;
  applicationDate?: Date;
  status?: string;
}

// Minimal data fetcher for job application
export async function getJobApplicationPageData(jobId: string) {
  // Get session and verify it has a user
  const session = await getJobSeekerSession();
  if (!session.user?.id) throw new Error("Authentication required");
  
  // Get user profile
  const profileData = await getUserProfileByUserId(session.user.id);
  if (!profileData) throw new Error("Profile not found");
  
  // Get job data
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
  const job = isUuid ? await getJobById(jobId) : await getJobByHumanId(jobId);
  if (!job) throw new Error("Job not found");
  
  // Get related data
  const [workLocations, employer, pendidikan, addresses, pengalamanKerja] = await Promise.all([
    getJobWorkLocationsByJobId(job.id),
    getEmployerById(job.employerId),
    getUserPendidikanByProfileId(profileData.id),
    db.select().from(userAddresses).where(eq(userAddresses.userProfileId, profileData.id)),
    db.select().from(userPengalamanKerja).where(eq(userPengalamanKerja.userProfileId, profileData.id))
  ]);
  
  if (!employer) throw new Error("Employer not found");
  
  // Get highest education if available
  let highestEducation;
  if (pendidikan?.length) {
    const sorted = [...pendidikan].sort((a, b) => 
      new Date(b.tanggalLulus || 0).getTime() - new Date(a.tanggalLulus || 0).getTime()
    );
    highestEducation = sorted[0]?.jenjangPendidikan;
  }
  
  // Check if the user has already applied for this job
  const existingApplications = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.applicantProfileId, profileData.id),
        eq(jobApplications.jobId, job.id)
      )
    );
  
  const hasApplied = existingApplications.length > 0;
  
  // Generate reference code if the user has applied
  let referenceCode = '';
  if (hasApplied && existingApplications[0]) {
    const applicationId = existingApplications[0].id;
    
    // Format: APP-{FIRST 5 CHARS OF UUID}-{YYMMDD}
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const shortId = applicationId.substring(0, 5).toUpperCase();
    referenceCode = `APP-${shortId}-${year}${month}${day}`;
  }
  
  // Get the latest work experience (if any)
  let latestExperience = null;
  let gajiTerakhir = null;
  if (pengalamanKerja?.length) {
    const sorted = [...pengalamanKerja].sort((a, b) => 
      new Date(b.tanggalSelesai || b.tanggalMulai || 0).getTime() - 
      new Date(a.tanggalSelesai || a.tanggalMulai || 0).getTime()
    );
    latestExperience = {
      posisi: sorted[0].posisi,
      namaPerusahaan: sorted[0].namaPerusahaan
    };
    
    // Handle salary information if available
    // Note: gajiTerakhir might not exist in all implementations, so we check it dynamically
    if (sorted[0] && 'gajiTerakhir' in sorted[0] && sorted[0].gajiTerakhir) {
      try {
        // Convert to number if it's a string
        gajiTerakhir = typeof sorted[0].gajiTerakhir === 'string' 
          ? parseFloat(String(sorted[0].gajiTerakhir).replace(/[^\d]/g, '')) 
          : Number(sorted[0].gajiTerakhir);
      } catch (e) {
        console.error("Error parsing gajiTerakhir:", e);
      }
    }
  }
  
  // Extract ekspektasi kerja data
  const ekspektasiKerjaData = profileData.ekspektasiKerja 
    ? (typeof profileData.ekspektasiKerja === 'string' 
      ? JSON.parse(profileData.ekspektasiKerja) 
      : profileData.ekspektasiKerja) 
    : null;
    
  // Format pendidikan for the profile
  const formattedPendidikan = pendidikan?.map(p => ({
    jenjangPendidikan: p.jenjangPendidikan,
    namaInstitusi: p.namaInstitusi,
    bidangStudi: p.bidangStudi,
    tanggalLulus: p.tanggalLulus
  }));
  
  // Format pengalaman kerja for the profile
  const formattedPengalamanKerja = pengalamanKerja?.map(p => ({
    posisi: p.posisi,
    namaPerusahaan: p.namaPerusahaan,
    tanggalMulai: p.tanggalMulai,
    tanggalSelesai: p.tanggalSelesai,
    deskripsiPekerjaan: p.deskripsiPekerjaan
  }));
  
  // Return formatted data
  return {
    jobDetails: {
      id: job.id,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      contractType: 'FULL_TIME',
      minWorkExperience: job.minWorkExperience,
      lokasiKerja: job.lokasiKerja,
      salaryRange: { isNegotiable: false },
      lastEducation: job.lastEducation || undefined,
      requiredCompetencies: job.requiredCompetencies || undefined,
      numberOfPositions: job.numberOfPositions || undefined,
      workLocations: workLocations.map(l => ({
        city: l.city,
        province: l.province,
        isRemote: l.isRemote,
      })),
      companyInfo: {
        name: employer.namaPerusahaan,
        industry: employer.industri,
        address: employer.alamatKantor,
        website: employer.website || undefined,
        logoUrl: employer.logoUrl || undefined,
        socialMedia: employer.socialMedia || undefined,
        description: '',
      }
    },
    profileData: {
      ...profileData,
      pendidikanTerakhir: highestEducation,
      tanggalLahir: profileData.tanggalLahir,
      jenisKelamin: profileData.jenisKelamin,
      kotaDomisili: addresses?.[0]?.kota || null,
      pengalamanKerjaTerakhir: latestExperience,
      gajiTerakhir,
      levelPengalaman: profileData.levelPengalaman,
      ekspektasiGaji: ekspektasiKerjaData?.idealSalary ? {
        min: typeof ekspektasiKerjaData.idealSalary === 'number' 
          ? ekspektasiKerjaData.idealSalary
          : parseFloat(ekspektasiKerjaData.idealSalary)
      } : null,
      preferensiLokasiKerja: ekspektasiKerjaData?.preferensiLokasiKerja 
        ? (Array.isArray(ekspektasiKerjaData.preferensiLokasiKerja) 
          ? ekspektasiKerjaData.preferensiLokasiKerja 
          : [ekspektasiKerjaData.preferensiLokasiKerja]) 
        : null,
      preferensiJenisPekerjaan: ekspektasiKerjaData?.jobTypes 
        ? (Array.isArray(ekspektasiKerjaData.jobTypes) 
          ? ekspektasiKerjaData.jobTypes 
          : ekspektasiKerjaData.jobTypes.split(',').map((type: string) => type.trim())) 
        : null,
      pendidikan: formattedPendidikan,
      pengalamanKerja: formattedPengalamanKerja
    },
    applicationStatus: {
      hasApplied,
      referenceCode: hasApplied ? referenceCode : undefined,
      applicationDate: hasApplied && 'createdAt' in existingApplications[0] ? 
        existingApplications[0].createdAt as Date : undefined, 
      status: hasApplied ? existingApplications[0].status : undefined
    }
  };
} 
