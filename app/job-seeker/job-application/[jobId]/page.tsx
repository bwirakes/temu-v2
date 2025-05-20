import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CustomSession } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import JobApplicationClientShell from './components/job-application-client-shell';
import { getJobApplicationPageData, JobDetails } from './actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define proper params interface
interface PageParams {
  params: Promise<{ jobId: string }>;
}

/**
 * Job Application Page - Server Component
 */
export default async function JobSeekerApplicationPage({ params }: PageParams) {
  // In Next.js 15, params must be awaited
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;
  
  // Get authentication
  const session = await auth() as CustomSession;
  
  // If not authenticated, redirect to sign-in
  if (!session?.user) {
    const callbackUrl = `/job-seeker/job-application/${jobId}`;
    return redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  // If wrong user type, show error
  if (session.user.userType !== 'job_seeker') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p className="mb-4">Anda harus masuk sebagai pencari kerja.</p>
        <Button asChild><Link href="/careers">Kembali</Link></Button>
      </div>
    );
  }
  
  try {
    // Get application data
    const { jobDetails, profileData, applicationStatus } = await getJobApplicationPageData(jobId);
    
    // Check if user has already applied - show success message if applied
    if (applicationStatus?.hasApplied) {
      return (
        <div className="max-w-md mx-auto p-4 mt-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Anda Telah Melamar!</CardTitle>
              <p className="text-gray-500 mt-2">
                Kode Referensi: <span className="font-bold">{applicationStatus.referenceCode || 'APP-XXXXX'}</span>
              </p>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600">
                Anda telah melamar untuk posisi <span className="font-medium">{jobDetails.jobTitle}</span> di
                perusahaan <span className="font-medium">{jobDetails.companyInfo.name}</span>.
                Tim rekrutmen akan meninjau lamaran Anda dalam 5-7 hari kerja.
              </p>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/job-seeker/jobs">
                  <ArrowLeft className="mr-2" /> Kembali ke Lowongan
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    // Format profile data for the client component
    const applicationProfileData = profileData ? {
      fullName: profileData.namaLengkap,
      email: profileData.email,
      phone: profileData.nomorTelepon,
      cvFileUrl: profileData.cvFileUrl || undefined,
      // Convert education type correctly
      education: profileData.pendidikanTerakhir as "SD" | "SMP" | "SMA/SMK" | "D1" | "D2" | "D3" | "D4" | "S1" | "S2" | "S3" | undefined,
      
      // Add the new detailed fields
      tanggalLahir: profileData.tanggalLahir || undefined,
      jenisKelamin: profileData.jenisKelamin || undefined,
      kotaDomisili: profileData.kotaDomisili || undefined,
      pengalamanKerjaTerakhir: profileData.pengalamanKerjaTerakhir || undefined,
      gajiTerakhir: profileData.gajiTerakhir === null ? undefined : profileData.gajiTerakhir,
      levelPengalaman: profileData.levelPengalaman || undefined,
      ekspektasiGaji: profileData.ekspektasiGaji || undefined,
      preferensiLokasiKerja: profileData.preferensiLokasiKerja || undefined,
      preferensiJenisPekerjaan: profileData.preferensiJenisPekerjaan || undefined,
      pendidikanFull: profileData.pendidikan || undefined,
      pengalamanKerjaFull: profileData.pengalamanKerja || undefined,
    } : undefined;
    
    // Render application form
    return (
      <div className="bg-white">
        <div className="p-4 border-b">
          <Button variant="ghost" asChild>
            <Link href="/job-seeker/jobs">
              <ArrowLeft className="mr-2" /> Kembali
            </Link>
          </Button>
        </div>
        
        <JobApplicationClientShell 
          jobId={jobId}
          jobDetails={jobDetails}
          applicationProfileData={applicationProfileData}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading application:", error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-4">Terjadi kesalahan saat memuat aplikasi.</p>
        <Button asChild><Link href="/careers">Kembali</Link></Button>
      </div>
    );
  }
} 