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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { employerId, jobId } = useRouteParams();

  useEffect(() => {
    // Only proceed when session status is definitively determined
    if (status === 'loading') return;

    const handleAuthentication = async () => {
      try {
        if (status === 'authenticated') {
          // User is authenticated, proceed to the application process API
          console.log('User authenticated, redirecting to application process API...');
          const apiUrl = `/api/auth/apply?employerId=${encodeURIComponent(employerId)}&jobId=${encodeURIComponent(jobId)}`;
          router.push(apiUrl);
        } else {
          // User is not authenticated, redirect to sign-in page with callback URL
          console.log('User not authenticated, redirecting to sign-in...');
          const currentUrl = `/careers/${employerId}/${jobId}/apply`;
          const callbackUrl = encodeURIComponent(currentUrl);
          router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
        }
      } catch (err) {
        console.error('Error during authentication flow:', err);
        setError('Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.');
        setLoading(false);
      }
    };

    handleAuthentication();
  }, [status, employerId, jobId, router]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Pengalihan</CardTitle>
          <CardDescription>
            {error ? 'Terjadi kesalahan' : 'Mengarahkan Anda ke halaman selanjutnya...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          {error ? (
            <div className="space-y-4 w-full">
              <p className="text-red-600 text-sm">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mohon tunggu...
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
