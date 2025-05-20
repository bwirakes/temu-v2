'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

// Error component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('Terjadi kesalahan saat memproses permintaan Anda');
  const [backPath, setBackPath] = useState<string>('/');
  
  useEffect(() => {
    // Get error message from query parameters
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    }
    
    // Get back URL if available
    const back = searchParams.get('back');
    if (back) {
      setBackPath(decodeURIComponent(back));
    }
  }, [searchParams]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-xl">Terjadi Kesalahan</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-muted-foreground text-center">
            Silakan coba lagi atau kembali ke halaman sebelumnya untuk melanjutkan.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            asChild
          >
            <Link href={backPath}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          
          <Button 
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ke Beranda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Loading fallback for the Suspense boundary
function ErrorLoadingFallback() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Memuat...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Sedang memuat informasi kesalahan
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GeneralErrorPage() {
  return (
    <Suspense fallback={<ErrorLoadingFallback />}>
      <ErrorContent />
    </Suspense>
  );
} 