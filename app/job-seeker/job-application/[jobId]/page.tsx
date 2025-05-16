'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import JobApplicationForm from '@/components/job-application/JobApplicationForm';
import { Briefcase, ArrowLeft, Globe, MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';

// Import JobPostingContext for job details
import { JobPostingContext, JobPostingData, useJobPosting } from '@/lib/context/JobPostingContext';
import { JobApplicationProvider as JobApplicationContextProvider } from '@/lib/context/JobApplicationContext';

export default function JobSeekerApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching job data
    const fetchJobData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch the job from an API
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock job data based on jobId
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
                logo: "https://via.placeholder.com/100",
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

          case "JOB-3045":
            mockJobData = {
              jobId: "JOB-3045",
              jobTitle: "UX/UI Designer",
              company: "Creative Solutions",
              workLocations: [
                { city: "Bandung", province: "Jawa Barat", isRemote: false }
              ],
              contractType: "FULL_TIME",
              salaryRange: {
                min: 10000000,
                max: 18000000,
                isNegotiable: true
              },
              minWorkExperience: 2,
              applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              companyInfo: {
                logo: "https://via.placeholder.com/100",
                name: "Creative Solutions",
                industry: "Creative Agency",
                address: "Jl. Dago No. 45, Bandung",
                website: "https://creativesolutions.co.id",
                socialMedia: {
                  linkedin: "creative-solutions-id",
                  instagram: "creativesolutions.id"
                },
                description: "Creative Solutions adalah agensi kreatif yang membantu bisnis dalam mengembangkan identitas merek dan pengalaman digital yang menarik."
              }
            };
            break;

          case "JOB-4872":
            mockJobData = {
              jobId: "JOB-4872",
              jobTitle: "Backend Developer (Node.js)",
              company: "Fintech Innovations",
              workLocations: [
                { city: "Surabaya", province: "Jawa Timur", isRemote: false }
              ],
              contractType: "FULL_TIME",
              salaryRange: {
                min: 12000000,
                max: 22000000,
                isNegotiable: true
              },
              minWorkExperience: 2,
              applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              companyInfo: {
                logo: "https://via.placeholder.com/100",
                name: "Fintech Innovations",
                industry: "Financial Technology",
                address: "Jl. Basuki Rahmat No. 78, Surabaya",
                website: "https://fintechinnovations.id",
                socialMedia: {
                  linkedin: "fintech-innovations",
                  instagram: "fintech.innovations"
                },
                description: "Fintech Innovations adalah perusahaan teknologi finansial yang mengembangkan solusi pembayaran digital dan manajemen keuangan untuk bisnis dan individu."
              }
            };
            break;

          case "JOB-5639":
            mockJobData = {
              jobId: "JOB-5639",
              jobTitle: "Data Scientist",
              company: "AnalyticsPro",
              workLocations: [
                { city: "Anywhere", province: "Any", isRemote: true }
              ],
              contractType: "FULL_TIME",
              salaryRange: {
                min: 18000000,
                max: 28000000,
                isNegotiable: true
              },
              minWorkExperience: 3,
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              companyInfo: {
                logo: "https://via.placeholder.com/100",
                name: "AnalyticsPro",
                industry: "Data Analytics",
                address: "Remote",
                website: "https://analyticspro.id",
                socialMedia: {
                  linkedin: "analytics-pro",
                  instagram: "analyticspro.id"
                },
                description: "AnalyticsPro adalah perusahaan analisis data yang membantu bisnis dalam mengambil keputusan berdasarkan data dan wawasan yang mendalam."
              }
            };
            break;

          default:
            // For unrecognized IDs, create a generic job
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
                logo: "https://via.placeholder.com/100",
                name: "Tech Company",
                industry: "Technology",
                address: "Jakarta, Indonesia",
                website: "https://techcompany.id",
                socialMedia: {
                  linkedin: "tech-company",
                  instagram: "techcompany.id"
                },
                description: "Tech Company adalah perusahaan teknologi yang berfokus pada pengembangan solusi perangkat lunak untuk berbagai kebutuhan bisnis."
              }
            };
        }
        
        setJobDetails(mockJobData);
      } catch (err) {
        setError("Failed to load job details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  if (isLoading) {
    return <JobApplicationSkeleton />;
  }

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
                <Link href="/job-seeker/browse-jobs">Cari Lowongan Lain</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // We'll create a JobPosting wrapper with our fetched data
  const jobPostingData = {
    ...jobDetails
  };

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
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Left column: Job information */}
            <div className="lg:col-span-1">
              <JobSummary />
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
                {/* Import JobApplicationProvider from our new context and wrap the form */}
                <JobApplicationContextProvider jobId={jobId}>
                  <JobApplicationForm jobId={jobId} />
                </JobApplicationContextProvider>
              </JobPostingContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for job summary to use the context inside
function JobSummary() {
  const { data } = useJobPosting();
  
  return (
    <>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Detail Lowongan
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-gray-500">Lokasi</h5>
            <ul className="mt-1 text-sm text-gray-900 list-disc pl-5">
              {data.workLocations?.map((location: { city: string; province: string; isRemote: boolean }, index: number) => (
                <li key={index}>
                  {location.city}, {location.province}
                  {location.isRemote && " (Remote)"}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-500">Jenis Kontrak</h5>
            <p className="mt-1 text-sm text-gray-900">
              {data.contractType === "FULL_TIME" ? "Full Time" :
               data.contractType === "PART_TIME" ? "Part Time" :
               data.contractType === "CONTRACT" ? "Kontrak" :
               data.contractType === "INTERNSHIP" ? "Magang" :
               "Freelance"}
            </p>
          </div>
          
          {data.salaryRange && (
            <div>
              <h5 className="text-sm font-medium text-gray-500">Kisaran Gaji</h5>
              <p className="mt-1 text-sm text-gray-900">
                {data.salaryRange.min && `Rp ${data.salaryRange.min.toLocaleString()}`}
                {data.salaryRange.min && data.salaryRange.max && " - "}
                {data.salaryRange.max && `Rp ${data.salaryRange.max.toLocaleString()}`}
                {data.salaryRange.isNegotiable && " (Dapat dinegosiasikan)"}
              </p>
            </div>
          )}
          
          <div>
            <h5 className="text-sm font-medium text-gray-500">Pengalaman yang Dibutuhkan</h5>
            <p className="mt-1 text-sm text-gray-900">
              {data.minWorkExperience} tahun minimum
            </p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-500">Batas Waktu Pendaftaran</h5>
            <p className="mt-1 text-sm text-gray-900">
              {data.applicationDeadline?.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tentang Perusahaan Section */}
      {data.companyInfo && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tentang Perusahaan
            </h3>
          </div>
          
          <div className="flex items-center mb-4">
            {data.companyInfo.logo && (
              <div className="mr-4">
                <Image 
                  src={data.companyInfo.logo} 
                  alt={`${data.companyInfo.name} logo`}
                  width={64}
                  height={64}
                  className="rounded-md"
                />
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900">{data.companyInfo.name}</h4>
              <p className="text-sm text-gray-500">{data.companyInfo.industry}</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            {data.companyInfo.address && (
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <span>{data.companyInfo.address}</span>
              </div>
            )}
            
            {data.companyInfo.website && (
              <div className="flex items-start">
                <Globe className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <a 
                  href={data.companyInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.companyInfo.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            {data.companyInfo.socialMedia && Object.keys(data.companyInfo.socialMedia).length > 0 && (
              <div className="flex items-start">
                <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <div className="flex space-x-2">
                  {data.companyInfo.socialMedia.linkedin && (
                    <a 
                      href={`https://linkedin.com/company/${data.companyInfo.socialMedia.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}
                  {data.companyInfo.socialMedia.instagram && (
                    <a 
                      href={`https://instagram.com/${data.companyInfo.socialMedia.instagram}`}
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
          
          {data.companyInfo.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">{data.companyInfo.description}</p>
            </div>
          )}
        </div>
      )}
    </>
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
          <div className="mb-6">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Summary Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    
                    <div>
                      <Skeleton className="h-5 w-28 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    
                    <div>
                      <Skeleton className="h-5 w-28 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
                
                {/* Company info skeleton */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  
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
                  
                  <Skeleton className="h-16 w-full mt-4" />
                </div>
              </div>
            </div>

            {/* Application Form Skeleton */}
            <div className="lg:col-span-2 lg:max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <Skeleton className="h-8 w-48 mb-6" />
                
                {/* Consent checkbox skeleton */}
                <div className="mb-6 p-4 border rounded-md bg-blue-50">
                  <div className="flex items-start">
                    <Skeleton className="h-4 w-4 mr-3 mt-0.5" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  
                  <div className="flex items-start space-x-3 pt-4">
                    <Skeleton className="h-4 w-4 mt-0.5" />
                    <div>
                      <Skeleton className="h-5 w-64 mb-1" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 