import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import EmployerLogo from './employer-logo';
import { MinWorkExperienceEnum, getMinWorkExperienceLabel } from '@/lib/constants';
import { minWorkExperienceEnum } from '@/lib/db';
import { MapPinIcon, BriefcaseIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { mapDbWorkExperienceToFrontend, DbWorkExperienceEnum } from '@/lib/utils/enum-mappers';

// Database job type
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
  employer: {
    namaPerusahaan: string;
    logoUrl: string | null;
  } | null;
}

// Types
interface Job {
  id: string;
  jobId: string;
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
  employer: {
    namaPerusahaan: string;
    logoUrl: string | null;
  } | null;
}

// Convert database job to frontend job
function mapDbJobToFrontendJob(dbJob: DbJob): Job {
  return {
    ...dbJob,
    minWorkExperience: mapDbWorkExperienceToFrontend(dbJob.minWorkExperience) as MinWorkExperienceEnum
  };
}

// Job card component
function JobCard({ job, index }: { job: Job; index: number }) {
  // Convert contract type or use a default
  const contractType = job.jobId?.split('-')[0] || 'Full-time';
  
  return (
    <Link 
      href={`/job-seeker/jobs/${job.id}`}
      className={`notion-card card-hover overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="p-6 border-b border-notion-border bg-notion-background-gray">
        <div className="flex items-start space-x-3 mb-3">
          {job.employer && (
            <div className="flex-shrink-0">
              <EmployerLogo 
                logoUrl={job.employer.logoUrl} 
                companyName={job.employer.namaPerusahaan} 
                size="sm"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-medium text-notion-text mb-1">{job.jobTitle}</h3>
            {job.employer && (
              <p className="text-notion-text-light mb-2">{job.employer.namaPerusahaan}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-notion-highlight-blue text-notion-text text-xs font-medium rounded-notion">
                {contractType}
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

// Jobs list component that accepts jobsData as prop
export default function JobsList({ jobsData }: { jobsData: DbJob[] }) {
  // Map database jobs to frontend jobs
  const frontendJobs = jobsData.map(mapDbJobToFrontendJob);
  
  if (frontendJobs.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frontendJobs.map((job, index) => (
          <JobCard key={job.id} job={job} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-20 bg-notion-background-gray rounded-lg shadow-sm">
      <div className="mx-auto max-w-md">
        <svg 
          className="mx-auto h-24 w-24 text-notion-text-light mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h3 className="text-2xl font-medium text-notion-text mb-2">Belum Ada Lowongan</h3>
        <p className="text-notion-text-light mb-6">
          Saat ini belum ada lowongan pekerjaan yang tersedia. Silakan cek kembali nanti untuk peluang baru.
        </p>
      </div>
    </div>
  );
} 