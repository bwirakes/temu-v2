'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, XCircle, User, Briefcase, Calendar, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

// Mock application data - in a real app, this would come from an API
interface ApplicationStatus {
  status: 'SUBMITTED' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  date: string;
  description: string;
}

interface ApplicationDetails {
  referenceCode: string;
  jobTitle: string;
  company: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
  };
  submittedAt: string;
  currentStatus: ApplicationStatus['status'];
  timeline: ApplicationStatus[];
}

const statusColors = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  REVIEWING: 'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-purple-100 text-purple-800',
  OFFERED: 'bg-green-100 text-green-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800',
};

const statusTranslations = {
  SUBMITTED: 'Terkirim',
  REVIEWING: 'Sedang Ditinjau',
  INTERVIEW: 'Wawancara',
  OFFERED: 'Penawaran',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  WITHDRAWN: 'Dibatalkan',
};

const statusIcons = {
  SUBMITTED: <Clock className="h-5 w-5" />,
  REVIEWING: <Clock className="h-5 w-5" />,
  INTERVIEW: <User className="h-5 w-5" />,
  OFFERED: <Briefcase className="h-5 w-5" />,
  ACCEPTED: <CheckCircle className="h-5 w-5" />,
  REJECTED: <XCircle className="h-5 w-5" />,
  WITHDRAWN: <XCircle className="h-5 w-5" />,
};

export default function ApplicationDetailsPage({ params }: { params: { referenceCode: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        // In a real application, you would fetch the data from an API
        // For now, we'll just simulate a fetch with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if the reference code is valid
        const referenceCode = decodeURIComponent(params.referenceCode);
        const isValidFormat = /^JA-\d{8}-[A-Z0-9]{6}$/.test(referenceCode);
        
        if (!isValidFormat) {
          setError('Kode referensi tidak valid');
          setIsLoading(false);
          return;
        }
        
        // Generate mock data based on the reference code
        const mockData: ApplicationDetails = {
          referenceCode,
          jobTitle: 'Senior Frontend Developer',
          company: 'PT. Example Company',
          applicant: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+62 812-3456-7890',
          },
          submittedAt: new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          currentStatus: 'REVIEWING',
          timeline: [
            {
              status: 'SUBMITTED',
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              description: 'Lamaran Anda telah berhasil dikirim.',
            },
            {
              status: 'REVIEWING',
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              description: 'Tim rekrutmen kami sedang meninjau lamaran Anda.',
            },
          ],
        };
        
        setApplicationDetails(mockData);
      } catch (err) {
        setError('Terjadi kesalahan saat mengambil detail lamaran');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplicationDetails();
  }, [params.referenceCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !applicationDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-sm text-gray-500">
                {error || 'Tidak dapat menemukan detail lamaran'}
              </p>
              <div className="mt-6">
                <Link
                  href="/job-application/track"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-4">
          <Link
            href="/job-application/track"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Pelacakan
          </Link>
        </div>
        
        {/* Application header */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-medium text-gray-900">Detail Lamaran</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Kode Referensi: {applicationDetails.referenceCode}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[applicationDetails.currentStatus]}`}>
              {statusTranslations[applicationDetails.currentStatus]}
            </div>
          </div>
        </div>
        
        {/* Application details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Pekerjaan</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Posisi</p>
                  <p className="mt-1 text-sm text-gray-900">{applicationDetails.jobTitle}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Pengajuan</p>
                  <p className="mt-1 text-sm text-gray-900">{applicationDetails.submittedAt}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Perusahaan</h3>
              <p className="mt-1 text-sm text-gray-900">{applicationDetails.company}</p>
            </div>
          </div>
        </div>
        
        {/* Applicant details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Pelamar</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nama</p>
                  <p className="mt-1 text-sm text-gray-900">{applicationDetails.applicant.name}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{applicationDetails.applicant.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Nomor Telepon</p>
                  <p className="mt-1 text-sm text-gray-900">{applicationDetails.applicant.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status timeline */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Status Lamaran</h2>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {applicationDetails.timeline.map((status, idx) => (
                  <li key={idx}>
                    <div className="relative pb-8">
                      {idx !== applicationDetails.timeline.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${statusColors[status.status]}`}>
                            {statusIcons[status.status]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {statusTranslations[status.status]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {status.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={status.date}>{status.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {applicationDetails.currentStatus !== 'REJECTED' && applicationDetails.currentStatus !== 'WITHDRAWN' && (
              <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Status Terkini</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Kami akan memperbarui status lamaran Anda di sini. Silakan periksa kembali secara berkala.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 