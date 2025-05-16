'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouteParams } from '@/lib/hooks/useRouteParams';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobApplyRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Use our custom hook to safely get params
  const params = useRouteParams<{ jobId: string, employerId: string }>();
  const jobId = params.jobId;

  useEffect(() => {
    if (!jobId || status === 'loading') return;

    setIsRedirecting(true);
    
    // Add a short delay before redirect for better UX
    setTimeout(() => {
      // Simply redirect to our centralized job application flow
      router.push(`/job-application/${jobId}`);
    }, 1000);
  }, [status, router, jobId]);

  // If we're still loading the session or params aren't available yet
  if (status === 'loading' || !jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat Aplikasi</CardTitle>
            <CardDescription>Mempersiapkan formulir lamaran...</CardDescription>
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
            Anda akan diarahkan ke formulir aplikasi dalam beberapa saat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            {isRedirecting ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Mengarahkan ke formulir aplikasi...</p>
              </>
            ) : (
              <Button 
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => {
                  setIsRedirecting(true);
                  router.push(`/job-application/${jobId}`);
                }}
              >
                Lanjut ke Formulir Aplikasi
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
