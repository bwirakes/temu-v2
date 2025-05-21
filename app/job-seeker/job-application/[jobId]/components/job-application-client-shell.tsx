'use client';

import { Suspense, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { JobPostingContext } from '@/lib/context/JobPostingContext';
import { JobApplicationProvider } from '@/lib/context/JobApplicationContext';
import JobApplicationForm from '@/components/job-application/JobApplicationForm';
import { JobDetails } from '../actions';
import { MinWorkExperienceEnum, getMinWorkExperienceLabel } from '@/lib/constants';

// Define types for the client shell props
interface ApplicationProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  cvFileUrl?: string;
  education?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | undefined;
  // Add new detailed fields
  tanggalLahir?: string;
  jenisKelamin?: string;
  pengalamanKerjaTerakhir?: { 
    posisi?: string; 
    namaPerusahaan?: string; 
  };
  gajiTerakhir?: number;
  levelPengalaman?: string;
  pendidikanFull?: Array<{
    jenjangPendidikan?: string;
    namaInstitusi?: string;
    bidangStudi?: string;
    tanggalLulus?: string | Date;
  }>;
  pengalamanKerjaFull?: Array<{
    posisi?: string;
    namaPerusahaan?: string;
    tanggalMulai?: string | Date;
    tanggalSelesai?: string | Date;
    deskripsiPekerjaan?: string;
  }>;
}

interface JobApplicationClientShellProps {
  jobId: string;
  jobDetails: JobDetails;
  applicationProfileData?: ApplicationProfileData;
}

// Import the JobSummary component from the page
interface WorkLocation {
  city: string;
  province: string;
  isRemote?: boolean;
}

// Client-side version of JobSummary component
import Image from 'next/image';
import { Briefcase, Building, Globe, MapPin } from 'lucide-react';

// Helper function to convert minWorkExperience to the expected enum type
const convertToWorkExperienceEnum = (value: string | number | undefined): MinWorkExperienceEnum => {
  // If it's already a valid enum value, return it
  if (typeof value === 'string' && 
      ['LULUSAN_BARU', 'SATU_DUA_TAHUN', 'TIGA_LIMA_TAHUN', 'LIMA_SEPULUH_TAHUN', 'LEBIH_SEPULUH_TAHUN'].includes(value)) {
    return value as MinWorkExperienceEnum;
  }
  
  // If it's a number or non-enum string, convert to appropriate enum value
  if (typeof value === 'number') {
    if (value === 0) return 'LULUSAN_BARU';
    if (value <= 2) return 'SATU_DUA_TAHUN';
    if (value <= 5) return 'TIGA_LIMA_TAHUN';
    if (value <= 10) return 'LIMA_SEPULUH_TAHUN';
    return 'LEBIH_SEPULUH_TAHUN';
  }
  
  // Default to entry level if value is undefined or invalid
  return 'LULUSAN_BARU';
};

// Separate component for job summary
function JobSummary({ jobDetails }: { jobDetails: JobDetails }) {
  return (
    <div className="space-y-6">
      <Card id="job-details-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">
              Detail Lowongan
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Lokasi Kerja */}
          {jobDetails.lokasiKerja && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Lokasi</h5>
              <p className="mt-1 text-sm text-gray-900">{jobDetails.lokasiKerja}</p>
            </div>
          )}

          {/* Work Locations if available */}
          {!jobDetails.lokasiKerja && jobDetails.workLocations?.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Lokasi</h5>
              <ul className="mt-1 text-sm text-gray-900 list-disc pl-5">
                {jobDetails.workLocations?.map((location: WorkLocation, index: number) => (
                  <li key={index}>
                    {location.city}, {location.province}
                    {location.isRemote && " (Remote)"}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {jobDetails.salaryRange && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Kisaran Gaji</h5>
              <p className="mt-1 text-sm text-gray-900">
                {jobDetails.salaryRange.min && `Rp ${jobDetails.salaryRange.min.toLocaleString()}`}
                {jobDetails.salaryRange.min && jobDetails.salaryRange.max && " - "}
                {jobDetails.salaryRange.max && `Rp ${jobDetails.salaryRange.max.toLocaleString()}`}
                {jobDetails.salaryRange.isNegotiable && " (Dapat dinegosiasikan)"}
              </p>
            </div>
          )}
          
          <div>
            <h5 className="text-sm font-medium text-gray-500">Pengalaman yang Dibutuhkan</h5>
            <p className="mt-1 text-sm text-gray-900">
              {typeof jobDetails.minWorkExperience === 'string' 
                ? getMinWorkExperienceLabel(jobDetails.minWorkExperience as MinWorkExperienceEnum)
                : `${jobDetails.minWorkExperience} tahun minimum`}
            </p>
          </div>
          
          {jobDetails.lastEducation && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Pendidikan Minimum</h5>
              <p className="mt-1 text-sm text-gray-900">
                {jobDetails.lastEducation}
              </p>
            </div>
          )}
          
          {jobDetails.requiredCompetencies && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Kompetensi yang Dibutuhkan</h5>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {jobDetails.requiredCompetencies}
              </p>
            </div>
          )}
          
          {jobDetails.numberOfPositions && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Jumlah Posisi</h5>
              <p className="mt-1 text-sm text-gray-900">
                {jobDetails.numberOfPositions} orang
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Tentang Perusahaan Section */}
      {jobDetails.companyInfo && (
        <Card id="company-info-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg leading-6 font-medium text-gray-900">
                Tentang Perusahaan
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center mb-4">
              {jobDetails.companyInfo.logoUrl && jobDetails.companyInfo.logoUrl !== 'https://via.placeholder.com/100' && (
                <div className="mr-4">
                  <Image 
                    src={jobDetails.companyInfo.logoUrl} 
                    alt={`${jobDetails.companyInfo.name} logo`}
                    width={64}
                    height={64}
                    className="rounded-md"
                  />
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-900">{jobDetails.companyInfo.name}</h4>
                <p className="text-sm text-gray-500">{jobDetails.companyInfo.industry}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              {jobDetails.companyInfo.address && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <span>{jobDetails.companyInfo.address}</span>
                </div>
              )}
              
              {jobDetails.companyInfo.website && (
                <div className="flex items-start">
                  <Globe className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <a 
                    href={jobDetails.companyInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {jobDetails.companyInfo.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {jobDetails.companyInfo.socialMedia && Object.keys(jobDetails.companyInfo.socialMedia).length > 0 && (
                <div className="flex items-start">
                  <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                  <div className="flex space-x-2">
                    {jobDetails.companyInfo.socialMedia.linkedin && (
                      <a 
                        href={`https://linkedin.com/company/${jobDetails.companyInfo.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {jobDetails.companyInfo.socialMedia.instagram && (
                      <a 
                        href={`https://instagram.com/${jobDetails.companyInfo.socialMedia.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {jobDetails.companyInfo.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{jobDetails.companyInfo.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Placeholder component for when the form is loading
function JobApplicationFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center py-6">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
        <CardTitle className="text-center">Memuat Formulir Aplikasi</CardTitle>
        <CardDescription className="text-center">Harap tunggu sementara kami menyiapkan formulir lamaran...</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function JobApplicationClientShell({
  jobId,
  jobDetails,
  applicationProfileData,
}: JobApplicationClientShellProps) {
  // Create client-side state for the JobPostingContext
  const [currentStep, setCurrentStep] = useState(1);
  
  // Create client-side handlers for the JobPostingContext
  const handleUpdateFormValues = useCallback(() => {
    // This is a client-side implementation that does nothing
    // The actual form updates are handled by JobApplicationProvider
  }, []);
  
  const handleGetStepValidationErrors = useCallback(() => {
    // This is a client-side implementation that returns empty errors
    return {};
  }, []);

  // Create the job posting data from the job details with proper type handling
  const jobPostingData = {
    jobId: jobDetails.jobId,
    jobTitle: jobDetails.jobTitle,
    minWorkExperience: convertToWorkExperienceEnum(jobDetails.minWorkExperience),
    // Handle optional string fields - convert null to undefined
    lokasiKerja: jobDetails.lokasiKerja || undefined,
    lastEducation: jobDetails.lastEducation || undefined,
    requiredCompetencies: jobDetails.requiredCompetencies || undefined,
    numberOfPositions: typeof jobDetails.numberOfPositions === 'number' ? jobDetails.numberOfPositions : undefined,
    // Handle nested objects with proper typing
    expectations: {
      ageRange: {
        min: 18, // Default values
        max: 45
      }
    },
    additionalRequirements: {
      gender: "ANY" as const, // Use const assertion to get exact type
      acceptedDisabilityTypes: null,
      numberOfDisabilityPositions: null
    },
    // Other required fields from JobPostingData
    isConfirmed: true
  };

  return (
    <div className="w-full">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <h1 className="text-xl font-semibold mb-6">Aplikasi untuk {jobDetails.jobTitle}</h1>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1 space-y-6">
            <JobSummary jobDetails={jobDetails} />
          </div>
          <div className="lg:col-span-2">
            <Suspense fallback={<JobApplicationFormSkeleton />}>
              <JobPostingContext.Provider value={{ 
                data: jobPostingData, 
                updateFormValues: handleUpdateFormValues, 
                getStepValidationErrors: handleGetStepValidationErrors,
                currentStep: currentStep,
                setCurrentStep: setCurrentStep
              }}>
                <JobApplicationProvider 
                  jobId={jobId} 
                  profileData={applicationProfileData}
                >
                  <JobApplicationForm jobId={jobId} />
                </JobApplicationProvider>
              </JobPostingContext.Provider>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 