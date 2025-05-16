'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Calendar, MapPin, DollarSign, Clock, Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Define the type for job details
interface JobPosting {
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryRange: {
    min?: number;
    max?: number;
    isNegotiable: boolean;
  };
  contractType: string;
  minWorkExperience: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  applicationDeadline: Date;
  postedDate: Date;
  workLocations: {
    city: string;
    province: string;
    isRemote: boolean;
  }[];
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching job data
    const fetchJobData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch the job from an API
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock job data based on jobId
        let mockJobData: JobPosting | null = null;

        // Define mock jobs with specific IDs
        switch(jobId) {
          case "JOB-2023":
            mockJobData = {
              jobId: "JOB-2023",
              jobTitle: "Senior Frontend Developer",
              company: "TechCorp Indonesia",
              location: "Jakarta, Indonesia",
              salaryRange: {
                min: 15000000,
                max: 25000000,
                isNegotiable: true
              },
              contractType: "FULL_TIME",
              minWorkExperience: 3,
              description: "We are looking for a skilled Frontend Developer with experience in React and TypeScript to join our team. The ideal candidate will be responsible for building high-quality user interfaces for our web applications.",
              requirements: [
                "At least 3 years of experience in frontend development",
                "Strong proficiency in React and TypeScript",
                "Experience with modern frontend tools and frameworks",
                "Good understanding of responsive design principles",
                "Excellent problem-solving skills"
              ],
              responsibilities: [
                "Develop and maintain frontend applications using React and TypeScript",
                "Collaborate with backend developers and designers",
                "Optimize applications for maximum performance",
                "Write clean, maintainable, and reusable code",
                "Participate in code reviews and testing"
              ],
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              workLocations: [
                {
                  city: "Jakarta",
                  province: "DKI Jakarta",
                  isRemote: false
                },
                {
                  city: "Anywhere",
                  province: "Any",
                  isRemote: true
                }
              ]
            };
            break;

          case "JOB-3045":
            mockJobData = {
              jobId: "JOB-3045",
              jobTitle: "UX/UI Designer",
              company: "Creative Solutions",
              location: "Bandung, Indonesia",
              salaryRange: {
                min: 10000000,
                max: 18000000,
                isNegotiable: true
              },
              contractType: "FULL_TIME",
              minWorkExperience: 2,
              description: "Creative Solutions is looking for a talented UX/UI Designer to create amazing user experiences. The ideal candidate should have a passion for designing beautiful, intuitive interfaces and solving complex UX problems.",
              requirements: [
                "At least 2 years of experience in UX/UI design",
                "Proficiency in Figma, Adobe XD, or similar design tools",
                "Strong portfolio showcasing UI design and UX thinking",
                "Knowledge of design systems and component-based design",
                "Understanding of accessibility standards"
              ],
              responsibilities: [
                "Create wireframes, prototypes, and high-fidelity mockups",
                "Conduct user research and usability testing",
                "Collaborate with product managers and developers",
                "Create and maintain design systems",
                "Stay up-to-date with design trends and best practices"
              ],
              applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              workLocations: [
                {
                  city: "Bandung",
                  province: "Jawa Barat",
                  isRemote: false
                }
              ]
            };
            break;

          case "JOB-4872":
            mockJobData = {
              jobId: "JOB-4872",
              jobTitle: "Backend Developer (Node.js)",
              company: "Fintech Innovations",
              location: "Surabaya, Indonesia",
              salaryRange: {
                min: 12000000,
                max: 22000000,
                isNegotiable: true
              },
              contractType: "FULL_TIME",
              minWorkExperience: 2,
              description: "Fintech Innovations is seeking a talented Backend Developer with Node.js expertise to join our engineering team. You'll work on building scalable, secure APIs and microservices for our financial technology platform.",
              requirements: [
                "At least 2 years of experience with Node.js",
                "Experience with Express or similar frameworks",
                "Strong understanding of RESTful APIs and microservices",
                "Knowledge of database systems (PostgreSQL, MongoDB)",
                "Experience with authentication and authorization protocols",
                "Understanding of CI/CD pipelines"
              ],
              responsibilities: [
                "Design and implement scalable backend services",
                "Write clean, maintainable, and well-tested code",
                "Collaborate with frontend developers and DevOps engineers",
                "Optimize application performance and database queries",
                "Participate in code reviews and technical discussions"
              ],
              applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              workLocations: [
                {
                  city: "Surabaya",
                  province: "Jawa Timur",
                  isRemote: false
                }
              ]
            };
            break;

          case "JOB-5639":
            mockJobData = {
              jobId: "JOB-5639",
              jobTitle: "Data Scientist",
              company: "AnalyticsPro",
              location: "Remote, Indonesia",
              salaryRange: {
                min: 18000000,
                max: 28000000,
                isNegotiable: true
              },
              contractType: "FULL_TIME",
              minWorkExperience: 3,
              description: "AnalyticsPro is looking for a Data Scientist to help us extract insights from complex datasets. You'll work on building machine learning models and data visualizations to solve real business problems.",
              requirements: [
                "At least 3 years of experience in data science or related field",
                "Proficiency in Python and data science libraries (pandas, numpy, scikit-learn)",
                "Experience with machine learning and statistical analysis",
                "Knowledge of SQL and database systems",
                "Excellent communication skills to present findings to non-technical stakeholders"
              ],
              responsibilities: [
                "Collect, process, and analyze large datasets",
                "Build and deploy machine learning models",
                "Create data visualizations and dashboards",
                "Collaborate with product and engineering teams",
                "Stay up-to-date with the latest developments in data science and machine learning"
              ],
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              workLocations: [
                {
                  city: "Anywhere",
                  province: "Any",
                  isRemote: true
                }
              ]
            };
            break;

          default:
            // For unrecognized IDs, create a generic job
            mockJobData = {
              jobId,
              jobTitle: "Software Developer",
              company: "Tech Company",
              location: "Jakarta, Indonesia",
              salaryRange: {
                min: 10000000,
                max: 20000000,
                isNegotiable: true
              },
              contractType: "FULL_TIME",
              minWorkExperience: 1,
              description: "Generic job description for testing purposes.",
              requirements: [
                "Technical skills",
                "Communication skills",
                "Problem-solving abilities"
              ],
              responsibilities: [
                "Develop software",
                "Test applications",
                "Document code"
              ],
              applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              postedDate: new Date(),
              workLocations: [
                {
                  city: "Jakarta",
                  province: "DKI Jakarta",
                  isRemote: false
                }
              ]
            };
        }
        
        setJob(mockJobData);
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
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="p-4">
            <Button variant="ghost" onClick={() => router.back()} className="p-2 -ml-2 mb-4">
              <ArrowLeft className="h-5 w-5" />
              <span className="ml-1">Kembali</span>
            </Button>
            
            <div className="text-center py-12">
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Back button in top-left */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="p-2 -ml-2" 
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="ml-1">Kembali</span>
          </Button>
        </div>
        
        <div className="p-4">
          {/* Job Title and Company */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{job.jobTitle}</h1>
            <p className="mt-1 text-lg text-gray-500">{job.company}</p>
            <p className="mt-1 text-sm text-gray-500">ID Lowongan: {job.jobId}</p>
          </div>
          
          {/* Job Details Section */}
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
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Lokasi</p>
                  <ul className="mt-1 text-sm text-gray-900 list-disc pl-5">
                    {job.workLocations.map((location, index) => (
                      <li key={index}>
                        {location.city}, {location.province}
                        {location.isRemote && " (Remote)"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Jenis Kontrak</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {job.contractType === "FULL_TIME" ? "Full Time" :
                     job.contractType === "PART_TIME" ? "Part Time" :
                     job.contractType === "CONTRACT" ? "Kontrak" :
                     job.contractType === "INTERNSHIP" ? "Magang" :
                     "Freelance"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Kisaran Gaji</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {job.salaryRange.min && `Rp ${job.salaryRange.min.toLocaleString()}`}
                    {job.salaryRange.min && job.salaryRange.max && " - "}
                    {job.salaryRange.max && `Rp ${job.salaryRange.max.toLocaleString()}`}
                    {job.salaryRange.isNegotiable && " (Dapat dinegosiasikan)"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Pengalaman</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {job.minWorkExperience} tahun minimum
                  </p>
                </div>
              </div>
            </div>
            
            {/* Lamar Sekarang button - Moved below job details */}
            <div className="mt-6">
              <Button 
                asChild 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Link href={`/job-seeker/job-application/${job.jobId}`}>
                  Lamar Sekarang
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Job Description Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Deskripsi Pekerjaan</h3>
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Persyaratan</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tanggung Jawab</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                Diposting pada: {job.postedDate.toLocaleDateString('id-ID')}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                Batas lamaran: {job.applicationDeadline.toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Back button skeleton */}
        <div className="sticky top-0 z-10 bg-white p-4 border-b">
          <Skeleton className="h-9 w-24" />
        </div>
        
        <div className="p-4">
          {/* Job title and company skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Job details section skeleton */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Skeleton className="h-5 w-5 mt-0.5 mr-3" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              
              <div className="flex items-start">
                <Skeleton className="h-5 w-5 mt-0.5 mr-3" />
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              
              <div className="flex items-start">
                <Skeleton className="h-5 w-5 mt-0.5 mr-3" />
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              
              <div className="flex items-start">
                <Skeleton className="h-5 w-5 mt-0.5 mr-3" />
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
            
            {/* Button skeleton */}
            <div className="mt-6">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          
          {/* Job description section skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 