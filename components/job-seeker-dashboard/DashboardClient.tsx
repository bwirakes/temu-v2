"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Briefcase, 
  User, 
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function DashboardClient({ 
  userName,
  initialRecentApplications 
}: DashboardClientProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [recentApplications] = useState<JobApplication[]>(initialRecentApplications);
  
  const handleJobSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobId) {
      router.push(`/job-seeker/jobs/${jobId}`);
    }
  };

  // Sample job IDs for testing
  const sampleJobIds = [
    { id: "JOB-2023", title: "Senior Frontend Developer", company: "TechCorp Indonesia" },
    { id: "JOB-3045", title: "UX/UI Designer", company: "Creative Solutions" },
    { id: "JOB-4872", title: "Backend Developer (Node.js)", company: "Fintech Innovations" },
    { id: "JOB-5639", title: "Data Scientist", company: "AnalyticsPro" },
  ];

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
            Cari Lowongan
          </Button>
        </form>
      </div>

      {/* Sample Job IDs Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Contoh ID Lowongan untuk Testing
          </CardTitle>
          <CardDescription className="text-blue-700">
            Gunakan ID Lowongan berikut untuk mencoba alur lamar kerja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {sampleJobIds.map((job) => (
              <Card key={job.id} className="border-blue-200 overflow-hidden">
                <CardHeader className="py-2 px-3 bg-blue-100">
                  <CardTitle className="text-sm font-mono text-blue-800">{job.id}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-gray-600">{job.company}</p>
                </CardContent>
                <CardFooter className="py-2 px-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                    onClick={() => {
                      setJobId(job.id);
                      router.push(`/job-seeker/jobs/${job.id}`);
                    }}
                  >
                    Lihat Lowongan <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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