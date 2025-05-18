// Job details component for the employer view
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Badge 
} from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Export type for use in parent components
export interface Job {
  id: string;
  jobId: string; // Human-readable job ID (e.g., job-12345)
  employerId: string;
  jobTitle: string;
  postedDate: string;
  minWorkExperience: number;
  lastEducation?: string;
  requiredCompetencies?: string[];
  numberOfPositions?: number;
  expectations?: {
    ageRange?: {
      min: number;
      max: number;
    };
  };
  additionalRequirements?: {
    gender?: "MALE" | "FEMALE" | "ANY" | "ALL";
    acceptedDisabilityTypes?: string[] | null;
    numberOfDisabilityPositions?: number | null;
  };
  isConfirmed: boolean;
  // Extra fields for display purposes only
  applicationCount?: number;
  applicationDeadline?: string | null;
  workingHours?: string | null;
}

// Gender mapping
const genderLabels: Record<string, string> = {
  "MALE": "Laki-laki",
  "FEMALE": "Perempuan",
  "ANY": "Semua Jenis Kelamin",
  "ALL": "Semua"
};

// Format date helper
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Tidak ditentukan";
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  } catch (e) {
    return dateString;
  }
};

export function JobDetailsCard({ job }: { job: Job }) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Informasi Dasar</CardTitle>
          <CardDescription>Detail dasar lowongan kerja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Judul Pekerjaan</h3>
            <p className="font-medium">{job.jobTitle}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Jumlah Posisi</h3>
            <p>{job.numberOfPositions || 1} posisi</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Tanggal Posting</h3>
            <p>{formatDate(job.postedDate)}</p>
          </div>

          {job.applicationDeadline && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Batas Waktu Pendaftaran</h3>
              <p>{formatDate(job.applicationDeadline)}</p>
            </div>
          )}

          {job.workingHours && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Jam Kerja</h3>
              <p>{job.workingHours}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
            <div>
              {job.isConfirmed ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktif</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Persyaratan</CardTitle>
          <CardDescription>Persyaratan untuk posisi ini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.additionalRequirements?.gender && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Jenis Kelamin</h3>
              <p>{genderLabels[job.additionalRequirements.gender] || "Tidak ditentukan"}</p>
            </div>
          )}

          {job.expectations?.ageRange && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Rentang Usia</h3>
              <p>
                {job.expectations.ageRange.min} - {job.expectations.ageRange.max} tahun
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Pengalaman Minimal</h3>
            <p>{job.minWorkExperience} tahun</p>
          </div>

          {job.lastEducation && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Pendidikan Terakhir</h3>
              <p>Minimal {job.lastEducation}</p>
            </div>
          )}

          {job.requiredCompetencies && job.requiredCompetencies.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Kompetensi yang Dibutuhkan</h3>
              <ul className="list-disc pl-5 space-y-1">
                {job.requiredCompetencies.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disability Info - Only shown if suitable for disability */}
      {job.additionalRequirements?.acceptedDisabilityTypes && job.additionalRequirements.acceptedDisabilityTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informasi Disabilitas</CardTitle>
            <CardDescription>Informasi terkait disabilitas untuk posisi ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.additionalRequirements?.acceptedDisabilityTypes && job.additionalRequirements.acceptedDisabilityTypes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Jenis Disabilitas yang Diterima:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {job.additionalRequirements.acceptedDisabilityTypes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.additionalRequirements?.numberOfDisabilityPositions !== null && job.additionalRequirements?.numberOfDisabilityPositions !== undefined && (
              <div className="space-y-1">
                <h4 className="font-medium">Jumlah Posisi untuk Disabilitas:</h4>
                <p>{job.additionalRequirements.numberOfDisabilityPositions} posisi</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Application Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Statistik Aplikasi</CardTitle>
          <CardDescription>Statistik aplikasi untuk posisi ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Jumlah Pelamar</h3>
            <p className="text-2xl font-bold">{job.applicationCount || 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 