import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  getAllEmployerIds, 
  getConfirmedJobIdsByEmployerId, 
  getEmployerById, 
  getJobById, 
  getJobWorkLocationsByJobId 
} from '@/lib/db';

// Add export config for ISR
export const revalidate = 3600; // Revalidate every hour

// Types
interface JobLocation {
  id: string;
  jobId: string;
  city: string;
  province: string;
  isRemote: boolean;
  address?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface Job {
  id: string;
  jobTitle: string;
  contractType: string;
  postedDate: Date | string;
  applicationDeadline?: Date | string | null;
  numberOfPositions?: number | null;
  workingHours?: string | null;
  isConfirmed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  description?: string | null;
  employerId: string;
  salaryRange?: {
    min?: number;
    max?: number;
    isNegotiable: boolean;
  } | null;
  minWorkExperience: number;
  requirements?: string[] | null;
  responsibilities: string[] | null;
  expectations?: {
    ageRange?: {
      min: number;
      max: number;
    };
    expectedCharacter?: string;
    foreignLanguage?: string;
  } | null;
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    requiredDocuments?: string;
    specialSkills?: string;
    technologicalSkills?: string;
    suitableForDisability?: boolean;
  } | null;
}

interface Employer {
  id: string;
  namaPerusahaan: string;
  merekUsaha?: string | null;
  industri: string;
  alamatKantor: string;
  website?: string | null;
  logoUrl?: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  socialMedia?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  } | null;
  pic: {
    nama: string;
    nomorTelepon: string;
  };
}

// Metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { employerId: string; jobId: string } 
}): Promise<Metadata> {
  const job = await getJobById(params.jobId);
  const employer = job ? await getEmployerById(job.employerId) : null;
  
  if (!job || !employer) {
    return {
      title: 'Lowongan Tidak Ditemukan',
      description: 'Lowongan yang diminta tidak dapat ditemukan.',
    };
  }
  
  return {
    title: `${job.jobTitle} di ${employer.namaPerusahaan}`,
    description: job.description || `Lamar posisi ${job.jobTitle} di ${employer.namaPerusahaan}`,
  };
}

// Generate static paths for all jobs
export async function generateStaticParams() {
  // Get all employer IDs
  const employers = await getAllEmployerIds();
  const paths = [];
  
  // For each employer, get all their confirmed job IDs
  for (const employer of employers) {
    const jobIds = await getConfirmedJobIdsByEmployerId(employer.id);
    
    // Add a path for each job
    for (const job of jobIds) {
      paths.push({
        employerId: employer.id,
        jobId: job.id,
      });
    }
  }
  
  return paths;
}

// Helper function to format salary
const formatSalary = (salaryRange: Job['salaryRange']) => {
  if (!salaryRange) return 'Tidak ditentukan';
  
  if (salaryRange.isNegotiable) {
    return 'Dapat dinegosiasikan';
  }
  
  if (salaryRange.min && salaryRange.max) {
    return `Rp ${salaryRange.min.toLocaleString()} - Rp ${salaryRange.max.toLocaleString()}`;
  } else if (salaryRange.min) {
    return `Dari Rp ${salaryRange.min.toLocaleString()}`;
  } else if (salaryRange.max) {
    return `Hingga Rp ${salaryRange.max.toLocaleString()}`;
  }
  
  return 'Tidak ditentukan';
};

// Social media links component
function SocialMediaLinks({ socialMedia }: { socialMedia?: Employer['socialMedia'] }) {
  if (!socialMedia) return null;
  
  const socialIcons = {
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    )
  };
  
  return (
    <div className="flex space-x-4 mt-4">
      {socialMedia.instagram && (
        <a 
          href={`https://instagram.com/${socialMedia.instagram}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-pink-600"
          aria-label="Instagram"
        >
          {socialIcons.instagram}
        </a>
      )}
      
      {socialMedia.linkedin && (
        <a 
          href={socialMedia.linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-blue-700"
          aria-label="LinkedIn"
        >
          {socialIcons.linkedin}
        </a>
      )}
      
      {socialMedia.facebook && (
        <a 
          href={socialMedia.facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-blue-600"
          aria-label="Facebook"
        >
          {socialIcons.facebook}
        </a>
      )}
      
      {socialMedia.twitter && (
        <a 
          href={socialMedia.twitter} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-blue-400"
          aria-label="Twitter"
        >
          {socialIcons.twitter}
        </a>
      )}
      
      {socialMedia.tiktok && (
        <a 
          href={`https://tiktok.com/@${socialMedia.tiktok}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-black"
          aria-label="TikTok"
        >
          {socialIcons.tiktok}
        </a>
      )}
    </div>
  );
}

// Main page component
export default async function JobDetailPage({
  params,
}: {
  params: { employerId: string; jobId: string };
}) {
  const { employerId, jobId } = params;
  
  // Get job details
  const job = await getJobById(jobId);
  
  // If job doesn't exist or isn't confirmed, or doesn't belong to this employer, return 404
  if (!job || !job.isConfirmed || job.employerId !== employerId) {
    notFound();
  }
  
  // Get employer details
  const employer = await getEmployerById(employerId);
  
  if (!employer) {
    notFound();
  }
  
  // Get job locations
  const locations = await getJobWorkLocationsByJobId(jobId);
  
  return (
    <div className="bg-notion-background min-h-screen">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      <div className="notion-container py-12 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <div className="mb-6 animation-delay-100 animate-fade-in">
          <Link 
            href={`/careers/${employerId}`}
            className="inline-flex items-center text-sm font-medium text-notion-text hover:text-notion-text-light transition duration-150 ease-in-out"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke semua lowongan
          </Link>
        </div>
        
        {/* Job header */}
        <div className="notion-card mb-8 overflow-hidden animation-delay-200 animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h1 className="text-2xl font-medium text-notion-text mb-2">{job.jobTitle}</h1>
                <p className="text-xl text-notion-text-light mb-4">{employer.namaPerusahaan}</p>
              
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-notion-highlight-blue text-notion-text text-xs font-medium rounded-notion">
                    {job.contractType}
                  </span>
                  {job.numberOfPositions && (
                    <span className="px-3 py-1 bg-notion-highlight-green text-notion-text text-xs font-medium rounded-notion">
                      {job.numberOfPositions} posisi
                    </span>
                  )}
                  {job.minWorkExperience > 0 && (
                    <span className="px-3 py-1 bg-notion-highlight-orange text-notion-text text-xs font-medium rounded-notion">
                      {job.minWorkExperience} tahun pengalaman
                    </span>
                  )}
                </div>
              </div>
              
              {employer.logoUrl && (
                <div className="w-24 h-24 relative flex-shrink-0 mt-4 md:mt-0 bg-white p-2 rounded-notion border border-notion-border">
                  <Image
                    src={employer.logoUrl}
                    alt={employer.namaPerusahaan}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="notion-property group">
                <p className="text-sm text-notion-text-light group-hover:text-notion-text transition-colors duration-150">Tanggal Posting</p>
                <p className="font-medium text-notion-text">{format(new Date(job.postedDate), 'dd MMMM yyyy', { locale: id })}</p>
              </div>
              
              {job.applicationDeadline && (
                <div className="notion-property group">
                  <p className="text-sm text-notion-text-light group-hover:text-notion-text transition-colors duration-150">Batas Waktu Pendaftaran</p>
                  <p className="font-medium text-notion-text-red">{format(new Date(job.applicationDeadline), 'dd MMMM yyyy', { locale: id })}</p>
                </div>
              )}
              
              {job.workingHours && (
                <div className="notion-property group">
                  <p className="text-sm text-notion-text-light group-hover:text-notion-text transition-colors duration-150">Jam Kerja</p>
                  <p className="font-medium text-notion-text">{job.workingHours}</p>
                </div>
              )}
              
              {job.salaryRange && (
                <div className="notion-property group">
                  <p className="text-sm text-notion-text-light group-hover:text-notion-text transition-colors duration-150">Kisaran Gaji</p>
                  <p className="font-medium text-notion-text">{formatSalary(job.salaryRange)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Apply button */}
          <div className="border-t border-notion-border p-4">
            <Link
              href={`/job-application/${jobId}`}
              className="notion-button w-full flex justify-center items-center gap-2 hover:bg-notion-blue-dark transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path>
              </svg>
              Lamar Posisi Ini
            </Link>
          </div>
        </div>
        
        {/* Job details */}
        <div className="notion-card mb-8 animation-delay-300 animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Description */}
          {job.description && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Deskripsi Pekerjaan
              </h2>
              <div className="prose max-w-none text-notion-text-light">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </div>
          )}
          
          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-notion-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tanggung Jawab
              </h2>
              <ul className="space-y-3 text-notion-text-light">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-notion-highlight-green text-notion-text mr-3 flex-shrink-0 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-notion-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                Persyaratan
              </h2>
              <ul className="space-y-3 text-notion-text-light">
                {job.requirements.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-notion-highlight-orange text-notion-text mr-3 flex-shrink-0 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Expectations */}
          {job.expectations && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-notion-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Ekspektasi Kandidat
              </h2>
              <div className="space-y-4">
                {job.expectations.ageRange && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Rentang Usia</h3>
                    <p className="text-notion-text-light">
                      {job.expectations.ageRange.min} - {job.expectations.ageRange.max} tahun
                    </p>
                  </div>
                )}
                
                {job.expectations.expectedCharacter && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Karakter yang Diharapkan</h3>
                    <p className="text-notion-text-light">{job.expectations.expectedCharacter}</p>
                  </div>
                )}
                
                {job.expectations.foreignLanguage && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Bahasa Asing</h3>
                    <p className="text-notion-text-light">{job.expectations.foreignLanguage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Additional Requirements */}
          {job.additionalRequirements && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-notion-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Persyaratan Tambahan
              </h2>
              <div className="space-y-4">
                {job.additionalRequirements.gender && job.additionalRequirements.gender !== "ANY" && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Jenis Kelamin</h3>
                    <p className="text-notion-text-light">
                      {job.additionalRequirements.gender === "MALE" ? "Laki-laki" : 
                       job.additionalRequirements.gender === "FEMALE" ? "Perempuan" : 
                       job.additionalRequirements.gender === "ALL" ? "Semua jenis kelamin" : "Tidak ditentukan"}
                    </p>
                  </div>
                )}
                
                {job.additionalRequirements.requiredDocuments && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Dokumen yang Diperlukan</h3>
                    <p className="text-notion-text-light whitespace-pre-line">{job.additionalRequirements.requiredDocuments}</p>
                  </div>
                )}
                
                {job.additionalRequirements.specialSkills && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Keahlian Khusus</h3>
                    <p className="text-notion-text-light whitespace-pre-line">{job.additionalRequirements.specialSkills}</p>
                  </div>
                )}
                
                {job.additionalRequirements.technologicalSkills && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Keahlian Teknologi</h3>
                    <p className="text-notion-text-light whitespace-pre-line">{job.additionalRequirements.technologicalSkills}</p>
                  </div>
                )}
                
                {job.additionalRequirements.suitableForDisability && (
                  <div className="notion-property group p-3 bg-notion-background-gray rounded-notion">
                    <h3 className="text-base font-medium text-notion-text">Cocok untuk Penyandang Disabilitas</h3>
                    <p className="text-notion-text-light">Ya</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Work Locations */}
          {locations && locations.length > 0 && (
            <div className="p-6">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Lokasi Kerja
              </h2>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.id} className="p-3 bg-notion-background-gray rounded-notion hover:bg-notion-background-gray-hover transition-colors duration-150">
                    <p className="font-medium text-notion-text flex items-center">
                      {location.isRemote && (
                        <span className="inline-block mr-2 text-notion-green">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </span>
                      )}
                      {location.city}, {location.province}
                      {location.isRemote && <span className="ml-2 text-sm text-notion-green">(Remote tersedia)</span>}
                    </p>
                    {location.address && <p className="text-notion-text-light text-sm mt-1">{location.address}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Company info */}
        <div className="notion-card animation-delay-400 animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-notion-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Tentang Perusahaan
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {employer.logoUrl && employer.logoUrl !== 'https://via.placeholder.com/100' && (
                <div className="w-24 h-24 relative flex-shrink-0 bg-white p-2 rounded-notion border border-notion-border">
                  <Image
                    src={employer.logoUrl}
                    alt={employer.namaPerusahaan}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-notion-text mb-2">
                  {employer.namaPerusahaan}
                  {employer.merekUsaha && ` (${employer.merekUsaha})`}
                </h3>
                <p className="text-notion-text-light mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-notion-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Industri: {employer.industri}
                </p>
                <p className="text-notion-text-light mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-notion-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Lokasi: {employer.alamatKantor}
                </p>
              
                <div className="flex flex-wrap gap-4">
                  {employer.website && (
                    <a 
                      href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-notion-text hover:text-notion-blue flex items-center transition-colors duration-150"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                      Website
                    </a>
                  )}
                </div>
              
                {/* Social media links */}
                {employer.socialMedia && Object.values(employer.socialMedia).some(link => !!link) && (
                  <div className="mt-4">
                    <p className="text-sm text-notion-text-light mb-2">Ikuti kami di:</p>
                    <SocialMediaLinks socialMedia={employer.socialMedia} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-notion-border p-4">
            <Link
              href={`/careers/${employerId}`}
              className="notion-button-secondary w-full flex justify-center items-center gap-2 hover:bg-notion-background-gray-hover transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Lihat Semua Lowongan dari {employer.namaPerusahaan}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 