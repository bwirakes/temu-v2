import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  getAllConfirmedJobIds,
  getJobById, 
  getJobWorkLocationsByJobId,
  getEmployerById 
} from '@/lib/db';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react';
import JobDetailSkeleton from '../components/job-detail-skeleton';

// Use ISR with revalidation
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
  jobId: string; // Human-readable job ID (e.g., job-12345)
  jobTitle: string;
  postedDate: Date | string;
  numberOfPositions?: number | null;
  isConfirmed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  employerId: string;
  minWorkExperience: number;
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

// Metadata generation
export async function generateMetadata(
  props: { 
    params: Promise<{ jobId: string }>
  }
): Promise<Metadata> {
  const params = await props.params;
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
    description: `Lamar posisi ${job.jobTitle} di ${employer.namaPerusahaan}`,
  };
}

// Generate static paths for all confirmed jobs
export async function generateStaticParams() {
  const jobs = await getAllConfirmedJobIds();
  
  return jobs.map(job => ({
    jobId: job.id,
  }));
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

// Main page component
export default async function JobDetailPage(props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  const { jobId } = params;

  // Get job details
  const job = await getJobById(jobId);

  // If job doesn't exist or isn't confirmed, return 404
  if (!job || !job.isConfirmed) {
    notFound();
  }

  // Get employer details
  const employer = await getEmployerById(job.employerId);

  if (!employer) {
    notFound();
  }

  // Get job locations
  const locations = await getJobWorkLocationsByJobId(jobId);

  // Extract the contract type from the job ID
  const contractType = job.jobId?.split('-')[0] || 'Full-time';

  return (
    <div className="max-w-[85rem] mx-auto space-y-6 px-4 sm:px-6 py-6 md:py-8">
      <div>
        <div className="mb-6">
          <Link 
            href="/job-seeker/jobs"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke semua lowongan
          </Link>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{job.jobTitle}</h1>
        <p className="text-gray-500 mb-6">{employer.namaPerusahaan}</p>
      </div>
      
      {/* Job header card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-xs font-medium">
                  {contractType}
                </Badge>
                {job.numberOfPositions && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {job.numberOfPositions} posisi
                  </Badge>
                )}
                {job.minWorkExperience > 0 && (
                  <Badge variant="outline" className="text-xs font-medium">
                    {job.minWorkExperience} tahun pengalaman
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="h-16 w-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-blue-600">
                  {employer.namaPerusahaan.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
            
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Tanggal Posting</p>
              <p className="font-medium">{format(new Date(job.postedDate), 'dd MMMM yyyy', { locale: id })}</p>
            </div>
          </div>
        </CardContent>
            
        {/* Apply button */}
        <CardFooter className="border-t pt-4">
          <Link
            href={`/job-seeker/job-application/${jobId}`}
            className="w-full"
          >
            <Button className="w-full" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path>
              </svg>
              Lamar Posisi Ini
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Job details card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Detail Lowongan</CardTitle>
        </CardHeader>
        {/* Min Work Experience */}
        {job.minWorkExperience > 0 && (
          <CardContent className="border-b pt-0 pb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Pengalaman Kerja
            </h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Minimal {job.minWorkExperience} tahun
              </p>
            </div>
          </CardContent>
        )}
        
        {/* Last Education */}
        {job.lastEducation && (
          <CardContent className="border-b pt-0 pb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              Pendidikan Terakhir
            </h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Minimal {job.lastEducation}
              </p>
            </div>
          </CardContent>
        )}
        
        {/* Required Competencies */}
        {job.requiredCompetencies && (
          <CardContent className="border-b pt-0 pb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Kompetensi yang Dibutuhkan
            </h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 whitespace-pre-line">{job.requiredCompetencies}</p>
            </div>
          </CardContent>
        )}
        
        {/* Accepted Disability Types */}
        {job.additionalRequirements?.acceptedDisabilityTypes && 
         job.additionalRequirements.acceptedDisabilityTypes.length > 0 && (
          <CardContent className="border-b pt-0 pb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Jenis Disabilitas yang Diterima
            </h2>
            <div className="space-y-2 text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                {job.additionalRequirements.acceptedDisabilityTypes.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
        
        {/* Number of Disability Positions */}
        {job.additionalRequirements?.numberOfDisabilityPositions !== null && 
         job.additionalRequirements?.numberOfDisabilityPositions !== undefined && (
          <CardContent className="border-b pt-0 pb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Jumlah Posisi untuk Disabilitas
            </h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                {job.additionalRequirements.numberOfDisabilityPositions} posisi
              </p>
            </div>
          </CardContent>
        )}
        
        {/* Work Locations */}
        {locations && locations.length > 0 && (
          <CardContent className="pt-0 pb-6">
            <h2 className="text-lg font-medium mb-4 flex items-center text-gray-900">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Lokasi Kerja
            </h2>
            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <p className="font-medium text-gray-900 flex items-center">
                    {location.isRemote && (
                      <span className="inline-block mr-2 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </span>
                    )}
                    {location.city}, {location.province}
                    {location.isRemote && <span className="ml-2 text-sm text-green-600">(Remote tersedia)</span>}
                  </p>
                  {location.address && <p className="text-gray-500 text-sm mt-1">{location.address}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Company info card */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Tentang Perusahaan
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-blue-600">
                  {employer.namaPerusahaan.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {employer.namaPerusahaan}
                {employer.merekUsaha && ` (${employer.merekUsaha})`}
              </h3>
              <p className="text-gray-500 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Industri: {employer.industri}
              </p>
              <p className="text-gray-500 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-150"
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
                  <p className="text-sm text-gray-500 mb-2">Ikuti kami di:</p>
                  <SocialMediaLinks socialMedia={employer.socialMedia} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <Link
            href={`/job-seeker/job-application/${jobId}`}
            className="w-full"
          >
            <Button className="w-full" size="lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"></path>
              </svg>
              Lamar Posisi Ini
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 