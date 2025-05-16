'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouteParams } from '@/lib/hooks/useRouteParams';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobApplicationRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Use our custom hook to safely get params
  const params = useRouteParams<{ jobId: string }>();
  const jobId = params.jobId;

  useEffect(() => {
    if (!jobId || status === 'loading') return;

    setIsRedirecting(true);
    
    setTimeout(() => {
      if (status === 'authenticated') {
        // User is logged in, redirect to the job-seeker application page
        router.push(`/job-seeker/job-application/${jobId}`);
      } else {
        // User is not logged in, redirect to login with return URL
        const returnUrl = `/job-application/${jobId}`;
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(returnUrl)}`);
      }
    }, 1000); // Small delay for better UX
  }, [status, router, jobId]);

  // If we're still loading the session or params aren't available yet
  if (status === 'loading' || !jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat Aplikasi</CardTitle>
            <CardDescription>Mohon tunggu sebentar...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Aplikasi Pekerjaan</CardTitle>
          <CardDescription>
            {status === 'authenticated' 
              ? 'Anda akan diarahkan ke formulir aplikasi pekerjaan.' 
              : 'Anda perlu login terlebih dahulu untuk melanjutkan.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            {isRedirecting ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">
                  {status === 'authenticated' 
                    ? 'Mengarahkan ke formulir aplikasi...' 
                    : 'Mengarahkan ke halaman login...'}
                </p>
              </>
            ) : (
              <Button 
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => {
                  setIsRedirecting(true);
                  if (status === 'authenticated') {
                    router.push(`/job-seeker/job-application/${jobId}`);
                  } else {
                    const returnUrl = `/job-application/${jobId}`;
                    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(returnUrl)}`);
                  }
                }}
              >
                {status === 'authenticated' 
                  ? 'Lanjutkan ke Formulir Aplikasi' 
                  : 'Login untuk Melanjutkan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 