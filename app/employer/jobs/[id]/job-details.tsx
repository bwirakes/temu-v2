import {
  Clock,
  Calendar,
  Briefcase,
  MapPin,
  FileText,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Define types
export interface Job {
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

// Utility functions
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

export function JobDetailsCard({ job }: { job: Job }) {
  return (
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
  );
} 
