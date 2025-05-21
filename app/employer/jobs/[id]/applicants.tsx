"use client";

import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
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
  Info,
  Filter
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
import useSWR from "swr";
// @ts-ignore
import { debounce } from "lodash";

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

// Helper function to get latest education display
export const getLatestEducationDisplay = (pendidikanFull: Applicant['pendidikanFull']): string => {
  if (!pendidikanFull?.length) return "N/A";
  
  const sortedEdu = [...pendidikanFull]
    .filter(edu => edu.tanggalLulus && edu.jenjangPendidikan)
    .sort((a, b) => {
      try {
        return new Date(b.tanggalLulus!).getTime() - new Date(a.tanggalLulus!).getTime();
      } catch { 
        return 0; // Handle invalid dates gracefully in sort
      }
    });
  
  return sortedEdu.length > 0 && sortedEdu[0].jenjangPendidikan ? sortedEdu[0].jenjangPendidikan : "N/A";
};

// Helper function to get the gender display
export const getGenderDisplay = (jenisKelamin: string | null | undefined): string => {
  if (!jenisKelamin) return "N/A";
  
  switch (jenisKelamin.toUpperCase()) {
    case "MALE":
      return "Laki-laki";
    case "FEMALE":
      return "Perempuan";
    default:
      return jenisKelamin;
  }
};

// Helper function to standardize experience level display
export const getStandardizedExperienceLevel = (levelPengalaman: string | null | undefined): string => {
  if (!levelPengalaman) return "N/A";
  
  // Standardize experience level categories
  switch(levelPengalaman.toUpperCase()) {
    case "ENTRY LEVEL":
    case "FRESH GRADUATE":
    case "JUNIOR":
    case "PEMULA":
    case "0-1 TAHUN":
    case "< 1 TAHUN":
      return "Entry Level (0-1 tahun)";
      
    case "MID LEVEL":
    case "INTERMEDIATE":
    case "MENENGAH":
    case "1-3 TAHUN":
    case "2-3 TAHUN":
      return "Mid Level (1-3 tahun)";
      
    case "SENIOR":
    case "EXPERT":
    case "AHLI":
    case "3-5 TAHUN":
    case "4-5 TAHUN":
      return "Senior (3-5 tahun)";
      
    case "LEAD":
    case "MANAGER":
    case "SUPERVISOR":
    case "5-10 TAHUN":
    case "> 5 TAHUN":
      return "Lead/Manager (5+ tahun)";
      
    case "DIRECTOR":
    case "VP":
    case "C-LEVEL":
    case "EXECUTIVE":
    case "> 10 TAHUN":
      return "Executive (10+ tahun)";
      
    default:
      return levelPengalaman;
  }
};

interface ApplicantsTabProps {
  jobId: string;
  initialApplicants: Applicant[];
  jobTitle: string;
  filterOptions?: {
    educations: string[];
    cities: string[];
    levelPengalaman: string[];
    gender: string[];
  };
  totalApplicants?: number;
  totalPages?: number;
}

// Define the SortableApplicantKeys type
type SortableApplicantKeys = keyof Pick<Applicant, 
  'name' | 
  'email' | 
  'applicationDate' | 
  'status' | 
  'education' | 
  'matchScore' | 
  'jenisKelamin' | 
  'umur' | 
  'kotaDomisili'
>;

// SWR fetcher function with proper error type
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as Error & {
      info?: any;
      status?: number;
    };
    // Attach extra info to the error object
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// Create a reusable Pagination component
const Pagination = ({ 
  currentPage, 
  totalPages, 
  hasPrevPage, 
  hasNextPage, 
  isLoading,
  isValidating, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  hasPrevPage: boolean; 
  hasNextPage: boolean; 
  isLoading: boolean;
  isValidating: boolean;
  onPageChange: (page: number) => void;
}) => {
  const isDisabled = isLoading || isValidating;
  
  return (
    <div className="flex justify-center my-4 px-1">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1 || isDisabled}
          className="h-8 px-2 text-xs"
        >
          <span className="hidden sm:inline mr-1">First</span>
          <span className="sm:hidden">«</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={!hasPrevPage || isDisabled}
          className="h-8 px-2 text-xs"
        >
          <span className="hidden sm:inline mr-1">Prev</span>
          <span className="sm:hidden">‹</span>
        </Button>
        
        <div className="flex items-center px-2">
          <span className="text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Page </span>
            {currentPage} <span className="hidden sm:inline">of</span><span className="sm:hidden">/</span> {totalPages}
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={!hasNextPage || isDisabled}
          className="h-8 px-2 text-xs"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <span className="sm:hidden">›</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages || isDisabled}
          className="h-8 px-2 text-xs"
        >
          <span className="hidden sm:inline mr-1">Last</span>
          <span className="sm:hidden">»</span>
        </Button>
      </div>
    </div>
  );
};

export function ApplicantsTab({ 
  jobId, 
  initialApplicants, 
  jobTitle,
  filterOptions,
  totalApplicants: initialTotalApplicants,
  totalPages: initialTotalPages
}: ApplicantsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Applicant['status'] | null>(null);
  const [educationFilter, setEducationFilter] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [ageMinFilter, setAgeMinFilter] = useState<number | string>("");
  const [ageMaxFilter, setAgeMaxFilter] = useState<number | string>("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [levelPengalamanFilter, setLevelPengalamanFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20; // Items per page
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortableApplicantKeys | null>("applicationDate");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Status update states
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [statusChangeReasonText, setStatusChangeReasonText] = useState("");
  const [pendingApplicantUpdateInfo, setPendingApplicantUpdateInfo] = useState<{
    applicantId: string;
    newStatus: Applicant['status'];
    currentReason?: string | null;
  } | null>(null);
  
  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  // Define statuses that require a reason
  const DIALOG_STATUSES: Applicant['status'][] = ["REJECTED", "ACCEPTED", "WITHDRAWN"];
  
  // Construct the SWR key for fetching applicants
  const getApplicantsUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
    });
    
    if (searchQuery) params.append('searchQuery', searchQuery);
    if (statusFilter) params.append('status', statusFilter);
    if (educationFilter) params.append('education', educationFilter);
    if (genderFilter) params.append('gender', genderFilter);
    if (ageMinFilter) params.append('ageMin', ageMinFilter.toString());
    if (ageMaxFilter) params.append('ageMax', ageMaxFilter.toString());
    if (cityFilter) params.append('city', cityFilter);
    if (levelPengalamanFilter) params.append('levelPengalaman', levelPengalamanFilter);
    if (sortColumn) params.append('sortBy', sortColumn);
    if (sortDirection) params.append('sortOrder', sortDirection);
    
    return `/api/employer/jobs/${jobId}/applicants?${params.toString()}`;
  }, [
    jobId, 
    currentPage, 
    limit, 
    searchQuery, 
    statusFilter, 
    educationFilter, 
    genderFilter, 
    ageMinFilter, 
    ageMaxFilter, 
    cityFilter, 
    levelPengalamanFilter, 
    sortColumn, 
    sortDirection
  ]);
  
  // Set up the initial fallback data for SWR
  const fallbackData = useMemo(() => {
    return {
      applicants: initialApplicants,
      totalApplicants: initialTotalApplicants || initialApplicants.length,
      currentPage: 1,
      totalPages: initialTotalPages || 1,
      limit,
      hasNextPage: (initialTotalPages || 1) > 1,
      hasPrevPage: false,
      filterOptions: filterOptions || {
        educations: [],
        cities: [],
        levelPengalaman: [],
        gender: ["MALE", "FEMALE"]
      }
    };
  }, [initialApplicants, initialTotalApplicants, initialTotalPages, filterOptions, limit]);
  
  // Fetch data with SWR
  const { 
    data: apiResponse, 
    error: swrError, 
    isLoading, 
    isValidating,
    mutate
  } = useSWR(getApplicantsUrl(), fetcher, {
    fallbackData,
    keepPreviousData: true,
    revalidateOnFocus: true,
    dedupingInterval: 5000, // Dedupe identical requests for 5 seconds
  });
  
  // Extract data from the API response
  const applicants = apiResponse?.applicants || [];
  const totalApplicants = apiResponse?.totalApplicants || 0;
  const totalPages = apiResponse?.totalPages || 1;
  const hasNextPage = apiResponse?.hasNextPage || false;
  const hasPrevPage = apiResponse?.hasPrevPage || false;
  const availableFilterOptions = apiResponse?.filterOptions || fallbackData.filterOptions;
  
  // Debounce the search input to avoid too many API requests
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1); // Reset to first page on new search
    }, 500),
    []
  );
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || 
    statusFilter || 
    educationFilter || 
    genderFilter || 
    ageMinFilter || 
    ageMaxFilter || 
    cityFilter || 
    levelPengalamanFilter;
  
  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setEducationFilter(null);
    setGenderFilter(null);
    setAgeMinFilter("");
    setAgeMaxFilter("");
    setCityFilter(null);
    setLevelPengalamanFilter(null);
    setCurrentPage(1);
    
    // Also reset the search input element
    const searchInput = document.querySelector('input[placeholder*="Cari"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
    }
  };
  
  // Sorting handler function
  const handleSort = (column: SortableApplicantKeys) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };
  
  // Manual refresh function (mostly for after status updates)
  const refreshApplicants = async () => {
    setRefreshing(true);
    try {
      await mutate(); // Use SWR's mutate to refresh data
      setLastRefreshed(new Date());
      setError(null);
    } catch (error) {
      console.error('Error refreshing applicants:', error);
      setError('Terjadi kesalahan saat menyegarkan data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      // Show loading indicator
      if (!isValidating) {
        setIsFetching(true);
      }
      
      // Set the new page
      setCurrentPage(newPage);
      
      // Scroll to top of table or component when changing pages
      setTimeout(() => {
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
          tableContainer.scrollTop = 0;
        } else {
          // Fallback to scrolling the card into view
          const card = document.querySelector('.card-applicants');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        setIsFetching(false);
      }, 100);
    }
  };

  // Function to decide whether to show dialog or update immediately
  const promptForReasonOrUpdate = (applicantId: string, newStatus: Applicant['status']) => {
    const applicant = applicants.find((app: Applicant) => app.id === applicantId);
    
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
      
      // Use optimistic update with SWR
      await mutate(
        async (currentData: { applicants: Applicant[] } & Record<string, any>) => {
          // Create a new applicants array with the updated status
          const updatedApplicants = currentData.applicants.map((app: Applicant) => 
            app.id === applicantId ? { 
              ...app, 
              status: newStatus,
              statusChangeReason: reason !== undefined ? reason : app.statusChangeReason
            } : app
          );
          
          // Return the updated data structure
          return {
            ...currentData,
            applicants: updatedApplicants
          };
        },
        false // Don't revalidate yet
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
        
        // Revert the optimistic update by forcing a revalidation
        await mutate();
        
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
      
      // Revalidate the data to ensure we have the latest
      await mutate();
      
    } catch (error) {
      console.error('Error updating applicant status:', error);
      
      // Revalidate to ensure we have the correct data
      await mutate();
      
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

  // Return the UI for error state
  if (error || swrError) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[30vh]">
        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Terjadi kesalahan</h3>
        <p className="mt-1 text-sm text-gray-500">{error || "Gagal memuat data pelamar"}</p>
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
      <Card className="card-applicants">
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
                  onChange={handleSearchChange}
                  className="w-full sm:w-[250px]"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                    {(statusFilter ? 1 : 0) + 
                     (educationFilter ? 1 : 0) + 
                     (genderFilter ? 1 : 0) + 
                     (ageMinFilter ? 1 : 0) + 
                     (ageMaxFilter ? 1 : 0) + 
                     (cityFilter ? 1 : 0) + 
                     (levelPengalamanFilter ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Advanced Filter Section */}
          {showFilters && (
            <div className="mt-4 space-y-4 border rounded-md p-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Filter Lanjutan</h3>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetAllFilters}
                  >
                    Reset Semua
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Status Filter */}
                <div>
                  <p className="text-xs mb-1 font-medium">Status</p>
                  <Select
                    value={statusFilter || "ALL"}
                    onValueChange={(value) => setStatusFilter(value === "ALL" ? null : value as Applicant['status'])}
                  >
                    <SelectTrigger className="w-full">
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

                {/* Education Filter */}
                <div>
                  <p className="text-xs mb-1 font-medium">Pendidikan</p>
                  <Select
                    value={educationFilter || "ALL"}
                    onValueChange={(value) => setEducationFilter(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Pendidikan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Pendidikan</SelectItem>
                      {availableFilterOptions.educations.map((edu: string) => (
                        <SelectItem key={edu} value={edu}>{edu}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Filter */}
                <div>
                  <p className="text-xs mb-1 font-medium">Jenis Kelamin</p>
                  <Select
                    value={genderFilter || "ALL"}
                    onValueChange={(value) => setGenderFilter(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Jenis Kelamin</SelectItem>
                      {availableFilterOptions.gender.map((g: string) => (
                        <SelectItem key={g} value={g}>{g === "MALE" ? "Laki-laki" : "Perempuan"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Filter */}
                <div>
                  <p className="text-xs mb-1 font-medium">Umur</p>
                  <div className="flex space-x-2">
                    <div>
                      <label htmlFor="age-min" className="sr-only">Umur Minimal</label>
                      <Input
                        id="age-min"
                        type="number"
                        placeholder="Min"
                        value={ageMinFilter}
                        onChange={(e) => setAgeMinFilter(e.target.value)}
                        className="w-20"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label htmlFor="age-max" className="sr-only">Umur Maksimal</label>
                      <Input
                        id="age-max"
                        type="number"
                        placeholder="Max"
                        value={ageMaxFilter}
                        onChange={(e) => setAgeMaxFilter(e.target.value)}
                        className="w-20"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* City Filter */}
                <div>
                  <p className="text-xs mb-1 font-medium">Kota Domisili</p>
                  <Select
                    value={cityFilter || "ALL"}
                    onValueChange={(value) => setCityFilter(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Kota" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Kota</SelectItem>
                      {availableFilterOptions.cities.map((city: string) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Pengalaman Filter */}
                <div>
                  <p className="text-xs mb-1 font-medium">Level Pengalaman</p>
                  <Select
                    value={levelPengalamanFilter || "ALL"}
                    onValueChange={(value) => setLevelPengalamanFilter(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Level</SelectItem>
                      {availableFilterOptions.levelPengalaman.map((level: string) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-semibold">Pelamar</h3>
              <Badge variant="outline" className="rounded-full">
                {isLoading || isValidating ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <>
                    Menampilkan {totalApplicants > 0 
                      ? `${Math.min((currentPage - 1) * limit + 1, totalApplicants)}-${Math.min(currentPage * limit, totalApplicants)} dari ${totalApplicants}`
                      : '0'} pelamar
                  </>
                )}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={isFetching ? "secondary" : "outline"} 
                className="text-xs font-normal"
              >
                {isFetching ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Refreshing
                  </span>
                ) : (
                  <>
                    Page {currentPage} of {totalPages || 1}
                  </>
                )}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={refreshApplicants}
                disabled={refreshing || isLoading || isValidating}
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
          
          {/* ... existing filter section ... */}

          {/* Pagination Controls (Top) */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              isLoading={isLoading}
              isValidating={isValidating}
              onPageChange={handlePageChange}
            />
          )}

          {/* Table container */}
          <div className="border rounded-md relative">
            {(isLoading || isValidating || isFetching) && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              </div>
            )}
            <Table className="table-container">
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
                      {statusFilter && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          •
                        </Badge>
                      )}
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
                      {educationFilter && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          •
                        </Badge>
                      )}
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                      {sortColumn === 'education' && (
                        <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('jenisKelamin')} 
                    className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap hidden lg:table-cell w-[10%] p-2"
                  >
                    <div className="flex items-center">
                      <span className="text-xs font-medium">Jenis Kelamin</span>
                      {genderFilter && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          •
                        </Badge>
                      )}
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                      {sortColumn === 'jenisKelamin' && (
                        <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('umur')} 
                    className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap hidden md:table-cell w-[8%] p-2"
                  >
                    <div className="flex items-center">
                      <span className="text-xs font-medium">Umur</span>
                      {(ageMinFilter || ageMaxFilter) && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          •
                        </Badge>
                      )}
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                      {sortColumn === 'umur' && (
                        <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('kotaDomisili')} 
                    className="cursor-pointer hover:bg-muted transition-colors whitespace-nowrap hidden xl:table-cell w-[12%] p-2"
                  >
                    <div className="flex items-center">
                      <span className="text-xs font-medium">Kota</span>
                      {cityFilter && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          •
                        </Badge>
                      )}
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                      {sortColumn === 'kotaDomisili' && (
                        <span className="ml-1 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell px-2 py-3 w-[10%]">
                    <div className="flex items-center">
                      <span className="text-xs font-medium">Level Peng.</span>
                      {levelPengalamanFilter && (
                        <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                          •
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                  {applicants.some((app: Applicant) => app.matchScore !== undefined) && (
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
                  {applicants.some((app: Applicant) => app.cvFileUrl) && (
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
                {applicants.length > 0 ? (
                  applicants.map((applicant: Applicant) => (
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
                        <TableCell className="hidden lg:table-cell p-2 text-xs">
                          {getGenderDisplay(applicant.jenisKelamin)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell p-2 text-xs">
                          {applicant.umur || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell p-2 text-xs">
                          {applicant.kotaDomisili || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell p-2 text-xs">
                          {getStandardizedExperienceLevel(applicant.levelPengalaman)}
                        </TableCell>
                        {applicants.some((app: Applicant) => app.matchScore !== undefined) && (
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
                        {applicants.some((app: Applicant) => app.cvFileUrl) && (
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
                                {applicant.cvFileUrl && applicants.some((app: Applicant) => app.cvFileUrl) && !applicants.every((app: Applicant) => app.cvFileUrl) && (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                          <p className="text-lg font-medium">Tidak ada pelamar</p>
                          <p className="text-sm text-muted-foreground">
                            {hasActiveFilters 
                              ? 'Tidak ada pelamar yang cocok dengan filter yang dipilih' 
                              : 'Belum ada pelamar untuk lowongan ini'}
                          </p>
                          {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={resetAllFilters} className="mt-2">
                              <Filter className="mr-2 h-4 w-4" />
                              Reset Filter
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls (Bottom) */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasPrevPage={hasPrevPage}
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                isValidating={isValidating}
                onPageChange={handlePageChange}
              />
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
          description={`Silakan berikan alasan untuk perubahan status pelamar ${applicants.find((a: Applicant) => a.id === pendingApplicantUpdateInfo.applicantId)?.name || ''} (opsional).`}
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