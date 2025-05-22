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
  getJobByHumanId,
  getJobWorkLocationsByJobId,
  minWorkExperienceEnum
} from '@/lib/db';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';
import JobDetailLoader from '../../components/job-detail-loader';
import { MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { MinWorkExperienceEnum, getMinWorkExperienceLabel } from '@/lib/constants';
import { mapDbWorkExperienceToFrontend, DbWorkExperienceEnum } from '@/lib/utils/enum-mappers';

// Add export config for ISR
export const revalidate = 1260; // Revalidate every 20 minutes + 60 seconds offset

// Forbidden employer ID
const FORBIDDEN_EMPLOYER_ID = '95101c79-7517-4444-9930-d3e243ce6ae0';

// Type that matches the actual database job schema
interface DbJob {
  id: string;
  jobId: string;
  jobTitle: string;
  postedDate: Date | string;
  numberOfPositions?: number | null;
  isConfirmed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  employerId: string;
  minWorkExperience: DbWorkExperienceEnum;
  lokasiKerja?: string | null;
  lastEducation?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | null;
  requiredCompetencies?: string | null;
  expectations?: {
    ageRange?: {
      min: number;
      max: number;
    };
  } | null;
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    acceptedDisabilityTypes?: string[];
    numberOfDisabilityPositions?: number;
  } | null;
}

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
  jobId: string; // Human-readable job ID (e.g., job-12345)
  jobTitle: string;
  postedDate: Date | string;
  numberOfPositions?: number | null;
  isConfirmed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  employerId: string;
  minWorkExperience: MinWorkExperienceEnum;
  lokasiKerja?: string | null;
  lastEducation?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | null;
  requiredCompetencies?: string | null;
  expectations?: {
    ageRange?: {
      min: number;
      max: number;
    };
  } | null;
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    acceptedDisabilityTypes?: string[];
    numberOfDisabilityPositions?: number;
  } | null;
}

// Convert database job to frontend job by mapping the enum
function mapDbJobToFrontendJob(dbJob: DbJob): Job {
  return {
    ...dbJob,
    minWorkExperience: mapDbWorkExperienceToFrontend(dbJob.minWorkExperience) as MinWorkExperienceEnum
  };
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
export async function generateMetadata(
  props: { 
    params: Promise<{ employerId: string; jobId: string }> 
  }
): Promise<Metadata> {
  const params = await props.params;
  
  // Check if this is the forbidden employer ID
  if (params.employerId === FORBIDDEN_EMPLOYER_ID) {
    return {
      title: 'Not Found',
      description: 'The requested page could not be found.',
    };
  }
  
  // Check if jobId is a UUID or a human-readable ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.jobId);
  
  // Use the appropriate function based on the ID format
  const dbJob = isUuid 
    ? await getJobById(params.jobId)
    : await getJobByHumanId(params.jobId);
    
  // Convert database job to frontend job if it exists
  const job = dbJob ? mapDbJobToFrontendJob(dbJob) : null;
  
  const employer = job ? await getEmployerById(job.employerId) : null;

  if (!job || !employer) {
    return {
      title: 'Lowongan Tidak Ditemukan',
      description: 'Lowongan yang diminta tidak dapat ditemukan.',
    };
  }

  return {
    title: `${job.jobTitle} di ${employer.namaPerusahaan}`,
    description: `Lamar posisi ${job.jobTitle} di ${employer.namaPerusahaan}`,
  };
}

// Generate static paths for all jobs, excluding those from the forbidden employer
export async function generateStaticParams() {
  // Get all employer IDs except the forbidden one
  const employers = await getAllEmployerIds();
  const filteredEmployers = employers.filter(employer => employer.id !== FORBIDDEN_EMPLOYER_ID);
  
  const paths = [];
  
  // For each employer, get all their confirmed job IDs
  for (const employer of filteredEmployers) {
    const jobIds = await getConfirmedJobIdsByEmployerId(employer.id);
    
    // Add a path for each job, ensure we're using the human-readable jobId if available
    for (const job of jobIds) {
      if (job.jobId || job.id) {
        paths.push({
          employerId: employer.id,
          jobId: job.jobId || job.id, // Use the human-readable ID if available, or fall back to UUID
        });
      }
    }
  }
  
  return paths;
}

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
          className="text-gray-500 hover:text-pink-600 transition-colors"
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
          className="text-gray-500 hover:text-blue-700 transition-colors"
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
          className="text-gray-500 hover:text-blue-600 transition-colors"
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
          className="text-gray-500 hover:text-blue-400 transition-colors"
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
          className="text-gray-500 hover:text-black transition-colors"
          aria-label="TikTok"
        >
          {socialIcons.tiktok}
        </a>
      )}
    </div>
  );
}

// Job detail component
async function JobDetail({ employerId, jobId }: { employerId: string; jobId: string }) {
  // Return early if this is the forbidden employer ID
  if (employerId === FORBIDDEN_EMPLOYER_ID) {
    return notFound();
  }
  
  // Check if jobId is a UUID or a human-readable ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
  
  // Use the appropriate function based on the ID format
  const dbJob = isUuid 
    ? await getJobById(jobId)
    : await getJobByHumanId(jobId);
  
  // Convert database job to frontend job if it exists
  const job = dbJob ? mapDbJobToFrontendJob(dbJob) : null;
  
  if (!job || job.employerId !== employerId || !job.isConfirmed) {
    return notFound();
  }
  
  // Get employer details
  const employer = await getEmployerById(employerId);
  
  if (!employer) {
    return notFound();
  }
  
  // Get job locations
  const jobLocations = await getJobWorkLocationsByJobId(job.id);
  
  // Extract the contract type from the job ID
  const contractType = job.jobId?.split('-')[0] || 'Full-time';

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 pb-16">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {job.jobTitle}
            </h1>
            <p className="text-xl text-gray-600">{employer.namaPerusahaan}</p>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6">
            <Link href={`/careers/${employerId}/${jobId}/apply`}>
              <Button className="w-full md:w-auto" size="lg">
                Lamar Sekarang
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {job.numberOfPositions && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-700">{job.numberOfPositions} posisi</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <BriefcaseIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{getMinWorkExperienceLabel(job.minWorkExperience)}</span>
                </div>
                
                {job.lastEducation && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    <span className="text-gray-700">Pendidikan min. {job.lastEducation}</span>
                  </div>
                )}
                
                {jobLocations && jobLocations.length > 0 && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-2">
                      {jobLocations.map((location, idx) => (
                        <div key={idx} className="text-gray-700">
                          {location.isRemote 
                            ? 'Remote'
                            : `${location.city}, ${location.province}`
                          }
                          {location.address && (
                            <div className="text-sm text-gray-500">{location.address}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {job.lokasiKerja && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-2">
                      <div className="text-gray-700">{job.lokasiKerja}</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">
                    Diposting: {format(new Date(job.postedDate), 'dd MMMM yyyy', { locale: id })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {employer.website && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a 
                      href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website Perusahaan
                    </a>
                  </div>
                )}
                
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-gray-700">{employer.industri}</span>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{employer.alamatKantor}</span>
                </div>
                
                <SocialMediaLinks socialMedia={employer.socialMedia} />
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Deskripsi Pekerjaan</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Deskripsi Tugas</h3>
            <div className="prose prose-gray max-w-none">
              {job.requiredCompetencies ? (
                <p>{job.requiredCompetencies}</p>
              ) : (
                <p className="text-gray-500 italic">Deskripsi tugas tidak tersedia</p>
              )}
            </div>
          </div>
          
          {job.expectations && job.expectations.ageRange && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Kriteria Umur</h3>
              <p className="text-gray-700">{job.expectations.ageRange.min} - {job.expectations.ageRange.max} tahun</p>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Pengalaman Kerja Minimal</h3>
            <p className="text-gray-700">{getMinWorkExperienceLabel(job.minWorkExperience)}</p>
          </div>
          
          {job.lokasiKerja && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Lokasi Kerja</h3>
              <p className="text-gray-700">{job.lokasiKerja}</p>
            </div>
          )}
          
          {job.additionalRequirements && job.additionalRequirements.gender && job.additionalRequirements.gender !== 'ANY' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Jenis Kelamin</h3>
              <p className="text-gray-700">
                {job.additionalRequirements.gender === 'MALE' && 'Laki-laki'}
                {job.additionalRequirements.gender === 'FEMALE' && 'Perempuan'} 
                {job.additionalRequirements.gender === 'ALL' && 'Laki-laki & Perempuan'}
              </p>
            </div>
          )}
          
          {job.additionalRequirements?.acceptedDisabilityTypes && job.additionalRequirements.acceptedDisabilityTypes.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Terbuka untuk Disabilitas</h3>
              <div className="flex flex-wrap gap-2">
                {job.additionalRequirements.acceptedDisabilityTypes.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {type}
                  </Badge>
                ))}
              </div>
              {job.additionalRequirements.numberOfDisabilityPositions && (
                <p className="mt-2 text-sm text-gray-600">
                  {job.additionalRequirements.numberOfDisabilityPositions} posisi tersedia untuk penyandang disabilitas
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <Link href={`/careers/${employerId}/${jobId}/apply`}>
          <Button size="lg" className="min-w-[200px]">
            Lamar Sekarang
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Main page component
export default async function JobDetailPage(
  props: {
    params: Promise<{ employerId: string; jobId: string }>;
  }
) {
  const { employerId, jobId } = await props.params;
  
  // Return 404 for the forbidden employer ID
  if (employerId === FORBIDDEN_EMPLOYER_ID) {
    return notFound();
  }
  
  return (
    <div className="bg-notion-background min-h-screen">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      <div className="notion-container py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <Suspense fallback={<JobDetailLoader />}>
          <JobDetail employerId={employerId} jobId={jobId} />
        </Suspense>
      </div>
    </div>
  );
} 