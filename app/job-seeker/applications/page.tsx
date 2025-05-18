"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Plus,
  Eye,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Define the application type based on our JobApplication model
interface Application {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  companyName: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  updatedAt: string;
  referenceCode?: string;
  education?: string;
  additionalNotes?: string;
  cvFileUrl?: string;
}

export default function JobApplicationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/job-seeker/applications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data.applications);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Gagal memuat data lamaran. Silakan coba lagi.');
        toast({
          title: "Gagal memuat data",
          description: "Terjadi kesalahan saat memuat data lamaran",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      // Filter by search term
      const matchesSearch = 
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.referenceCode && app.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by status
      const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "date") {
        return sortOrder === "asc" 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.jobTitle.localeCompare(b.jobTitle)
          : b.jobTitle.localeCompare(a.jobTitle);
      } else if (sortBy === "company") {
        return sortOrder === "asc"
          ? a.companyName.localeCompare(b.companyName)
          : b.companyName.localeCompare(a.companyName);
      }
      return 0;
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "REVIEWING":
        return "bg-yellow-100 text-yellow-800";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "OFFERED":
        return "bg-indigo-100 text-indigo-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get localized status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "Diajukan";
      case "REVIEWING":
        return "Sedang Ditinjau";
      case "INTERVIEW":
        return "Wawancara";
      case "OFFERED":
        return "Ditawari";
      case "ACCEPTED":
        return "Diterima";
      case "REJECTED":
        return "Ditolak";
      case "WITHDRAWN":
        return "Dicabut";
      default:
        return status;
    }
  };

  // Format date
  const formatApplicationDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (e) {
      return dateString;
    }
  };

  // View application details
  const viewApplicationDetails = (applicationId: string) => {
    router.push(`/job-seeker/applications/${applicationId}`);
  };

  return (
    <div className="max-w-[85rem] mx-auto space-y-6 px-4 sm:px-6 py-6 md:py-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lamaran Saya</h1>
        <p className="text-gray-500">Pantau dan kelola lamaran kerja Anda</p>
      </div>

      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Semua Lamaran
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total: {filteredApplications.length} lamaran
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari lamaran..."
                      className="pl-8 w-full md:w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="submitted">Diajukan</SelectItem>
                      <SelectItem value="reviewing">Sedang Ditinjau</SelectItem>
                      <SelectItem value="interview">Wawancara</SelectItem>
                      <SelectItem value="offered">Ditawari</SelectItem>
                      <SelectItem value="accepted">Diterima</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                      <SelectItem value="withdrawn">Dicabut</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="inline-flex gap-x-2">
                    <Link 
                      href="/job-seeker/jobs"
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Cari Lowongan
                    </Link>
                  </div>
                </div>
              </div>
              {/* End Header */}

              {/* Table and Mobile Cards */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Memuat data...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center h-64 px-4">
                  <div className="text-red-500 mb-2">
                    <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-center">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Coba Lagi
                  </Button>
                </div>
              ) : filteredApplications.length > 0 ? (
                <>
                  {/* Desktop Table - Hidden on mobile */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start">
                            <div className="flex items-center gap-x-2">
                              <span className="text-xs font-semibold uppercase text-gray-800">
                                Kode Referensi
                              </span>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-start">
                            <div 
                              className="flex items-center gap-x-2 cursor-pointer"
                              onClick={() => {
                                setSortBy("title");
                                toggleSortOrder();
                              }}
                            >
                              <span className="text-xs font-semibold uppercase text-gray-800">
                                Posisi
                              </span>
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-start">
                            <div 
                              className="flex items-center gap-x-2 cursor-pointer"
                              onClick={() => {
                                setSortBy("company");
                                toggleSortOrder();
                              }}
                            >
                              <span className="text-xs font-semibold uppercase text-gray-800">
                                Perusahaan
                              </span>
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-start">
                            <div className="flex items-center gap-x-2">
                              <span className="text-xs font-semibold uppercase text-gray-800">
                                Status
                              </span>
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-start">
                            <div 
                              className="flex items-center gap-x-2 cursor-pointer"
                              onClick={() => {
                                setSortBy("date");
                                toggleSortOrder();
                              }}
                            >
                              <span className="text-xs font-semibold uppercase text-gray-800">
                                Tanggal Melamar
                              </span>
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th scope="col" className="px-6 py-3 text-end"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredApplications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-4">
                              <span className="text-sm text-gray-800 font-medium">
                                {application.referenceCode || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-800 font-medium">
                                {application.jobTitle}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-800">
                                {application.companyName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getStatusBadgeClass(application.status)}>
                                {getStatusText(application.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-800">
                                {formatApplicationDate(application.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewApplicationDetails(application.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                              </Button>
                              {application.cvFileUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="ml-1"
                                >
                                  <a href={application.cvFileUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-4 w-4 mr-1" />
                                    CV
                                  </a>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards - Visible only on mobile */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <div 
                        key={application.id} 
                        className="p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                            <p className="text-sm text-gray-600">{application.companyName}</p>
                          </div>
                          <Badge className={getStatusBadgeClass(application.status)}>
                            {getStatusText(application.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="block text-xs text-gray-500">Kode Referensi</span>
                            <span>{application.referenceCode || '-'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500">Tanggal Melamar</span>
                            <span>{formatApplicationDate(application.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => viewApplicationDetails(application.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                          {application.cvFileUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex-1"
                            >
                              <a href={application.cvFileUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1" />
                                CV
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 px-4">
                  <div className="text-gray-400 mb-2">
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-center">Belum ada lamaran yang ditemukan</p>
                  <Link 
                    href="/job-seeker/jobs"
                    className="mt-4 py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Cari Lowongan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 