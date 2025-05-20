'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobApplicationError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console in development
    console.error('Job application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-center">
              Terjadi Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Tidak dapat menampilkan data lowongan. 
              {error.message && error.message.includes('NEXT_NOT_FOUND')
                ? ' Lowongan tidak ditemukan atau telah dihapus.'
                : ' Terjadi kesalahan teknis saat memproses permintaan.'}
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
              {error.digest && (
                <p className="font-mono text-xs">Kode Error: {error.digest}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 border-t pt-4">
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
              <Link href="/job-seeker/jobs">
                <Home className="h-4 w-4 mr-2" />
                Ke Daftar Lowongan
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 