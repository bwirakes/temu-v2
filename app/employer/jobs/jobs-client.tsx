"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Plus, 
  Search,
  Users,
  Clock,
  Briefcase,
  FileText
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
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
  } | null;
  minWorkExperience: number;
  applicationDeadline: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  description: string | null;
  postedDate: string;
  numberOfPositions: number | null;
  workingHours: string | null;
  isConfirmed: boolean;
  applicationCount: number;
}

interface JobsClientWrapperProps {
  jobs: Job[];
}

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

export function JobsClientWrapper({ jobs }: JobsClientWrapperProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null);
  
  // Define formatDate function within the client component
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (e) {
      return dateString;
    }
  };
  
  // Filter jobs based on search query and selected status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === null || job.isConfirmed === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEditJob = (jobId: string) => {
    router.push(`/employer/job-posting/edit/${jobId}`);
  };

  return (
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
                    Menampilkan {filteredJobs.length} dari {jobs.length} lowongan
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
                          {selectedStatus !== null ? (
                            <>
                              Status: {selectedStatus ? 'Aktif' : 'Draft'}
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
                        <DropdownMenuItem onClick={() => setSelectedStatus(true)}>
                          Aktif
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedStatus(false)}>
                          Draft
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

              {/* Job Cards Grid */}
              {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredJobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      onClick={() => router.push(`/employer/jobs/${job.id}`)}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.jobTitle}</h3>
                            <p className="text-sm text-gray-600 mt-1">{getContractTypeLabel(job.contractType)}</p>
                          </div>
                          <div>
                            {getStatusBadge(job.isConfirmed)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 my-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{job.numberOfPositions || 1} posisi</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{job.applicationCount} pelamar</span>
                          </div>
                          <div className="flex items-center col-span-2">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">Diposting: {formatDate(job.postedDate)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                          <Link 
                            href={`/employer/jobs/${job.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Lihat Pelamar
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link 
                                  href={`/job-detail/${job.id}`} 
                                  className="flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Lihat Posting</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditJob(job.id);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Posting</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 px-4 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Tidak ada lowongan ditemukan</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || selectedStatus !== null ? 
                      "Tidak ada lowongan yang cocok dengan filter Anda. Coba ubah filter pencarian." : 
                      "Anda belum membuat lowongan pekerjaan. Klik tombol 'Tambah Lowongan' untuk mulai."}
                  </p>
                  {(searchQuery || selectedStatus !== null) && (
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

              {/* Pagination - Only show if we have data and it's paginated */}
              {filteredJobs.length > 0 && (
                <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">
                      Menampilkan <span className="font-semibold text-gray-800">1-{filteredJobs.length}</span> dari <span className="font-semibold text-gray-800">{filteredJobs.length}</span> hasil
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 