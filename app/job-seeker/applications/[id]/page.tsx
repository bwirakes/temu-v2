"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
  ArrowLeft, 
  Briefcase, 
  Building, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Loader2, 
  MessageSquare,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ApplicationDetails {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  companyName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  referenceCode?: string;
  education?: string;
  additionalNotes?: string;
  cvFileUrl?: string;
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/job-seeker/applications/${applicationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch application details');
        }

        const data = await response.json();
        setApplication(data.application);
        setError(null);
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError('Gagal memuat data lamaran. Silakan coba lagi.');
        toast({
          title: "Gagal memuat data",
          description: "Terjadi kesalahan saat memuat detail lamaran",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId]);

  // Copy reference code to clipboard
  const copyReferenceCode = () => {
    if (application?.referenceCode) {
      navigator.clipboard.writeText(application.referenceCode);
      setCopied(true);
      toast({
        title: "Kode referensi disalin",
        description: "Kode referensi telah disalin ke clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format date
  const formatApplicationDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: idLocale });
    } catch (e) {
      return dateString;
    }
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

  // Get education level text
  const getEducationText = (education?: string) => {
    if (!education) return "Tidak disebutkan";
    return education;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Memuat detail lamaran...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Gagal memuat data</h2>
        <p className="text-gray-600 mb-6">{error || "Data lamaran tidak ditemukan"}</p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.refresh()}
          >
            Coba Lagi
          </Button>
          <Button asChild>
            <Link href="/job-seeker/applications">
              Kembali ke Daftar Lamaran
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center text-sm text-muted-foreground mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto mr-2"
          asChild
        >
          <Link href="/job-seeker/applications">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Kembali</span>
          </Link>
        </Button>
        <span className="mx-2">/</span>
        <Link href="/job-seeker/applications" className="hover:underline">Lamaran Saya</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">Detail Lamaran</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{application.jobTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {application.companyName} • Dilamar pada {formatApplicationDate(application.createdAt)}
          </p>
          {application.referenceCode && (
            <div className="mt-2 flex items-center">
              <Badge variant="outline" className="text-sm border-blue-200 bg-blue-50 text-blue-700 px-2 py-1">
                Kode Referensi: {application.referenceCode}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1" 
                      onClick={copyReferenceCode}
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Disalin!" : "Salin kode referensi"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <Badge className={`${getStatusBadgeClass(application.status)} px-3 py-1 text-sm`}>
          {getStatusText(application.status)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Lamaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {application.referenceCode && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Kode Referensi</h3>
              <p className="font-medium">{application.referenceCode}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Posisi
              </h3>
              <p className="font-medium">{application.jobTitle}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Perusahaan
              </h3>
              <p className="font-medium">{application.companyName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Tanggal Melamar
              </h3>
              <p>{formatApplicationDate(application.createdAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />
                Pendidikan Terakhir
              </h3>
              <p>{getEducationText(application.education)}</p>
            </div>
          </div>

          {application.additionalNotes && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Catatan Tambahan
                </h3>
                <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                  {application.additionalNotes}
                </div>
              </div>
            </>
          )}

          {application.cvFileUrl && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Curriculum Vitae (CV)
                </h3>
                <Button asChild>
                  <a href={application.cvFileUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Lihat CV
                  </a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <Button 
          variant="outline" 
          asChild
        >
          <Link href={`/job-seeker/browse-jobs/${application.jobPostingId}`}>
            Lihat Detail Lowongan
          </Link>
        </Button>
        
        <div className="flex gap-2">
          {application.status === "SUBMITTED" && (
            <Button 
              variant="destructive"
              onClick={() => {
                // Implement withdraw application functionality
                toast({
                  title: "Fitur dalam pengembangan",
                  description: "Fitur batalkan lamaran sedang dalam pengembangan",
                });
              }}
            >
              Batalkan Lamaran
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 