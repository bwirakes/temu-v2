"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  Users, 
  Download,
  ChevronDown,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Types
export interface Applicant {
  id: string;
  name: string;
  email: string;
  applicationDate: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl: string | null;
  coverLetter: string | null;
  matchScore?: number;
}

// Utility functions
export const getApplicationStatusBadge = (status: Applicant['status']) => {
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

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  } catch (e) {
    return dateString;
  }
};

interface ApplicantsTabProps {
  jobId: string;
  initialApplicants: Applicant[];
  jobTitle: string;
}

export function ApplicantsTab({ jobId, initialApplicants, jobTitle }: ApplicantsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Refresh applicants data when needed (manual refresh or after status updates)
  const refreshApplicants = async () => {
    setRefreshing(true);
    setIsFetching(true);
    try {
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applicants: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update applicants data
      if (data.applicants && Array.isArray(data.applicants)) {
        setApplicants(data.applicants);
      }
      
      setLastRefreshed(new Date());
      setError(null);
    } catch (error) {
      console.error('Error refreshing applicants:', error);
      setError('Terjadi kesalahan saat menyegarkan data');
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  };

  // Filter applicants based on search query and status filter
  const filteredApplicants = useMemo(() => {
    return applicants.filter(applicant => {
      const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === null || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applicants, searchQuery, statusFilter]);

  const handleUpdateApplicantStatus = async (applicantId: string, newStatus: Applicant['status']) => {
    try {
      // Set loading state for this specific applicant
      setUpdatingApplicationId(applicantId);
      
      // Show optimistic UI update
      setApplicants(prevApplicants => 
        prevApplicants.map(app => 
          app.id === applicantId ? { ...app, status: newStatus } : app
        )
      );
      
      // Make API call to update the status
      const response = await fetch(`/api/employer/applications/${applicantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        const errorData = await response.json();
        console.error('Error updating applicant status:', errorData);
        
        // Revert the optimistic update
        setApplicants(prevApplicants => 
          prevApplicants.map(app => 
            app.id === applicantId ? { ...app, status: app.status } : app
          )
        );
        
        // Show an error message
        alert(`Gagal memperbarui status: ${errorData.error}`);
        return;
      }
      
      // Status updated successfully
      const result = await response.json();
      console.log('Status updated successfully:', result);

      // Update the router/page to reflect the changes
      if (result.revalidated) {
        // Trigger a page refresh after a short delay to allow revalidation to complete
        setTimeout(() => {
          startTransition(() => {
            router.refresh();
          });
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error updating applicant status:', error);
      
      // Revert the optimistic update in case of error
      setApplicants(prevApplicants => 
        prevApplicants.map(app => 
          app.id === applicantId ? { ...app, status: app.status } : app
        )
      );
      
      // Show an error message
      alert('Terjadi kesalahan saat memperbarui status. Silakan coba lagi.');
    } finally {
      // Clear the loading state
      setUpdatingApplicationId(null);
    }
  };

  if (error) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[30vh]">
        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Terjadi kesalahan</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => refreshApplicants()}
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Daftar Pelamar</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={refreshApplicants}
                disabled={refreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span>Kelola pelamar untuk posisi {jobTitle}</span>
              {lastRefreshed && (
                <span className="text-xs text-muted-foreground">
                  Terakhir diperbarui: {format(lastRefreshed, 'HH:mm:ss', { locale: id })}
                </span>
              )}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={updatingApplicationId === applicant.id}
                        >
                          {updatingApplicationId === applicant.id ? (
                            <>
                              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              <span>Memperbarui...</span>
                            </>
                          ) : (
                            <>
                              <span>Ubah Status</span>
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleUpdateApplicantStatus(applicant.id, 'REVIEWING')}
                          disabled={applicant.status === 'REVIEWING' || updatingApplicationId === applicant.id}
                        >
                          <span>Sedang Ditinjau</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateApplicantStatus(applicant.id, 'INTERVIEW')}
                          disabled={applicant.status === 'INTERVIEW' || updatingApplicationId === applicant.id}
                        >
                          <span>Undang Wawancara</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateApplicantStatus(applicant.id, 'OFFERED')}
                          disabled={applicant.status === 'OFFERED' || updatingApplicationId === applicant.id}
                        >
                          <span>Tawarkan Posisi</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateApplicantStatus(applicant.id, 'ACCEPTED')}
                          disabled={applicant.status === 'ACCEPTED' || updatingApplicationId === applicant.id}
                        >
                          <span>Terima Pelamar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleUpdateApplicantStatus(applicant.id, 'REJECTED')}
                          disabled={applicant.status === 'REJECTED' || updatingApplicationId === applicant.id}
                        >
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
  );
} 