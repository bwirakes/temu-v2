'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoAuthRedirectProvider } from '@/components/no-auth-redirect-provider';

export default function NotFound() {
  return (
    <NoAuthRedirectProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">Halaman Tidak Ditemukan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-6">
              <div className="text-center text-gray-500">
                <p className="mb-4">Halaman yang Anda cari tidak ditemukan.</p>
                <p>Silakan periksa URL yang Anda akses atau kembali ke halaman utama.</p>
              </div>
              
              <Button variant="default" asChild className="w-full">
                <Link href="/" className="flex items-center justify-center">
                  <Home className="h-4 w-4 mr-2" />
                  Kembali Ke Beranda
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </NoAuthRedirectProvider>
  );
} 