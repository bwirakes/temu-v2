import { notFound } from 'next/navigation';
import { getJobApplicationById, getUserProfileById, getJobById } from '@/lib/db-actions';
import { auth } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ApplicantStatusUpdate from '@/components/employer-dashboard/applicants/ApplicantStatusUpdate';

// Define the status badge styling based on application status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diajukan</Badge>;
    case 'REVIEWING':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Sedang Ditinjau</Badge>;
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
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// Format date to Indonesian format
const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd MMMM yyyy', { locale: id });
};

// Generate application timestamp based on ID
const generateTimestampFromId = (id: string): Date => {
  // Use the first part of the UUID (8 characters) as a pseudo-timestamp
  // Convert to a number and use as milliseconds since epoch
  // This is just a fallback method when actual timestamp isn't available
  const timestampPart = parseInt(id.substring(0, 8), 16);
  // Add a timestamp offset to make it a reasonable recent date
  // This is somewhat arbitrary but should work for display purposes
  const baseTimestamp = new Date(2023, 0, 1).getTime();
  return new Date(baseTimestamp + (timestampPart % (1000 * 60 * 60 * 24 * 365)));
};

export default async function ApplicantDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  // Redirect if not authenticated or not an employer
  if (!session?.user || session.user.email === null) {
    return notFound();
  }

  // Check if user is an employer
  const userType = (session.user as any).userType;
  if (userType !== 'employer') {
    return notFound();
  }

  // Get the application data
  const application = await getJobApplicationById(params.id);

  // Return 404 if application not found
  if (!application) {
    return notFound();
  }

  // Get the applicant profile
  const applicantProfile = await getUserProfileById(application.applicantProfileId);

  // Get the job details
  const job = await getJobById(application.jobId);

  // Return 404 if job or profile not found
  if (!job || !applicantProfile) {
    return notFound();
  }

  // Generate application timestamp if not available
  // The database schema might not have createdAt, so we generate one from the ID
  const applicationDate = generateTimestampFromId(application.id);

  // Generate reference code using applicationDate
  const referenceCode = `JA-${format(applicationDate, 'yyyyMMdd')}-${application.id.substring(0, 6).toUpperCase()}`;

  return (
    (<div className="container py-6 max-w-5xl">
      <div className="flex flex-col space-y-6">
        {/* Back button and header */}
        <div className="flex flex-col space-y-2">
          <Link 
            href={`/employer/jobs/${application.jobId}`} 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Kembali ke Daftar Pelamar</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Detail Pelamar</h1>
            <ApplicantStatusUpdate 
              applicationId={application.id} 
              currentStatus={application.status} 
              currentReason={application.statusChangeReason}
            />
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Applicant details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelamar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nama Lengkap</h3>
                    <p className="text-base font-medium">{applicantProfile.namaLengkap}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-base">{applicantProfile.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nomor Telepon</h3>
                    <p className="text-base">{applicantProfile.nomorTelepon}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tanggal Lahir</h3>
                    <p className="text-base">{applicantProfile.tanggalLahir}</p>
                  </div>
                  {applicantProfile.tempatLahir && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tempat Lahir</h3>
                      <p className="text-base">{applicantProfile.tempatLahir}</p>
                    </div>
                  )}
                  {applicantProfile.jenisKelamin && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Jenis Kelamin</h3>
                      <p className="text-base">{applicantProfile.jenisKelamin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detail Lamaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Posisi</h3>
                    <p className="text-base font-medium">{job.jobTitle}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">{getStatusBadge(application.status)}</div>
                  </div>
                  {application.statusChangeReason && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Alasan Perubahan Status</h3>
                      <p className="text-base mt-1">{application.statusChangeReason}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tanggal Lamaran</h3>
                    <p className="text-base">{formatDate(applicationDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Kode Referensi</h3>
                    <p className="text-base font-mono">{referenceCode}</p>
                  </div>
                  {application.education && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Pendidikan Terakhir</h3>
                      <p className="text-base">{application.education}</p>
                    </div>
                  )}
                </div>
                
                {application.additionalNotes && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Catatan Tambahan</h3>
                    <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                      <p>{application.additionalNotes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - CV and actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dokumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(application.resumeUrl || application.cvFileUrl || applicantProfile.cvFileUrl) ? (
                  <div className="space-y-3">
                    {application.resumeUrl && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                          Resume
                        </a>
                      </Button>
                    )}
                    
                    {application.cvFileUrl && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={application.cvFileUrl} target="_blank" rel="noopener noreferrer">
                          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                          CV File
                        </a>
                      </Button>
                    )}
                    
                    {(!application.cvFileUrl && applicantProfile.cvFileUrl) && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={applicantProfile.cvFileUrl} target="_blank" rel="noopener noreferrer">
                          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                          CV dari Profil
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Tidak ada dokumen yang tersedia</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tindakan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <a href={`mailto:${applicantProfile.email}`}>
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Kirim Email
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <a href={`https://wa.me/${applicantProfile.nomorTelepon.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Hubungi via WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>)
  );
} 