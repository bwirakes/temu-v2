import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getAllEmployerIds, getEmployerById, getJobsByEmployerId } from '@/lib/db';
import EmployerLogo from '../components/employer-logo';
import { Suspense } from 'react';
import EmployerDetailLoader from '../components/employer-detail-loader';
import { MinWorkExperienceEnum, getMinWorkExperienceLabel } from '@/lib/constants';
import { MapPinIcon, BriefcaseIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
  jobId: string; // Human-readable job ID (e.g., job-12345)
  jobTitle: string;
  contractType?: string; // Add contractType property to fix the type error
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
    params: Promise<{ employerId: string }>
  }
): Promise<Metadata> {
  const employer = await getEmployerById((await props.params).employerId);

  if (!employer) {
    return {
      title: 'Perusahaan Tidak Ditemukan',
      description: 'Perusahaan yang diminta tidak dapat ditemukan.',
    };
  }

  return {
    title: `Karir di ${employer.namaPerusahaan}`,
    description: `Jelajahi peluang kerja di ${employer.namaPerusahaan}. Temukan peluang karir berikutnya bersama kami.`,
  };
}

// Generate static paths for all employers
export async function generateStaticParams() {
  const employers = await getAllEmployerIds();
  
  return employers.map(employer => ({
    employerId: employer.id,
  }));
}

// Job card component
function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <Link 
      href={`/careers/${job.employerId}/${job.id}`}
      className="notion-card card-hover overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-6 border-b border-notion-border bg-notion-background-gray">
        <h3 className="text-xl font-medium text-notion-text mb-2">{job.jobTitle}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 bg-notion-highlight-blue text-notion-text text-xs font-medium rounded-notion">
            {job.contractType}
          </span>
          {job.numberOfPositions && (
            <span className="px-3 py-1 bg-notion-highlight-green text-notion-text text-xs font-medium rounded-notion">
              {job.numberOfPositions} posisi
            </span>
          )}
          <span className="px-3 py-1 bg-notion-highlight-orange text-notion-text text-xs font-medium rounded-notion">
            {getMinWorkExperienceLabel(job.minWorkExperience)}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 text-sm text-notion-text-light">
          <div className="flex items-start">
            <CalendarIcon className="w-5 h-5 text-notion-text-light mr-2 mt-0.5" />
            <div>
              <p>Diposting: {format(new Date(job.postedDate), 'dd MMM yyyy', { locale: id })}</p>
            </div>
          </div>
          
          {job.lokasiKerja && (
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 text-notion-text-light mr-2 mt-0.5" />
              <div>
                <p>{job.lokasiKerja}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <BriefcaseIcon className="w-5 h-5 text-notion-text-light mr-2 mt-0.5" />
            <div>
              <p>{getMinWorkExperienceLabel(job.minWorkExperience)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-notion-border pt-4 flex justify-end">
          <span className="inline-flex items-center text-notion-text hover:text-notion-blue transition-colors duration-150">
            Lihat Detail
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

// Social media links component
function SocialMediaLinks({ socialMedia }: { socialMedia?: Employer['socialMedia'] }) {
  if (!socialMedia) return null;
  
  const socialIcons = {
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
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

// Job listings component
async function JobListings({ employerId }: { employerId: string }) {
  // Get all jobs for this employer
  const allJobs = await getJobsByEmployerId(employerId);

  // Filter for confirmed jobs only and sort by posted date (newest first)
  const jobs = allJobs
    .filter(job => job.isConfirmed)
    .sort((a, b) => {
      const dateA = new Date(a.postedDate).getTime();
      const dateB = new Date(b.postedDate).getTime();
      return dateB - dateA;
    });

  if (jobs.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <JobCard key={job.id} job={job} index={index} />
        ))}
      </div>
    );
  }

  // Get employer name for display in the empty state
  const employer = await getEmployerById(employerId);
  
  return (
    <div className="notion-card p-8 text-center shadow-sm">
      <div className="flex justify-center mb-4 text-notion-text-light">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-notion-text mb-2">Tidak ada posisi terbuka</h3>
      <p className="text-notion-text-light">
        Saat ini tidak ada lowongan pekerjaan di {employer?.namaPerusahaan || 'perusahaan ini'}.
        Silakan periksa kembali nanti untuk peluang baru.
      </p>
    </div>
  );
}

// Employer info component
async function EmployerInfo({ employerId }: { employerId: string }) {
  // Get employer details
  const employer = await getEmployerById(employerId);

  if (!employer) {
    notFound();
  }
  
  // Fetch all jobs for this employer to display count
  const allJobs = await getJobsByEmployerId(employerId);
  const jobs = allJobs.filter(job => job.isConfirmed);

  return (
    <>
      {/* Company header */}
      <div className="notion-card mb-8 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6 border-b border-notion-border bg-notion-background-gray">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <EmployerLogo 
                logoUrl={employer.logoUrl} 
                companyName={employer.namaPerusahaan} 
                size="lg"
              />
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-2xl font-medium text-notion-text mb-2">
                {employer.namaPerusahaan}
                {employer.merekUsaha && ` (${employer.merekUsaha})`}
              </h1>
              <p className="text-notion-text-light mb-2 flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-2 text-notion-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {employer.industri}
              </p>
              <p className="text-notion-text-light mb-4 flex items-center justify-center md:justify-start">
                <svg className="w-4 h-4 mr-2 text-notion-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {employer.alamatKantor}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
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
              <div className="flex justify-center md:justify-start">
                <SocialMediaLinks socialMedia={employer.socialMedia} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Company stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-notion-background-gray rounded-notion hover:bg-notion-background-gray-hover transition-colors duration-150">
              <div className="flex items-center justify-center mb-2 text-notion-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p className="text-sm text-notion-text-light">Posisi Terbuka</p>
              <p className="text-2xl font-medium text-notion-text">{jobs.length}</p>
            </div>
            
            <div className="p-4 bg-notion-background-gray rounded-notion hover:bg-notion-background-gray-hover transition-colors duration-150">
              <div className="flex items-center justify-center mb-2 text-notion-green">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <p className="text-sm text-notion-text-light">Industri</p>
              <p className="text-lg font-medium text-notion-text">{employer.industri}</p>
            </div>
            
            <div className="p-4 bg-notion-background-gray rounded-notion hover:bg-notion-background-gray-hover transition-colors duration-150">
              <div className="flex items-center justify-center mb-2 text-notion-purple">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <p className="text-sm text-notion-text-light">Kontak Person</p>
              <p className="text-lg font-medium text-notion-text">{employer.pic.nama}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job listings */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-medium text-notion-text flex items-center">
            <svg className="w-5 h-5 mr-2 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Posisi Terbuka
          </h2>
          {jobs.length > 0 && (
            <p className="text-sm text-notion-text-light mt-1 sm:mt-0 bg-notion-highlight-blue px-3 py-1 rounded-notion">
              {jobs.length} posisi terbuka
            </p>
          )}
        </div>
        
        <Suspense fallback={<div className="animate-pulse">{/* ... skeleton for jobs ... */}</div>}>
          <JobListings employerId={employerId} />
        </Suspense>
      </div>
      
      {/* Call to action */}
      <div className="bg-notion-background-gray rounded-notion border border-notion-border p-8 md:p-12 shadow-sm">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 mr-2 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span className="notion-highlight">Siap untuk melamar?</span>
          </h2>
          <p className="text-notion-text-light mb-8">
            Buat akun untuk dengan mudah melamar posisi di {employer.namaPerusahaan} dan perusahaan lainnya.
          </p>
          <div>
            <Link
              href="/job-seeker/register"
              className="notion-button flex items-center justify-center gap-2 mx-auto w-auto inline-flex hover:bg-notion-blue-dark transition-colors duration-150"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Daftar sebagai Pencari Kerja
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Main page component
export default async function EmployerCareersPage(
  props: {
    params: Promise<{ employerId: string }>;
  }
) {
  return (
    (<div className="bg-notion-background min-h-screen">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      <div className="notion-container py-12 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/careers" 
            className="inline-flex items-center text-sm font-medium text-notion-text hover:text-notion-text-light transition duration-150 ease-in-out"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke semua perusahaan
          </Link>
        </div>
        
        <Suspense fallback={<EmployerDetailLoader />}>
          <EmployerInfo employerId={(await props.params).employerId} />
        </Suspense>
      </div>
    </div>)
  );
} 
