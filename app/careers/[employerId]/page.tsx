import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getAllEmployerIds, getEmployerById, getJobsByEmployerId } from '@/lib/db';

// Add export config for ISR
export const revalidate = 3600; // Revalidate every hour

// Types
interface JobLocation {
  city: string;
  province: string;
  isRemote: boolean;
  address?: string;
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
  params: { employerId: string } 
}): Promise<Metadata> {
  const employer = await getEmployerById(params.employerId);
  
  if (!employer) {
    return {
      title: 'Employer Not Found',
      description: 'The requested employer could not be found.',
    };
  }
  
  return {
    title: `Careers at ${employer.namaPerusahaan}`,
    description: `Browse job opportunities at ${employer.namaPerusahaan}. Find your next career opportunity with us.`,
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
function JobCard({ job }: { job: Job }) {
  return (
    <Link 
      href={`/careers/${job.employerId}/${job.id}`}
      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.jobTitle}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {job.contractType}
        </span>
        {job.numberOfPositions && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {job.numberOfPositions} position{job.numberOfPositions > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-4">
        <p>Posted: {format(new Date(job.postedDate), 'MMM dd, yyyy')}</p>
        {job.applicationDeadline && (
          <p>Deadline: {format(new Date(job.applicationDeadline), 'MMM dd, yyyy')}</p>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <span className="inline-flex items-center text-blue-600 hover:text-blue-800">
          View details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </span>
      </div>
    </Link>
  );
}

// Main page component
export default async function EmployerCareersPage({
  params,
}: {
  params: { employerId: string };
}) {
  const employerId = params.employerId;
  
  // Get employer details
  const employer = await getEmployerById(employerId);
  
  if (!employer) {
    notFound();
  }
  
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
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {employer.logoUrl ? (
              <div className="w-24 h-24 relative flex-shrink-0">
                <Image
                  src={employer.logoUrl}
                  alt={employer.namaPerusahaan}
                  fill
                  className="object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-gray-500">
                  {employer.namaPerusahaan.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {employer.namaPerusahaan}
                {employer.merekUsaha && ` (${employer.merekUsaha})`}
              </h1>
              <p className="text-gray-600 mb-2">{employer.industri}</p>
              <p className="text-gray-600 mb-4">{employer.alamatKantor}</p>
              
              {employer.website && (
                <a 
                  href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Job listings */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
        
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No open positions</h3>
            <p className="text-gray-600">
              There are currently no job openings at {employer.namaPerusahaan}.
              Please check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
