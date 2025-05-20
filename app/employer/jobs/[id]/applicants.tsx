"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  Users, 
  Download,
  ChevronDown,
  RefreshCcw,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  Loader2,
  Info
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { ApplicantDetailsDialog } from "./components";

// Types
export interface Applicant {
  id: string;
  name: string;
  email: string;
  applicationDate: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  resumeUrl: string | null;
  cvFileUrl: string | null;
  additionalNotes: string | null;
  statusChangeReason?: string | null;
  education?: "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | null;
  matchScore?: number;
  profileId?: string;
  
  // New fields 
  tanggalLahir?: string | null;
  umur?: number | null;
  jenisKelamin?: string | null; 
  kotaDomisili?: string | null;
  
  pendidikanFull?: Array<{
    jenjangPendidikan?: string | null;
    namaInstitusi?: string | null;
    bidangStudi?: string | null;
    tanggalLulus?: string | null;
  }> | null;
  
  pengalamanKerjaFull?: Array<{
    posisi?: string | null;
    namaPerusahaan?: string | null;
    tanggalMulai?: string | null;
    tanggalSelesai?: string | null;
    deskripsiPekerjaan?: string | null;
  }> | null;
  
  pengalamanKerjaTerakhir?: {
    posisi?: string | null;
    namaPerusahaan?: string | null;
  } | null;
  
  gajiTerakhir?: number | null;
  levelPengalaman?: string | null;
  
  ekspektasiGaji?: {
    min?: number;
    max?: number;
    negotiable?: boolean;
  } | null;
  
  preferensiLokasiKerja?: string[] | null;
  preferensiJenisPekerjaan?: string[] | null;
}

// Define application status options with labels
const applicationStatusOptions = [
  { value: "SUBMITTED", label: "Diajukan" },
  { value: "REVIEWING", label: "Sedang Ditinjau" },
  { value: "INTERVIEW", label: "Wawancara" },
  { value: "OFFERED", label: "Ditawari" },
  { value: "ACCEPTED", label: "Diterima" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "WITHDRAWN", label: "Dicabut" }
];

// Helper function to get the label for a status value
const getStatusLabel = (status: string) => {
  return applicationStatusOptions.find(option => option.value === status)?.label || status;
};

// Utility functions
export const getApplicationStatusBadge = (status: Applicant['status'], compact: boolean = false) => {
  // Common classes for both normal and compact badges
  let baseClasses = "";
  let label = "";
  
  switch (status) {
    case 'SUBMITTED':
      baseClasses = "bg-blue-100 text-blue-800";
      label = "Diajukan";
      break;
    case 'REVIEWING':
      baseClasses = "bg-yellow-100 text-yellow-800";
      label = "Sedang Ditinjau";
      break;
    case 'INTERVIEW':
      baseClasses = "bg-purple-100 text-purple-800";
      label = "Wawancara";
      break;
    case 'OFFERED':
      baseClasses = "bg-indigo-100 text-indigo-800";
      label = "Ditawari";
      break;
    case 'ACCEPTED':
      baseClasses = "bg-green-100 text-green-800";
      label = "Diterima";
      break;
    case 'REJECTED':
      baseClasses = "bg-red-100 text-red-800";
      label = "Ditolak";
      break;
    case 'WITHDRAWN':
      baseClasses = "bg-gray-100 text-gray-800";
      label = "Dicabut";
      break;
    default:
      baseClasses = "";
      label = status;
  }
  
  if (compact) {
    // For compact version, just return the status text with appropriate color
    return <span className={`text-xs font-medium ${baseClasses.replace('bg-', 'text-').replace('-100', '-800')}`}>{label}</span>;
  }
  
  // For normal version, return the full badge
  return <Badge className={baseClasses}>{label}</Badge>;
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
  const [statusFilter, setStatusFilter] = useState<Applicant['status'] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // State for reason dialog
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [statusChangeReasonText, setStatusChangeReasonText] = useState("");
  const [pendingApplicantUpdateInfo, setPendingApplicantUpdateInfo] = useState<{
    applicantId: string;
    newStatus: Applicant['status'];
    currentReason?: string | null;
  } | null>(null);

  // State for details dialog
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Define statuses that require a reason
  const DIALOG_STATUSES: Applicant['status'][] = ["REJECTED", "ACCEPTED", "WITHDRAWN"];

  // Sorting state
  type SortableApplicantKeys = keyof Pick<Applicant, 'name' | 'email' | 'applicationDate' | 'status' | 'education' | 'matchScore'>;
  const [sortColumn, setSortColumn] = useState<SortableApplicantKeys | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sorting handler function
  const handleSort = (column: SortableApplicantKeys) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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

  // Sort the filtered applicants based on sort column and direction
  const sortedApplicants = useMemo(() => {
    if (!sortColumn || !filteredApplicants) return filteredApplicants || []; // Handle null filteredApplicants

    return [...filteredApplicants].sort((a, b) => {
      // Ensure a and b are valid Applicant objects
      if (!a || !b) return 0;

      let valA = a[sortColumn as keyof Applicant];
      let valB = b[sortColumn as keyof Applicant];

      // Type-specific comparisons
      if (sortColumn === 'applicationDate') {
        valA = a.applicationDate ? new Date(a.applicationDate).getTime() : 0;
        valB = b.applicationDate ? new Date(b.applicationDate).getTime() : 0;
      } else if (sortColumn === 'matchScore') {
        valA = typeof a.matchScore === 'number' ? a.matchScore : -1;
        valB = typeof b.matchScore === 'number' ? b.matchScore : -1;
      } else if (sortColumn === 'education') {
        // Custom ordering for education levels
        const educationOrder = {
          "SD": 1, "SMP": 2, "SMA/SMK": 3, "D1": 4, "D2": 5, "D3": 6, "D4": 7, "S1": 8, "S2": 9, "S3": 10
        };
        valA = a.education ? educationOrder[a.education as keyof typeof educationOrder] || 0 : 0;
        valB = b.education ? educationOrder[b.education as keyof typeof educationOrder] || 0 : 0;
      } else if (sortColumn === 'status') {
        // Custom ordering for application statuses
        const statusOrder = {
          "SUBMITTED": 1, "REVIEWING": 2, "INTERVIEW": 3, "OFFERED": 4, "ACCEPTED": 5, "REJECTED": 6, "WITHDRAWN": 7
        };
        valA = statusOrder[a.status] || 0;
        valB = statusOrder[b.status] || 0;
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        // Case insensitive string comparison
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      // Null/undefined handling
      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      // Comparison logic
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredApplicants, sortColumn, sortDirection]);

  // Function to decide whether to show dialog or update immediately
  const promptForReasonOrUpdate = (applicantId: string, newStatus: Applicant['status']) => {
    const applicant = applicants.find(app => app.id === applicantId);
    
    if (!applicant) return;
    
    if (DIALOG_STATUSES.includes(newStatus)) {
      setPendingApplicantUpdateInfo({ 
        applicantId, 
        newStatus,
        currentReason: applicant.statusChangeReason 
      });
      setStatusChangeReasonText(applicant.statusChangeReason || "");
      setIsReasonDialogOpen(true);
    } else {
      handleUpdateApplicantStatus(applicantId, newStatus);
    }
  };

  // Handle submission from the reason dialog
  const handleSubmitWithReason = (reasonFromDialog: string) => {
    if (pendingApplicantUpdateInfo) {
      const { applicantId, newStatus } = pendingApplicantUpdateInfo;
      handleUpdateApplicantStatus(applicantId, newStatus, reasonFromDialog);
    }
  };

  // Update applicant status via API
  const handleUpdateApplicantStatus = async (
    applicantId: string, 
    newStatus: Applicant['status'],
    reason?: string
  ) => {
    const originalApplicants = [...applicants]; // For reverting optimistic update
    
    try {
      // Set loading state for this specific applicant
      setUpdatingApplicationId(applicantId);
      
      // Show optimistic UI update
      setApplicants(prevApplicants => 
        prevApplicants.map(app => 
          app.id === applicantId ? { 
            ...app, 
            status: newStatus,
            statusChangeReason: reason !== undefined ? reason : app.statusChangeReason
          } : app
        )
      );
      
      // Make API call to update the status
      const response = await fetch(`/api/employer/applications/${applicantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason 
        }),
      });
      
      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        const errorData = await response.json();
        console.error('Error updating applicant status:', errorData);
        
        // Revert the optimistic update
        setApplicants(originalApplicants);
        
        // Show an error message
        toast({
          title: "Gagal memperbarui status",
          description: errorData.error || "Terjadi kesalahan saat memperbarui status",
          variant: "destructive"
        });
        return;
      }
      
      // Status updated successfully
      const result = await response.json();
      console.log('Status updated successfully:', result);

      // Show success toast
      toast({
        title: "Status diperbarui",
        description: `Status pelamar berhasil diubah menjadi ${getStatusLabel(newStatus)}.`,
      });

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
      setApplicants(originalApplicants);
      
      // Show an error message
      toast({
        title: "Gagal memperbarui status",
        description: "Terjadi kesalahan saat memperbarui status. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      // Clear the loading state and dialog state
      setUpdatingApplicationId(null);
      setIsReasonDialogOpen(false);
      setPendingApplicantUpdateInfo(null);
    }
  };

  // Function to handle opening the details dialog
  const handleOpenDetailsDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsDetailsDialogOpen(true);
  };

  // Return the UI
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
    <>
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
                onValueChange={(value) => setStatusFilter(value === "ALL" ? null : value as Applicant['status'])}
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('name')} 
                      className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap w-[30%] p-2"
                    >
                      <div className="flex items-center">
                        <span className="text-xs font-medium">Nama Pelamar</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                        {sortColumn === 'name' && (
                          <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('applicationDate')} 
                      className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap w-[20%] p-2"
                    >
                      <div className="flex items-center">
                        <span className="text-xs font-medium">Tanggal Melamar</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                        {sortColumn === 'applicationDate' && (
                          <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('status')} 
                      className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap w-[15%] p-2"
                    >
                      <div className="flex items-center">
                        <span className="text-xs font-medium">Status</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                        {sortColumn === 'status' && (
                          <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('education')} 
                      className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap hidden md:table-cell w-[10%] p-2"
                    >
                      <div className="flex items-center">
                        <span className="text-xs font-medium">Pendidikan</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                        {sortColumn === 'education' && (
                          <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    {sortedApplicants.some(app => app.matchScore !== undefined) && (
                      <TableHead 
                        onClick={() => handleSort('matchScore')} 
                        className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap hidden md:table-cell w-[10%] p-2"
                      >
                        <div className="flex items-center">
                          <span className="text-xs font-medium">Skor Kecocokan</span>
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                          {sortColumn === 'matchScore' && (
                            <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </TableHead>
                    )}
                    {applicants.some(app => app.cvFileUrl) && (
                      <TableHead className="hidden md:table-cell w-[8%] text-center p-2">
                        <span className="text-xs font-medium">CV</span>
                      </TableHead>
                    )}
                    <TableHead className="text-right whitespace-nowrap w-[12%] p-2">
                      <span className="text-xs font-medium">Aksi</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium whitespace-nowrap max-w-[180px] truncate p-2">
                        {applicant.name}
                        {/* Display additional info badge if applicant has enhanced information */}
                        {(applicant.pengalamanKerjaFull || 
                          applicant.pendidikanFull || 
                          applicant.tanggalLahir || 
                          applicant.jenisKelamin || 
                          applicant.kotaDomisili ||
                          applicant.gajiTerakhir ||
                          applicant.levelPengalaman) && (
                          <Badge 
                            variant="outline" 
                            className="ml-2 bg-blue-50 text-blue-700 border-blue-200" 
                            title="Informasi tambahan tersedia"
                          >
                            <Info className="h-3 w-3" />
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">{formatDate(applicant.applicationDate)}</TableCell>
                      <TableCell className="p-2">{getApplicationStatusBadge(applicant.status)}</TableCell>
                      <TableCell className="hidden md:table-cell p-2">
                        {applicant.education ? (
                          <Badge variant="outline" className="text-xs">{applicant.education}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      {sortedApplicants.some(app => app.matchScore !== undefined) && (
                        <TableCell className="hidden md:table-cell p-2">
                          {applicant.matchScore !== undefined ? (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                              {applicant.matchScore}% Cocok
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                      )}
                      {applicants.some(app => app.cvFileUrl) && (
                        <TableCell className="hidden md:table-cell text-center p-2">
                          {applicant.cvFileUrl ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => window.open(applicant.cvFileUrl!, '_blank')}
                            >
                              <FileText className="h-3 w-3" />
                              <span className="sr-only">Lihat CV</span>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right whitespace-nowrap p-2"
                        style={{ minWidth: '100px' }}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          {/* View Details Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleOpenDetailsDialog(applicant)}
                            title="Lihat detail pelamar"
                          >
                            <Eye className="h-3 w-3" />
                            <span className="sr-only">Lihat Detail</span>
                          </Button>

                          {/* Ubah Status Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-1 text-xs"
                                disabled={updatingApplicationId === applicant.id}
                              >
                                {updatingApplicationId === applicant.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <span className="sm:inline hidden">Status</span>
                                    <ChevronDown className="h-3 w-3 sm:ml-1" />
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {applicationStatusOptions.map(statusOption => (
                                <DropdownMenuItem
                                  key={statusOption.value}
                                  disabled={applicant.status === statusOption.value || updatingApplicationId === applicant.id}
                                  onSelect={() => promptForReasonOrUpdate(applicant.id, statusOption.value as Applicant['status'])}
                                >
                                  {statusOption.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* More Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                                <span className="sr-only">Opsi Lain</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleOpenDetailsDialog(applicant)}>
                                <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => window.location.href = `mailto:${applicant.email}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg> 
                                {applicant.email}
                              </DropdownMenuItem>
                              {applicant.cvFileUrl && applicants.some(app => app.cvFileUrl) && !applicants.every(app => app.cvFileUrl) && (
                                <DropdownMenuItem onSelect={() => window.open(applicant.cvFileUrl!, '_blank')}>
                                  <FileText className="mr-2 h-4 w-4" /> Lihat CV
                                </DropdownMenuItem>
                              )}
                              {applicant.resumeUrl && (
                                <DropdownMenuItem onSelect={() => window.open(applicant.resumeUrl!, '_blank')}>
                                  <Download className="mr-2 h-4 w-4" /> Unduh Resume
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reason Dialog */}
      {pendingApplicantUpdateInfo && (
        <ReasonDialog
          isOpen={isReasonDialogOpen}
          onOpenChange={(open) => {
            setIsReasonDialogOpen(open);
            if (!open) setPendingApplicantUpdateInfo(null); // Clear pending info if dialog is closed manually
          }}
          onSubmit={handleSubmitWithReason}
          title={`Alasan untuk ${getStatusLabel(pendingApplicantUpdateInfo.newStatus)}`}
          description={`Silakan berikan alasan untuk perubahan status pelamar ${applicants.find(a => a.id === pendingApplicantUpdateInfo.applicantId)?.name || ''} (opsional).`}
          isLoading={updatingApplicationId === pendingApplicantUpdateInfo.applicantId}
          initialReason={pendingApplicantUpdateInfo.currentReason || ""}
        />
      )}

      {/* Applicant Details Dialog */}
      <ApplicantDetailsDialog 
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        applicant={selectedApplicant}
      />
    </>
  );
} 