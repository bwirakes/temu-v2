'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Ups! Terjadi Kesalahan
              </h1>
              <p className="text-gray-600 mb-8">
                Terjadi kesalahan teknis saat memproses permintaan Anda.
                Silakan coba lagi atau kembali ke halaman utama.
              </p>
              
              {error.digest && (
                <p className="text-xs text-gray-500 mb-6 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => reset()}
                  className="flex items-center justify-center"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Coba Lagi
                </Button>
                
                <Button asChild>
                  <Link href="/" className="flex items-center justify-center">
                    <Home className="mr-2 h-4 w-4" />
                    Ke Beranda
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 