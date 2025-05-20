'use client';

import React from 'react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Eye, 
  ArrowUpDown,
  XCircle
} from 'lucide-react';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApplicantRow, ApplicationStatus } from '../types';

interface AllApplicantsClientProps {
  initialApplicants: ApplicantRow[];
}

export default function AllApplicantsClient({ initialApplicants }: AllApplicantsClientProps) {
  const router = useRouter();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [jobFilter, setJobFilter] = useState<string | 'all'>('all');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ApplicantRow | null;
    direction: 'asc' | 'desc';
  }>({
    key: 'applicationDate',
    direction: 'desc',
  });

  // Extract unique job titles and their IDs for the filter dropdown
  const uniqueJobTitles = useMemo(() => {
    const uniqueJobs = new Map<string, { id: string; title: string | null }>();
    
    initialApplicants.forEach(applicant => {
      if (applicant.jobId && applicant.jobTitle && !uniqueJobs.has(applicant.jobId)) {
        uniqueJobs.set(applicant.jobId, {
          id: applicant.jobId,
          title: applicant.jobTitle
        });
      }
    });
    
    return Array.from(uniqueJobs.values());
  }, [initialApplicants]);

  // Filter applicants based on search term, status, and job
  const filteredApplicants = useMemo(() => {
    return initialApplicants.filter(applicant => {
      // Search term filter (case insensitive)
      const matchesSearch = 
        searchTerm === '' || 
        (applicant.applicantName && applicant.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (applicant.applicantEmail && applicant.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (applicant.jobTitle && applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      
      // Job filter
      const matchesJob = jobFilter === 'all' || applicant.jobId === jobFilter;
      
      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [initialApplicants, searchTerm, statusFilter, jobFilter]);

  // Sort the filtered applicants
  const sortedApplicants = useMemo(() => {
    const sortableApplicants = [...filteredApplicants];
    
    if (sortConfig.key) {
      sortableApplicants.sort((a, b) => {
        // Handle null values
        if (a[sortConfig.key!] === null && b[sortConfig.key!] === null) return 0;
        if (a[sortConfig.key!] === null) return 1;
        if (b[sortConfig.key!] === null) return -1;
        
        let comparison = 0;
        
        // Special handling for date strings
        if (sortConfig.key === 'applicationDate') {
          const dateA = new Date(a.applicationDate).getTime();
          const dateB = new Date(b.applicationDate).getTime();
          comparison = dateA - dateB;
        } 
        // Special handling for status (custom order)
        else if (sortConfig.key === 'status') {
          const statusOrder = {
            'SUBMITTED': 0,
            'REVIEWING': 1,
            'INTERVIEW': 2,
            'OFFERED': 3,
            'ACCEPTED': 4,
            'REJECTED': 5,
            'WITHDRAWN': 6,
          };
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        }
        // Standard string comparison
        else if (typeof a[sortConfig.key!] === 'string' && typeof b[sortConfig.key!] === 'string') {
          comparison = (a[sortConfig.key!] as string).localeCompare(b[sortConfig.key!] as string);
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    
    return sortableApplicants;
  }, [filteredApplicants, sortConfig]);

  // Handle sorting when a column header is clicked
  const handleSort = (key: keyof ApplicantRow) => {
    setSortConfig(prevConfig => ({
      key,
      direction: 
        prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
    }));
  };

  // Format date for display
  const formatDate = (isoDateString: string): string => {
    return format(new Date(isoDateString), 'dd MMMM yyyy');
  };

  // Render status badge based on application status
  const getStatusBadge = (status: ApplicationStatus): React.ReactNode => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diajukan</Badge>;
      case 'REVIEWING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Dalam Review</Badge>;
      case 'INTERVIEW':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Wawancara</Badge>;
      case 'OFFERED':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Ditawari</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Diterima</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Dicabut</Badge>;
      default:
        return <Badge variant="outline">Tidak Diketahui</Badge>;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setJobFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || jobFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Cari nama, email, atau lowongan..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="SUBMITTED">Diajukan</SelectItem>
              <SelectItem value="REVIEWING">Dalam Review</SelectItem>
              <SelectItem value="INTERVIEW">Wawancara</SelectItem>
              <SelectItem value="OFFERED">Ditawari</SelectItem>
              <SelectItem value="ACCEPTED">Diterima</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
              <SelectItem value="WITHDRAWN">Dicabut</SelectItem>
            </SelectContent>
          </Select>

          {/* Job Filter */}
          <Select
            value={jobFilter}
            onValueChange={(value) => setJobFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter berdasarkan lowongan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lowongan</SelectItem>
              {uniqueJobTitles.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            className="flex items-center gap-1 mt-2 md:mt-0"
            onClick={resetFilters}
          >
            <XCircle className="h-4 w-4" />
            Hapus Filter
          </Button>
        )}
      </div>

      {/* Results count and info */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium">{sortedApplicants.length}</span> {sortedApplicants.length === 1 ? 'pelamar' : 'pelamar'}
          {hasActiveFilters && ' (difilter)'}
        </p>
      </div>

      {/* Applicants Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('applicantName')}
              >
                <div className="flex items-center gap-1">
                  Nama Pelamar
                  {sortConfig.key === 'applicantName' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('jobTitle')}
              >
                <div className="flex items-center gap-1">
                  Melamar untuk Posisi
                  {sortConfig.key === 'jobTitle' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('applicationDate')}
              >
                <div className="flex items-center gap-1">
                  Tanggal Lamaran
                  {sortConfig.key === 'applicationDate' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortConfig.key === 'status' ? (
                    sortConfig.direction === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Tidak ada pelamar yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              sortedApplicants.map((applicant) => (
                <TableRow key={applicant.applicationId}>
                  <TableCell>
                    <Link 
                      href={`/employer/applicants/${applicant.applicationId}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {applicant.applicantName || 'Pelamar Tanpa Nama'}
                    </Link>
                  </TableCell>
                  <TableCell>{applicant.applicantEmail || 'Tidak ada email'}</TableCell>
                  <TableCell>{applicant.jobTitle || 'Lowongan Tidak Diketahui'}</TableCell>
                  <TableCell>{formatDate(applicant.applicationDate)}</TableCell>
                  <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/employer/applicants/${applicant.applicationId}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
