import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobApplicationNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Lowongan Tidak Ditemukan</CardTitle>
            <CardDescription className="text-center">
              Lowongan yang Anda cari tidak ditemukan atau mungkin sudah ditutup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 pt-6">
            <div className="text-center text-gray-500">
              <p>Silakan periksa tautan yang Anda akses atau cari lowongan lain yang tersedia.</p>
            </div>
            
            <Button variant="default" asChild className="w-full">
              <Link href="/job-seeker/jobs" className="flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali Ke Daftar Lowongan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 