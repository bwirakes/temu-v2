"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Plus, 
  Search,
  MapPin,
  Users,
  Clock,
  Briefcase,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data for job listings
interface JobListing {
  id: string;
  title: string;
  positions: number;
  locations: string[];
  contractType: string;
  createdAt: string;
  status: "active" | "draft" | "expired" | "closed";
}

const jobListings: JobListing[] = [
  {
    id: "JOB-2023-001",
    title: "Senior Frontend Developer",
    positions: 2,
    locations: ["Jakarta (Remote)", "Bandung"],
    contractType: "FULL_TIME",
    createdAt: "2023-10-15",
    status: "active"
  },
  {
    id: "JOB-2023-002",
    title: "UI/UX Designer",
    positions: 1,
    locations: ["Jakarta"],
    contractType: "FULL_TIME",
    createdAt: "2023-10-20",
    status: "active"
  },
  {
    id: "JOB-2023-003",
    title: "Backend Developer",
    positions: 3,
    locations: ["Surabaya", "Remote"],
    contractType: "CONTRACT",
    createdAt: "2023-11-05",
    status: "active"
  },
  {
    id: "JOB-2023-004",
    title: "Data Analyst",
    positions: 2,
    locations: ["Jakarta"],
    contractType: "FULL_TIME",
    createdAt: "2023-11-10",
    status: "draft"
  },
  {
    id: "JOB-2023-005",
    title: "DevOps Engineer",
    positions: 1,
    locations: ["Bandung"],
    contractType: "FULL_TIME",
    createdAt: "2023-11-15",
    status: "active"
  },
  {
    id: "JOB-2023-006",
    title: "Content Writer",
    positions: 2,
    locations: ["Remote"],
    contractType: "PART_TIME",
    createdAt: "2023-11-20",
    status: "expired"
  }
];

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktif</Badge>;
    case "draft":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
    case "expired":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Kedaluwarsa</Badge>;
    case "closed":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Ditutup</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [isLoadingEmployerId, setIsLoadingEmployerId] = useState(true);
  
  useEffect(() => {
    async function fetchEmployerId() {
      try {
        const response = await fetch('/api/employer/get-id');
        if (response.ok) {
          const data = await response.json();
          setEmployerId(data.employerId);
        }
      } catch (error) {
        console.error('Error fetching employer ID:', error);
      } finally {
        setIsLoadingEmployerId(false);
      }
    }

    fetchEmployerId();
  }, []);
  
  // Filter jobs based on search query and selected status
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === null || job.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEditJob = (jobId: string) => {
    router.push(`/employer/job-posting/edit/${jobId}`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lowongan Pekerjaan</h1>
            <p className="text-muted-foreground">
              Kelola semua lowongan pekerjaan yang telah Anda posting
            </p>
          </div>
          
          {employerId && (
            <Link 
              href={`/careers/${employerId}`}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Globe className="mr-2 h-4 w-4" />
              Lihat Halaman Karir Publik
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="bg-white border border-blue-100 rounded-xl shadow-md overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10"></div>
                
                {/* Header with filters */}
                <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                      Daftar Lowongan
                    </h2>
                    <p className="text-sm text-gray-600">
                      Menampilkan {filteredJobs.length} dari {jobListings.length} lowongan
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Cari lowongan..."
                        className="pl-9 w-full sm:w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-10">
                            {selectedStatus ? (
                              <>
                                Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                              </>
                            ) : (
                              <>Semua Status</>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedStatus(null)}>
                            Semua Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedStatus("active")}>
                            Aktif
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedStatus("draft")}>
                            Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedStatus("expired")}>
                            Kedaluwarsa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedStatus("closed")}>
                            Ditutup
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Link href="/employer/job-posting">
                        <Button className="h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                          <Plus className="mr-2 h-4 w-4" /> Tambah Lowongan
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Mobile Table View */}
                <div className="block md:hidden">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="border-b border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="text-xs text-gray-500">{job.id}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/job-application?id=${job.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Lihat Posting</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditJob(job.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Posting</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          <span>{job.positions} posisi</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          <span>{job.locations.join(", ")}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          <span>{getContractTypeLabel(job.contractType)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          <span>Dibuat: {job.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Job ID
                          </span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Jenis Pekerjaan
                          </span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Jumlah Yang Dicari
                          </span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Lokasi
                          </span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Status
                          </span>
                        </th>
                        <th scope="col" className="px-6 py-3 text-end">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Aksi
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {job.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                <div className="text-sm text-gray-500">{getContractTypeLabel(job.contractType)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{job.positions} posisi</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{job.locations.join(", ")}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(job.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/job-application?id=${job.id}`} className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Lihat Posting</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditJob(job.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Posting</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredJobs.length === 0 && (
                  <div className="py-10 px-4 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      <Briefcase className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Tidak ada lowongan ditemukan</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery || selectedStatus ? 
                        "Tidak ada lowongan yang cocok dengan filter Anda. Coba ubah filter pencarian." : 
                        "Anda belum membuat lowongan pekerjaan. Klik tombol 'Tambah Lowongan' untuk mulai."}
                    </p>
                    {(searchQuery || selectedStatus) && (
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedStatus(null);
                          }}
                        >
                          Reset Filter
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {filteredJobs.length > 0 && (
                  <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">
                        Menampilkan <span className="font-semibold text-gray-800">1-{filteredJobs.length}</span> dari <span className="font-semibold text-gray-800">{filteredJobs.length}</span> hasil
                      </p>
                    </div>

                    <div>
                      <div className="inline-flex gap-x-2">
                        <Button variant="outline" size="sm" disabled>
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                          </svg>
                          Sebelumnya
                        </Button>

                        <Button variant="outline" size="sm" disabled>
                          Selanjutnya
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
