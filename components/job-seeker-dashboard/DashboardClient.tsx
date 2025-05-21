"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { 
  Search, 
  Briefcase, 
  User, 
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Building
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmployerLogo from "../../app/job-seeker/jobs/components/employer-logo";

// Define the type for job applications from server
interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  status: string;
  date: string;
}

// Props type for the client component
interface DashboardClientProps {
  userName: string;
  initialRecentApplications: JobApplication[];
}

// New interface for the sample jobs from the API
interface SampleJob {
  uuid: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  logoUrl: string | null;
}

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch sample jobs');
  }
  return response.json();
};

// SampleJobCardSkeleton component for loading state
const SampleJobCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="py-2 px-3 bg-gray-50">
      <Skeleton className="h-5 w-24" />
    </CardHeader>
    <CardContent className="py-2 px-3">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
    <CardFooter className="py-2 px-3 border-t">
      <Skeleton className="h-4 w-28" />
    </CardFooter>
  </Card>
);

export default function DashboardClient({ 
  userName,
  initialRecentApplications 
}: DashboardClientProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [recentApplications] = useState<JobApplication[]>(initialRecentApplications);
  
  // Fetch sample jobs using SWR
  const { data: sampleJobsData, error: sampleJobsError, isLoading: isLoadingSampleJobs } = 
    useSWR<{ jobs: SampleJob[] }>('/api/jobs/sample', fetcher);
  
  const handleJobSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobId) {
      router.push(`/job-seeker/jobs/${jobId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Selamat datang, {userName}!</h1>
        <form onSubmit={handleJobSearch} className="flex w-full md:w-auto gap-2">
          <Input
            type="text"
            placeholder="Masukkan ID Lowongan"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4 mr-2" />
            Cari Lowongan
          </Button>
        </form>
      </div>

      {/* Dynamic Sample Jobs Card - Replacing static sample job IDs */}
      <Card className="bg-sky-50 border-sky-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sky-800 text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Jelajahi Lowongan Ini
          </CardTitle>
          <CardDescription className="text-sky-700">
            Beberapa lowongan terbaru yang mungkin menarik bagi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSampleJobs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <SampleJobCardSkeleton key={i} />
              ))}
            </div>
          )}
          
          {sampleJobsError && (
            <div className="text-red-600 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5" />
              <span>Terjadi kesalahan saat memuat data lowongan. Silakan coba lagi nanti.</span>
            </div>
          )}
          
          {sampleJobsData && sampleJobsData.jobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {sampleJobsData.jobs.map((job) => (
                <Card key={job.uuid} className="border-gray-200 overflow-hidden">
                  <CardHeader className="py-3 px-4 bg-gray-50 flex-row items-center gap-3">
                    <EmployerLogo 
                      logoUrl={job.logoUrl} 
                      companyName={job.companyName} 
                      size="sm"
                    />
                    <div>
                      <CardTitle className="text-sm font-mono text-sky-800">{job.jobId}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <p className="text-base font-semibold text-gray-800 leading-tight">{job.jobTitle}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                      {job.companyName}
                    </p>
                  </CardContent>
                  <CardFooter className="py-2 px-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                      onClick={() => {
                        setJobId(job.jobId); // Set search input to human-readable job ID
                        router.push(`/job-seeker/jobs/${job.jobId}`); // Navigate using human-readable job ID instead of UUID
                      }}
                    >
                      Lihat Lowongan <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {sampleJobsData && sampleJobsData.jobs.length === 0 && !isLoadingSampleJobs && (
            <div className="text-gray-500 flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <Briefcase className="h-5 w-5" />
              <span>Belum ada lowongan pekerjaan tersedia saat ini.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/job-seeker/profile">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profil Saya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Lihat dan edit informasi pribadi Anda</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                Edit Profil <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/job-seeker/applications">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Lamaran Saya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Pantau lamaran kerja dan statusnya</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/job-seeker/jobs">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Cari Lowongan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Temukan peluang kerja baru</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                Cari Pekerjaan <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lamaran Terbaru</CardTitle>
          <CardDescription>Lamaran kerja terbaru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">ID Lowongan</th>
                      <th className="text-left py-2 px-2 font-medium">Posisi</th>
                      <th className="text-left py-2 px-2 font-medium">Perusahaan</th>
                      <th className="text-left py-2 px-2 font-medium">Status</th>
                      <th className="text-left py-2 px-2 font-medium">Tanggal</th>
                      <th className="text-right py-2 px-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((application) => (
                      <tr key={application.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{application.id}</td>
                        <td className="py-2 px-2">{application.jobTitle}</td>
                        <td className="py-2 px-2">{application.companyName}</td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'REVIEWED' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'INTERVIEWED' ? 'bg-purple-100 text-purple-800' :
                            application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {application.status === 'SUBMITTED' ? 'Dikirim' :
                             application.status === 'REVIEWED' ? 'Ditinjau' :
                             application.status === 'INTERVIEWED' ? 'Wawancara' :
                             application.status === 'REJECTED' ? 'Ditolak' :
                             application.status === 'ACCEPTED' ? 'Diterima' :
                             application.status}
                          </span>
                        </td>
                        <td className="py-2 px-2">{application.date}</td>
                        <td className="py-2 px-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/job-seeker/applications/${application.id}`)}
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Anda belum memiliki lamaran kerja</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-blue-600"
                  onClick={() => router.push('/job-seeker/jobs')}
                >
                  Cari Lowongan Kerja
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 