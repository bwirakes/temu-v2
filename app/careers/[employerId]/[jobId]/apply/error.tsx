'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CareersApplyError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console in development
    console.error('Job apply error:', error);
  }, [error]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center">Terjadi Kesalahan</CardTitle>
          <CardDescription className="text-center">
            Tidak dapat memproses permintaan melamar pekerjaan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center mb-4">
            Terjadi kesalahan teknis saat mencoba melamar pekerjaan ini. Silakan coba lagi nanti atau hubungi dukungan.
          </p>
          {error.digest && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md font-mono">
              Kode Error: {error.digest}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => reset()}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
          <Button
            className="w-full sm:w-auto"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali Ke Beranda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 