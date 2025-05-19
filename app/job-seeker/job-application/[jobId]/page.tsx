import { Suspense } from 'react';
import { ArrowLeft, Briefcase, Building, Globe, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound, redirect } from 'next/navigation';

// Import context providers
import { JobPostingContext } from '@/lib/context/JobPostingContext';
import { JobApplicationProvider } from '@/lib/context/JobApplicationContext';

// Import Components
import JobApplicationForm from '@/components/job-application/JobApplicationForm';

// Import server action
import { getJobApplicationPageData, JobDetails, JobSeekerProfileData } from './actions';

// Remove type annotations from the page component parameters
export default async function JobSeekerApplicationPage({ params }) {
  try {
    const { jobId } = params;
    
    // Use the server action to fetch all necessary data
    const { jobDetails, profileData } = await getJobApplicationPageData(jobId);
    
    // Prepare profile data for the JobApplicationProvider
    const applicationProfileData = profileData ? {
      fullName: profileData.namaLengkap,
      email: profileData.email,
      phone: profileData.nomorTelepon,
      cvFileUrl: profileData.cvFileUrl || undefined,
      education: profileData.pendidikanTerakhir as "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | undefined
    } : undefined;
    
    // We'll create a JobPosting wrapper with our fetched data
    const jobPostingData = {
      ...jobDetails,
      jobId: jobDetails.jobId,
      jobTitle: jobDetails.jobTitle,
      minWorkExperience: jobDetails.minWorkExperience
    };
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Back button in top-left */}
          <div className="sticky top-0 z-10 bg-white p-4 border-b">
            <Button variant="ghost" asChild className="p-2 -ml-2">
              <Link href="/job-seeker/jobs">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-1">Kembali</span>
              </Link>
            </Button>
          </div>
          
          <div className="p-4 lg:p-6">
            <h1 className="text-xl font-semibold mb-6">Aplikasi untuk {jobDetails.jobTitle}</h1>
            
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Left column: Job information */}
              <div className="lg:col-span-1 space-y-6">
                <JobSummary jobDetails={jobDetails} />
              </div>
              
              {/* Right column: Application form */}
              <div className="lg:col-span-2">
                <Suspense fallback={<JobApplicationFormSkeleton />}>
                  <JobPostingContext.Provider value={{ 
                    data: jobPostingData, 
                    updateFormValues: () => {}, 
                    getStepValidationErrors: () => ({}),
                    currentStep: 1,
                    setCurrentStep: () => {} 
                  }}>
                    {/* Wrap the form with JobApplicationProvider and pass profile data */}
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
      </div>
    );
  } catch (error) {
    console.error('Error rendering job application page:', error);
    return notFound();
  }
}

// Separate component for job summary
function JobSummary({ jobDetails }) {
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
          <div>
            <h5 className="text-sm font-medium text-gray-500">Lokasi</h5>
            <ul className="mt-1 text-sm text-gray-900 list-disc pl-5">
              {jobDetails.workLocations?.map((location, index) => (
                <li key={index}>
                  {location.city}, {location.province}
                  {location.isRemote && " (Remote)"}
                </li>
              ))}
            </ul>
          </div>
          
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
              {jobDetails.minWorkExperience} tahun minimum
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