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
    )
  };
  
  return (
    <div className="flex space-x-4 mt-4">
      {socialMedia.linkedin && (
        <a 
          href={socialMedia.linkedin.startsWith('http') ? socialMedia.linkedin : `https://${socialMedia.linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-blue-700"
          aria-label="LinkedIn"
        >
          {socialIcons.linkedin}
        </a>
      )}
      
      {socialMedia.instagram && (
        <a 
          href={socialMedia.instagram.startsWith('http') ? socialMedia.instagram : `https://instagram.com/${socialMedia.instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-pink-600"
          aria-label="Instagram"
        >
          {socialIcons.instagram}
        </a>
      )}
      
      {socialMedia.facebook && (
        <a 
          href={socialMedia.facebook.startsWith('http') ? socialMedia.facebook : `https://facebook.com/${socialMedia.facebook}`}
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
          href={socialMedia.twitter.startsWith('http') ? socialMedia.twitter : `https://twitter.com/${socialMedia.twitter.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-notion-text-light hover:text-blue-400"
          aria-label="Twitter"
        >
          {socialIcons.twitter}
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
      
      <div className="notion-container py-12">
        {/* Back button */}
        <div className="mb-6 animation-delay-100 animate-fade-in">
          <Link 
            href={`/careers/${employerId}`}
            className="inline-flex items-center text-sm font-medium text-notion-text hover:text-notion-text-light"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke semua lowongan
          </Link>
        </div>
        
        {/* Job header */}
        <div className="notion-card mb-8 overflow-hidden animation-delay-200 animate-fade-in">
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
                <div className="w-24 h-24 relative flex-shrink-0 mt-4 md:mt-0">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="notion-property">
                <p className="text-sm text-notion-text-light">Tanggal Posting</p>
                <p className="font-medium text-notion-text">{format(new Date(job.postedDate), 'dd MMMM yyyy', { locale: id })}</p>
              </div>
              
              {job.applicationDeadline && (
                <div className="notion-property">
                  <p className="text-sm text-notion-text-light">Batas Waktu Pendaftaran</p>
                  <p className="font-medium text-notion-text-red">{format(new Date(job.applicationDeadline), 'dd MMMM yyyy', { locale: id })}</p>
                </div>
              )}
              
              {job.workingHours && (
                <div className="notion-property">
                  <p className="text-sm text-notion-text-light">Jam Kerja</p>
                  <p className="font-medium text-notion-text">{job.workingHours}</p>
                </div>
              )}
              
              {job.salaryRange && (
                <div className="notion-property">
                  <p className="text-sm text-notion-text-light">Kisaran Gaji</p>
                  <p className="font-medium text-notion-text">{formatSalary(job.salaryRange)}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Apply button */}
          <div className="border-t border-notion-border p-4">
            <Link
              href={`/job-application/${jobId}`}
              className="notion-button w-full flex justify-center"
            >
              Lamar Posisi Ini
            </Link>
          </div>
        </div>
        
        {/* Job details */}
        <div className="notion-card mb-8 animation-delay-300 animate-fade-in">
          {/* Description */}
          {job.description && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4">Deskripsi Pekerjaan</h2>
              <div className="prose max-w-none text-notion-text-light">
                <p className="whitespace-pre-line">{job.description}</p>
              </div>
            </div>
          )}
          
          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4">Tanggung Jawab</h2>
              <ul className="list-disc pl-5 space-y-2 text-notion-text-light">
                {job.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4">Persyaratan</h2>
              <ul className="list-disc pl-5 space-y-2 text-notion-text-light">
                {job.requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Expectations */}
          {job.expectations && (
            <div className="p-6 border-b border-notion-border">
              <h2 className="text-xl font-medium text-notion-text mb-4">Ekspektasi Kandidat</h2>
              <div className="space-y-4">
                {job.expectations.ageRange && (
                  <div className="notion-property">
                    <h3 className="text-base font-medium text-notion-text">Rentang Usia</h3>
                    <p className="text-notion-text-light">
                      {job.expectations.ageRange.min} - {job.expectations.ageRange.max} tahun
                    </p>
                  </div>
                )}
                
                {job.expectations.expectedCharacter && (
                  <div className="notion-property">
                    <h3 className="text-base font-medium text-notion-text">Karakter yang Diharapkan</h3>
                    <p className="text-notion-text-light">{job.expectations.expectedCharacter}</p>
                  </div>
                )}
                
                {job.expectations.foreignLanguage && (
                  <div className="notion-property">
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
              <h2 className="text-xl font-medium text-notion-text mb-4">Persyaratan Tambahan</h2>
              <div className="space-y-4">
                {job.additionalRequirements.gender && job.additionalRequirements.gender !== "ANY" && (
                  <div className="notion-property">
                    <h3 className="text-base font-medium text-notion-text">Jenis Kelamin</h3>
                    <p className="text-notion-text-light">
                      {job.additionalRequirements.gender === "MALE" ? "Laki-laki" : 
                       job.additionalRequirements.gender === "FEMALE" ? "Perempuan" : 
                       job.additionalRequirements.gender === "ALL" ? "Semua jenis kelamin" : "Tidak ditentukan"}
                    </p>
                  </div>
                )}
                
                {job.additionalRequirements.requiredDocuments && (
                  <div className="notion-property">
                    <h3 className="text-base font-medium text-notion-text">Dokumen yang Diperlukan</h3>
                    <p className="text-notion-text-light whitespace-pre-line">{job.additionalRequirements.requiredDocuments}</p>
                  </div>
                )}
                
                {job.additionalRequirements.specialSkills && (
                  <div className="notion-property">
                    <h3 className="text-base font-medium text-notion-text">Keahlian Khusus</h3>
                    <p className="text-notion-text-light whitespace-pre-line">{job.additionalRequirements.specialSkills}</p>
                  </div>
                )}
                
                {job.additionalRequirements.technologicalSkills && (
                  <div className="notion-property">
                    <h3 className="text-base font-medium text-notion-text">Keahlian Teknologi</h3>
                    <p className="text-notion-text-light whitespace-pre-line">{job.additionalRequirements.technologicalSkills}</p>
                  </div>
                )}
                
                {job.additionalRequirements.suitableForDisability && (
                  <div className="notion-property">
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
              <h2 className="text-xl font-medium text-notion-text mb-4">Lokasi Kerja</h2>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.id} className="p-3 bg-notion-background-gray rounded-notion">
                    <p className="font-medium text-notion-text">
                      {location.city}, {location.province}
                      {location.isRemote && " (Remote tersedia)"}
                    </p>
                    {location.address && <p className="text-notion-text-light text-sm mt-1">{location.address}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Company info */}
        <div className="notion-card animation-delay-400 animate-fade-in">
          <div className="p-6 border-b border-notion-border bg-notion-background-gray">
            <h2 className="text-xl font-medium text-notion-text mb-4">Tentang Perusahaan</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {employer.logoUrl && (
                <div className="w-24 h-24 relative flex-shrink-0 bg-white p-2 rounded-notion border border-notion-border">
                  <Image
                    src={employer.logoUrl}
                    alt={employer.namaPerusahaan}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium text-notion-text mb-2">
                  {employer.namaPerusahaan}
                  {employer.merekUsaha && ` (${employer.merekUsaha})`}
                </h3>
                <p className="text-notion-text-light mb-2">Industri: {employer.industri}</p>
                <p className="text-notion-text-light mb-4">Lokasi: {employer.alamatKantor}</p>
                
                <div className="flex flex-wrap gap-4">
                  {employer.website && (
                    <a 
                      href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-notion-text hover:text-notion-text-light flex items-center"
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
              className="notion-button-secondary w-full flex justify-center"
            >
              Lihat Semua Lowongan dari {employer.namaPerusahaan}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 