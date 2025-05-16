"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Archive, 
  Eye, 
  Users, 
  FileText,
  Clock,
  Calendar,
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// Job interface matching our database schema
interface Job {
  id: string;
  employerId: string;
  jobTitle: string;
  contractType: string;
  salaryRange: {
    min?: number;
    max?: number;
    isNegotiable: boolean;
  };
  minWorkExperience: number;
  applicationDeadline: string | null;
  requirements: string[];
  responsibilities: string[];
  description: string | null;
  postedDate: string;
  numberOfPositions: number | null;
  workingHours: string | null;
  isConfirmed: boolean;
  applicationCount: number;
}

// Mock applicant interface
interface Applicant {
  id: string;
  name: string;
  email: string;
  applicationDate: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl: string | null;
  coverLetter: string | null;
  matchScore?: number;
}

// Mock applicants data
const mockApplicants: Applicant[] = [
  {
    id: "app-001",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    applicationDate: "2023-11-01T09:30:00Z",
    status: "REVIEWING",
    resumeUrl: "/resumes/budi-resume.pdf",
    coverLetter: "Saya sangat tertarik dengan posisi ini...",
    matchScore: 85
  },
  {
    id: "app-002",
    name: "Siti Rahayu",
    email: "siti.rahayu@example.com",
    applicationDate: "2023-11-02T14:15:00Z",
    status: "SUBMITTED",
    resumeUrl: "/resumes/siti-resume.pdf",
    coverLetter: "Dengan pengalaman 3 tahun di bidang ini...",
    matchScore: 78
  },
  {
    id: "app-003",
    name: "Agus Widodo",
    email: "agus.widodo@example.com",
    applicationDate: "2023-11-03T11:45:00Z",
    status: "INTERVIEW",
    resumeUrl: "/resumes/agus-resume.pdf",
    coverLetter: "Saya memiliki keterampilan yang dibutuhkan...",
    matchScore: 92
  },
  {
    id: "app-004",
    name: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    applicationDate: "2023-11-04T10:00:00Z",
    status: "REJECTED",
    resumeUrl: "/resumes/dewi-resume.pdf",
    coverLetter: "Saya ingin mengembangkan karir saya di perusahaan Anda...",
    matchScore: 65
  },
  {
    id: "app-005",
    name: "Eko Prasetyo",
    email: "eko.prasetyo@example.com",
    applicationDate: "2023-11-05T16:30:00Z",
    status: "OFFERED",
    resumeUrl: "/resumes/eko-resume.pdf",
    coverLetter: "Dengan latar belakang pendidikan dan pengalaman saya...",
    matchScore: 88
  }
];

// Add a mock job data object
// Add this after the mockApplicants array
const mockJob: Job = {
  id: "job-001",
  employerId: "emp-001",
  jobTitle: "Senior Software Engineer",
  contractType: "FULL_TIME",
  salaryRange: {
    min: 15000000,
    max: 25000000,
    isNegotiable: true,
  },
  minWorkExperience: 3,
  applicationDeadline: "2023-12-31T23:59:59Z",
  requirements: [
    "Minimal 3 tahun pengalaman dengan React dan Next.js",
    "Pemahaman yang kuat tentang TypeScript",
    "Pengalaman dengan RESTful API dan GraphQL",
    "Kemampuan untuk menulis kode yang bersih dan dapat diuji"
  ],
  responsibilities: [
    "Mengembangkan dan memelihara aplikasi web menggunakan React dan Next.js",
    "Berkolaborasi dengan tim desain untuk mengimplementasikan UI/UX",
    "Mengoptimalkan aplikasi untuk kecepatan dan skalabilitas",
    "Mengintegrasikan layanan backend melalui API"
  ],
  description: "Kami mencari Senior Software Engineer yang berpengalaman untuk bergabung dengan tim pengembangan kami. Posisi ini akan bertanggung jawab untuk mengembangkan dan memelihara aplikasi web kami menggunakan teknologi modern seperti React, Next.js, dan TypeScript.",
  postedDate: "2023-10-15T08:00:00Z",
  numberOfPositions: 2,
  workingHours: "Senin-Jumat, 09:00-17:00",
  isConfirmed: true,
  applicationCount: 5
};

const getContractTypeLabel = (type: string): string => {
  switch (type) {
    case "FULL_TIME":
      return "Penuh Waktu";
    case "PART_TIME":
      return "Paruh Waktu";
    case "CONTRACT":
      return "Kontrak";
    case "INTERNSHIP":
      return "Magang";
    case "FREELANCE":
      return "Freelance";
    default:
      return type;
  }
};

const getStatusBadge = (isConfirmed: boolean) => {
  if (isConfirmed) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktif</Badge>;
  } else {
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
  }
};

const getApplicationStatusBadge = (status: Applicant['status']) => {
  switch (status) {
    case 'SUBMITTED':
      return <Badge className="bg-blue-100 text-blue-800">Diajukan</Badge>;
    case 'REVIEWING':
      return <Badge className="bg-yellow-100 text-yellow-800">Sedang Ditinjau</Badge>;
    case 'INTERVIEW':
      return <Badge className="bg-purple-100 text-purple-800">Wawancara</Badge>;
    case 'OFFERED':
      return <Badge className="bg-indigo-100 text-indigo-800">Ditawari</Badge>;
    case 'ACCEPTED':
      return <Badge className="bg-green-100 text-green-800">Diterima</Badge>;
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
    case 'WITHDRAWN':
      return <Badge className="bg-gray-100 text-gray-800">Dicabut</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  } catch (e) {
    return dateString;
  }
};

const formatSalary = (min?: number, max?: number, isNegotiable?: boolean) => {
  if (!min && !max) {
    return "Tidak disebutkan";
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (min && max) {
    return `Rp ${formatNumber(min)} - Rp ${formatNumber(max)}${isNegotiable ? ' (Negosiasi)' : ''}`;
  } else if (min) {
    return `Rp ${formatNumber(min)}+${isNegotiable ? ' (Negosiasi)' : ''}`;
  } else if (max) {
    return `Hingga Rp ${formatNumber(max)}${isNegotiable ? ' (Negosiasi)' : ''}`;
  }

  return isNegotiable ? "Negosiasi" : "Tidak disebutkan";
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("applicants");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchJobDetails() {
      setIsLoading(true);
      try {
        // First try the real API endpoint
        const apiUrl = `/api/employer/jobs/${jobId}`;
        console.log(`Fetching job details from API: ${apiUrl}`);
        
        try {
          const response = await fetch(apiUrl);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}):`, errorText);
            throw new Error(`Gagal mengambil detail lowongan: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Job data received from API:', data);
          setJob(data.job);
          
          // Set mock applicants data for now
          setApplicants(mockApplicants);
          return; // Exit early if successful
        } catch (apiError) {
          console.error('Error fetching from real API, falling back to mock:', apiError);
        }
        
        // If real API fails, try the mock API endpoint as fallback
        const mockApiUrl = `/api/mock/jobs/${jobId}`;
        console.log(`Fetching job details from mock API: ${mockApiUrl}`);
        
        const mockResponse = await fetch(mockApiUrl);
        
        if (!mockResponse.ok) {
          const errorText = await mockResponse.text();
          console.error(`Mock API error (${mockResponse.status}):`, errorText);
          throw new Error(`Gagal mengambil detail lowongan dari mock API: ${mockResponse.status}`);
        }
        
        const mockData = await mockResponse.json();
        console.log('Job data received from mock API:', mockData);
        setJob(mockData.job);
        
        // Set mock applicants data
        setApplicants(mockApplicants);
        
        // Set a notice that we're using mock data
        setError('Menggunakan data sementara untuk demo. API sebenarnya sedang dalam perbaikan.');
      } catch (error) {
        console.error('All API attempts failed:', error);
        
        // Last resort: use local mock data
        console.log('Using local mock data as last resort');
        setJob({
          ...mockJob,
          id: jobId // Use the actual jobId from the URL
        });
        setApplicants(mockApplicants);
        
        // Set error state to show in UI
        setError('Terjadi kesalahan saat mengambil data lowongan. Menggunakan data sementara.');
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Filter applicants based on search query and status filter
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === null || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditJob = () => {
    router.push(`/employer/job-posting/edit/${jobId}`);
  };

  const handleViewPublicJob = () => {
    if (job) {
      router.push(`/job-detail/${job.id}`);
    }
  };

  const handleUpdateApplicantStatus = (applicantId: string, newStatus: Applicant['status']) => {
    // In a real implementation, you would update the applicant status via an API call
    setApplicants(prevApplicants => 
      prevApplicants.map(app => 
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900">Memuat data lowongan</h3>
        <p className="mt-1 text-sm text-gray-500">Mohon tunggu sebentar...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Terjadi kesalahan</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Lowongan tidak ditemukan'}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/employer/jobs')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Lowongan
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto mr-2"
          onClick={() => router.push('/employer/jobs')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Kembali</span>
        </Button>
        <span className="mx-2">/</span>
        <Link href="/employer/jobs" className="hover:underline">Lowongan</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{job.jobTitle}</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{job.jobTitle}</h1>
            {getStatusBadge(job.isConfirmed)}
          </div>
          <p className="text-muted-foreground mt-1">
            {getContractTypeLabel(job.contractType)} • {job.numberOfPositions || 1} posisi • 
            Diposting pada {formatDate(job.postedDate)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPublicJob}
          >
            <Eye className="mr-2 h-4 w-4" />
            Lihat Posting
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleEditJob}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Lowongan
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <span>Lainnya</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                <span>Duplikasi Lowongan</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                <span>Arsipkan Lowongan</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue="applicants" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="applicants">
            <Users className="h-4 w-4 mr-2" />
            Pelamar ({applicants.length})
          </TabsTrigger>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Detail Lowongan
          </TabsTrigger>
        </TabsList>

        {/* Applicants Tab Content */}
        <TabsContent value="applicants" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pelamar</CardTitle>
                  <CardDescription>
                    Kelola pelamar untuk posisi {job.jobTitle}
                  </CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Input
                      placeholder="Cari pelamar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-[250px]"
                    />
                  </div>

                  <Select
                    value={statusFilter || "ALL"}
                    onValueChange={(value) => setStatusFilter(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Status</SelectItem>
                      <SelectItem value="SUBMITTED">Diajukan</SelectItem>
                      <SelectItem value="REVIEWING">Sedang Ditinjau</SelectItem>
                      <SelectItem value="INTERVIEW">Wawancara</SelectItem>
                      <SelectItem value="OFFERED">Ditawari</SelectItem>
                      <SelectItem value="ACCEPTED">Diterima</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                      <SelectItem value="WITHDRAWN">Dicabut</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredApplicants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Tidak ada pelamar ditemukan</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || statusFilter ? 
                      "Tidak ada pelamar yang cocok dengan filter Anda. Coba ubah filter pencarian." : 
                      "Belum ada pelamar untuk lowongan ini."}
                  </p>
                  {(searchQuery || statusFilter) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter(null);
                      }}
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplicants.map((applicant) => (
                    <div 
                      key={applicant.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{applicant.name}</h3>
                            {getApplicationStatusBadge(applicant.status)}
                            {applicant.matchScore && (
                              <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                                {applicant.matchScore}% Cocok
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{applicant.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Melamar pada {formatDate(applicant.applicationDate)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/employer/applicants/${applicant.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Button>
                          
                          {applicant.resumeUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(applicant.resumeUrl!, '_blank')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Unduh Resume
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <span>Ubah Status</span>
                                <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'REVIEWING')}>
                                <span>Sedang Ditinjau</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'INTERVIEW')}>
                                <span>Undang Wawancara</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'OFFERED')}>
                                <span>Tawarkan Posisi</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'ACCEPTED')}>
                                <span>Terima Pelamar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateApplicantStatus(applicant.id, 'REJECTED')}>
                                <span>Tolak Pelamar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Details Tab Content */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail Lowongan</CardTitle>
              <CardDescription>
                Informasi lengkap tentang lowongan yang Anda posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Jenis Kontrak</p>
                      <p className="text-muted-foreground">{getContractTypeLabel(job.contractType)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Jumlah Posisi</p>
                      <p className="text-muted-foreground">{job.numberOfPositions || 1} posisi</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Lokasi</p>
                      <p className="text-muted-foreground">Jakarta, Indonesia</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Batas Waktu Aplikasi</p>
                      <p className="text-muted-foreground">
                        {job.applicationDeadline ? formatDate(job.applicationDeadline) : 'Tidak ada batas waktu'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Jam Kerja</p>
                      <p className="text-muted-foreground">{job.workingHours || 'Tidak disebutkan'}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Gaji</p>
                      <p className="text-muted-foreground">
                        {formatSalary(
                          job.salaryRange?.min,
                          job.salaryRange?.max,
                          job.salaryRange?.isNegotiable
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              {job.description && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Deskripsi Pekerjaan</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Persyaratan</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Tanggung Jawab</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 