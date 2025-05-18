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
  const { employerId, jobId } = useRouteParams();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      // Redirect to apply form URL with session token
      router.push(`/api/auth/apply?employerId=${employerId}&jobId=${jobId}`);
    } else {
      // Redirect to sign in with callback URL to this page
      const callbackUrl = `/careers/${employerId}/${jobId}/apply`;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [status, employerId, jobId, router]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Pengalihan</CardTitle>
          <CardDescription>
            Mengarahkan Anda ke halaman selanjutnya...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mohon tunggu...
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
