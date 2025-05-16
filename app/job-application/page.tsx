'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  FileDown,
  Briefcase,
  Users,
  MapPin,
  Clock,
  DollarSign,
  UserCheck,
  FileText,
  Lightbulb,
  Award,
  Globe,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { ContractType, WorkLocation, SalaryRange } from '@/lib/context/JobPostingContext';

// Define job application data interface
interface JobApplicationData {
  // Basic Information
  jobTitle: string;
  numberOfPositions: number;
  responsibilities: string;
  workLocations: WorkLocation[];
  workingHours?: string;
  salaryRange?: SalaryRange;
  
  // Requirements
  gender: "MALE" | "FEMALE" | "ANY";
  minWorkExperience?: number;
  requiredDocuments: string;
  specialSkills?: string;
  technologicalSkills?: string;
  
  // Company Expectations
  ageRange: {
    min: number;
    max: number;
  };
  expectedCharacter: string;
  foreignLanguage?: string;
  
  // Additional Information
  suitableForDisability?: boolean;
  contractType?: ContractType;
  applicationDeadline?: Date;
}

// Sample data to display in the preview
const sampleJobData: JobApplicationData = {
  jobTitle: "Senior Frontend Developer",
  numberOfPositions: 2,
  responsibilities: "- Develop and maintain responsive web applications using React and Next.js\n- Collaborate with UI/UX designers to implement visual elements\n- Optimize applications for maximum speed and scalability\n- Work with backend developers to integrate REST APIs\n- Write clean, maintainable, and well-documented code",
  workLocations: [
    {
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      province: "DKI Jakarta",
      isRemote: false
    },
    {
      address: "",
      city: "Bandung",
      province: "Jawa Barat",
      isRemote: true
    }
  ],
  workingHours: "Senin-Jumat, 09:00-17:00",
  salaryRange: {
    min: 15000000,
    max: 25000000,
    isNegotiable: true
  },
  gender: "ANY",
  minWorkExperience: 3,
  requiredDocuments: "- KTP\n- Ijazah S1/S2\n- Portfolio\n- Sertifikat keahlian terkait",
  specialSkills: "- Problem solving\n- Kemampuan analitis yang baik\n- Komunikasi efektif",
  technologicalSkills: "- React.js/Next.js (Expert)\n- TypeScript (Advanced)\n- CSS/Tailwind CSS (Advanced)\n- Git (Intermediate)\n- Testing frameworks (Intermediate)",
  ageRange: {
    min: 25,
    max: 40
  },
  expectedCharacter: "- Mampu bekerja dalam tim\n- Proaktif dan inisiatif\n- Teliti dan detail-oriented\n- Mampu bekerja di bawah tekanan\n- Memiliki keinginan belajar yang tinggi",
  foreignLanguage: "Bahasa Inggris (minimal pasif)",
  suitableForDisability: true,
  contractType: "FULL_TIME",
  applicationDeadline: new Date("2023-12-31")
};

export default function JobApplicationPage() {
  const [jobData, setJobData] = useState<JobApplicationData>(sampleJobData);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const jobPreviewRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    // @ts-ignore - The type definitions in the library seem to be incorrect
    content: () => jobPreviewRef.current,
    documentTitle: `${jobData.jobTitle}_Job_Description`,
    onAfterPrint: () => console.log('PDF generated successfully!'),
  });

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Tidak ditentukan";
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Job Application Builder</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isPreviewMode ? 'Edit Job Details' : 'Preview Job Post'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileDown className="mr-2 h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isPreviewMode ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div ref={jobPreviewRef} className="px-4 py-5 sm:p-6">
              {/* Job Preview Content */}
              <div className="job-preview">
                {/* Company Logo and Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{jobData.jobTitle}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">PT. Example Company</p>
                  </div>
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                {/* Job Overview */}
                <div className="mt-6 border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium text-gray-900">Job Overview</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Jumlah Posisi</p>
                        <p className="mt-1 text-sm text-gray-900">{jobData.numberOfPositions}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lokasi</p>
                        <ul className="mt-1 text-sm text-gray-900">
                          {jobData.workLocations.map((location, index) => (
                            <li key={index}>
                              {location.city}, {location.province}
                              {location.isRemote && " (Remote)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {jobData.workingHours && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Jam Kerja</p>
                          <p className="mt-1 text-sm text-gray-900">{jobData.workingHours}</p>
                        </div>
                      </div>
                    )}
                    {jobData.salaryRange && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gaji</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {jobData.salaryRange.min && `Rp ${jobData.salaryRange.min.toLocaleString()}`}
                            {jobData.salaryRange.min && jobData.salaryRange.max && " - "}
                            {jobData.salaryRange.max && `Rp ${jobData.salaryRange.max.toLocaleString()}`}
                            {jobData.salaryRange.isNegotiable && " (Negotiable)"}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {jobData.gender === "MALE" ? "Laki-laki" : 
                           jobData.gender === "FEMALE" ? "Perempuan" : 
                           "Semua Jenis Kelamin"}
                        </p>
                      </div>
                    </div>
                    {jobData.contractType && (
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Jenis Pekerjaan</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {jobData.contractType === "FULL_TIME" ? "Penuh Waktu" :
                             jobData.contractType === "PART_TIME" ? "Paruh Waktu" :
                             jobData.contractType === "CONTRACT" ? "Kontrak" :
                             jobData.contractType === "INTERNSHIP" ? "Magang" :
                             "Freelance"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="mt-6 border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium text-gray-900">Deskripsi Pekerjaan</h3>
                  <div className="mt-4 text-sm text-gray-600 whitespace-pre-line">
                    {jobData.responsibilities}
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-6 border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium text-gray-900">Persyaratan</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    {jobData.minWorkExperience !== undefined && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Pengalaman Kerja Minimal</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {jobData.minWorkExperience > 0 ? `${jobData.minWorkExperience} tahun` : "Tidak memerlukan pengalaman kerja"}
                        </p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Dokumen yang Diperlukan</p>
                      <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                        {jobData.requiredDocuments}
                      </div>
                    </div>
                    {jobData.specialSkills && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Keahlian Khusus</p>
                        <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                          {jobData.specialSkills}
                        </div>
                      </div>
                    )}
                    {jobData.technologicalSkills && (
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Keahlian Teknis</p>
                        <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                          {jobData.technologicalSkills}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Expectations */}
                <div className="mt-6 border-b border-gray-200 pb-5">
                  <h3 className="text-lg font-medium text-gray-900">Harapan Perusahaan</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Usia</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {jobData.ageRange.min} - {jobData.ageRange.max} tahun
                      </p>
                    </div>
                    {jobData.foreignLanguage && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Bahasa Asing</p>
                        <p className="mt-1 text-sm text-gray-900">{jobData.foreignLanguage}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Karakter yang Diharapkan</p>
                      <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                        {jobData.expectedCharacter}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Informasi Tambahan</h3>
                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="flex items-center">
                      {jobData.suitableForDisability ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Cocok untuk Orang dengan Disabilitas</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {jobData.suitableForDisability ? "Ya" : "Tidak"}
                        </p>
                      </div>
                    </div>
                    {jobData.applicationDeadline && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Batas Pendaftaran</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(jobData.applicationDeadline)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="mt-8">
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Siap untuk melamar?</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Kirim lamaran Anda secara online dengan mengklik tombol di bawah ini.</p>
                        </div>
                        <div className="mt-4">
                          <div className="-mx-2 -my-1.5 flex">
                            <button
                              type="button"
                              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Lamar Sekarang
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Job Details</h3>
              <p className="text-sm text-gray-600 mb-6">
                Untuk mengedit detail pekerjaan, silakan gunakan formulir multi-langkah:
              </p>
              <Link 
                href="/employer/job-posting"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Job Posting Form
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
