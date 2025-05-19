'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Briefcase, Building, Globe, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import JobApplicationForm from '@/components/job-application/JobApplicationForm';
import { useRouteParams } from '@/lib/hooks/useRouteParams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import context providers
import { JobPostingContext } from '@/lib/context/JobPostingContext';
import { JobApplicationProvider } from '@/lib/context/JobApplicationContext';
import { toast } from '@/components/ui/use-toast';

// Define the CustomSession type
interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

// Define the profile data type
interface ProfileData {
  id: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  cvFileUrl?: string;
  cvUploadDate?: string;
  pendidikanTerakhir?: string; // Add field for last education
  // Other profile fields...
}

export default function JobSeekerApplicationPage() {
  const router = useRouter();
  
  // Use our custom hook to safely get the jobId param
  const params = useRouteParams<{ jobId: string }>();
  const jobId = params.jobId;
  
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  // Check if user is authenticated and is a job seeker
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/job-seeker/job-application/${jobId}`)}`);
      return;
    }

    if (session?.user?.userType !== 'job_seeker') {
      // Redirect to employer dashboard if user is an employer
      setError('Anda perlu login sebagai pencari kerja untuk mengakses halaman ini.');
      return;
    }
  }, [status, session, router, jobId]);

  // Check if the user has already applied to this job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (status !== 'authenticated' || session?.user?.userType !== 'job_seeker') return;
      
      try {
        const response = await fetch(`/api/job-application/check/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to check application status');
        }
        
        const data = await response.json();
        
        if (data.hasApplied) {
          setHasApplied(true);
          setReferenceCode(data.referenceCode);
          
          // Show a toast and redirect to the success page
          toast({
            title: "Anda sudah melamar pekerjaan ini",
            description: "Redirecting to halaman status lamaran...",
          });
          
          // Redirect to the success page with the reference code
          setTimeout(() => {
            router.push(`/job-seeker/job-application/success?reference=${data.referenceCode}`);
          }, 1500);
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };
    
    checkApplicationStatus();
  }, [status, session, jobId, router]);

  useEffect(() => {
    // Fetch job details only if user is authenticated and is a job seeker
    if (status === 'authenticated' && session?.user?.userType === 'job_seeker') {
      fetchJobData();
      fetchProfileData(); // Fetch profile data when authenticated
    }
  }, [status, session]);

  // Fetch the user's profile data
  const fetchProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      
      // Fetch the user's profile from the API
      const response = await fetch('/api/job-seeker/profile');
      
      if (!response.ok) {
        console.error('Failed to fetch profile data:', response.status);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('Profile data loaded successfully:', result.data);
        
        // Find the latest education record
        let highestEducation = undefined;
        
        if (result.data.pendidikan && result.data.pendidikan.length > 0) {
          console.log('Found pendidikan data:', result.data.pendidikan);
          
          // Sort education by date if available, assuming newer is higher level
          const sortedEducation = [...result.data.pendidikan].sort((a, b) => {
            // Try to parse dates if available
            const dateA = a.tanggalLulus ? new Date(a.tanggalLulus) : new Date(0);
            const dateB = b.tanggalLulus ? new Date(b.tanggalLulus) : new Date(0);
            // Sort most recent first
            return dateB.getTime() - dateA.getTime();
          });
          
          // Get the most recent education
          const latestEducation = sortedEducation[0];
          console.log('Latest education:', latestEducation);
          
          // Map to our expected format
          highestEducation = mapEducationLevelToEnum(latestEducation.jenjangPendidikan);
          console.log('Mapped education level:', highestEducation);
        } else {
          console.log('No pendidikan data found in profile');
        }
        
        // Ensure we process any education data from the result
        const profileWithEducation = {
          ...result.data,
          pendidikanTerakhir: highestEducation
        };
        
        console.log('Final profile with education:', profileWithEducation);
        setProfileData(profileWithEducation);
      } else {
        console.warn('Profile data response was not successful or empty:', result);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Helper function to map education level to our enum values
  const mapEducationLevelToEnum = (educationLevel: string): string | undefined => {
    const educationMapping: Record<string, string> = {
      'SD': 'SD',
      'SMP': 'SMP',
      'SMA': 'SMA/SMK',
      'SMK': 'SMA/SMK',
      'SMA/SMK': 'SMA/SMK',
      'D1': 'D1',
      'D2': 'D2',
      'D3': 'D3',
      'D4': 'D4',
      'S1': 'S1',
      'S2': 'S2',
      'S3': 'S3',
      // Add more mappings if needed
    };
    
    // Try to find a direct match first
    if (educationLevel in educationMapping) {
      return educationMapping[educationLevel];
    }
    
    // If no direct match, try a case-insensitive match
    const normalizedLevel = educationLevel.toUpperCase();
    for (const [key, value] of Object.entries(educationMapping)) {
      if (normalizedLevel.includes(key)) {
        return value;
      }
    }
    
    // Log if we couldn't map the education level
    console.warn(`Could not map education level: ${educationLevel}`);
    return undefined;
  };

  const fetchJobData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the job from the API
      const response = await fetch(`/api/jobs/${jobId}`);
      
      // If successful, use the API response
      if (response.ok) {
        const jobData = await response.json();
        setJobDetails(jobData);
      } else {
        // Fallback to mock data if API fails (temporarily)
        console.warn(`API failed with status ${response.status}, using fallback data`);
        
        // Use mock data for specific known IDs temporarily
        let mockJobData: any = null;
        
        // Define mock jobs with specific IDs - matching the ones in the job detail page
        switch(jobId) {
          case "JOB-2023":
            mockJobData = {
              jobId: "JOB-2023",
              jobTitle: "Senior Frontend Developer",
              company: "TechCorp Indonesia",
              workLocations: [
                { city: "Jakarta", province: "DKI Jakarta", isRemote: false },
                { city: "Anywhere", province: "Any", isRemote: true }
              ],
              contractType: "FULL_TIME",
              salaryRange: {
                min: 15000000,
                max: 25000000,
                isNegotiable: true
              },
              minWorkExperience: 3,
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              companyInfo: {
                name: "TechCorp Indonesia",
                industry: "Technology",
                address: "Jl. Sudirman No. 123, Jakarta Pusat",
                website: "https://techcorp.id",
                socialMedia: {
                  linkedin: "techcorp-indonesia",
                  instagram: "techcorp.id"
                },
                description: "TechCorp Indonesia adalah perusahaan teknologi terkemuka yang berfokus pada pengembangan solusi digital inovatif untuk berbagai sektor bisnis."
              }
            };
            break;

          default:
            // Create a generic job for other IDs as fallback
            mockJobData = {
              jobId,
              jobTitle: "Software Developer",
              company: "Tech Company",
              workLocations: [
                { city: "Jakarta", province: "DKI Jakarta", isRemote: false }
              ],
              contractType: "FULL_TIME",
              salaryRange: {
                min: 10000000,
                max: 20000000,
                isNegotiable: true
              },
              minWorkExperience: 1,
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              companyInfo: {
                name: "Tech Company",
                industry: "Technology",
                address: "Jakarta, Indonesia",
                website: "https://example.com"
              }
            };
        }
        
        setJobDetails(mockJobData);
      }
    } catch (err) {
      console.error("Error fetching job data:", err);
      setError("Gagal memuat data lowongan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return <JobApplicationSkeleton />;
  }

  // Show error state
  if (error || !jobDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="p-4">
            <Button variant="ghost" onClick={() => router.back()} className="p-2 -ml-2 mb-4">
              <ArrowLeft className="h-5 w-5" />
              <span className="ml-1">Kembali</span>
            </Button>
            
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || "Lowongan tidak ditemukan"}
              </h2>
              <p className="text-gray-500 mb-6">
                Mohon maaf, kami tidak dapat menemukan lowongan pekerjaan dengan ID {jobId}
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/job-seeker/jobs">Cari Lowongan Lain</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has applied already, show loading state while redirecting
  if (hasApplied) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Anda sudah melamar pekerjaan ini
          </h2>
          <p className="text-gray-500 mb-6">
            Anda akan dialihkan ke halaman status lamaran...
          </p>
        </div>
      </div>
    );
  }

  // We'll create a JobPosting wrapper with our fetched data
  const jobPostingData = {
    ...jobDetails,
    jobId: jobId,
    jobTitle: jobDetails.jobTitle,
    minWorkExperience: jobDetails.minWorkExperience
  };

  // Prepare profile data for the JobApplicationProvider
  const applicationProfileData = profileData ? {
    fullName: profileData.namaLengkap,
    email: profileData.email,
    phone: profileData.nomorTelepon,
    cvFileUrl: profileData.cvFileUrl,
    education: profileData.pendidikanTerakhir as "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | undefined
  } : undefined;

  console.log('Application profile data being passed to provider:', applicationProfileData);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back button in top-left */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <Button variant="ghost" onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-1">Kembali</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for job summary
function JobSummary({ jobDetails }: { jobDetails: any }) {
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
              {jobDetails.workLocations?.map((location: { city: string; province: string; isRemote: boolean }, index: number) => (
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

function JobApplicationSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Back button skeleton */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="p-4">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Job Summary Skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Company info skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-0">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-16 w-16 rounded-md mr-4" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>

            {/* Application Form Skeleton */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  </div>
                  <CardTitle className="text-center">Memuat Formulir Aplikasi</CardTitle>
                  <CardDescription className="text-center">Harap tunggu sementara kami menyiapkan formulir lamaran...</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 