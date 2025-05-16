'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  useEffect(() => {
    // Get the reference code from the URL parameters
    const reference = searchParams.get('reference');
    if (reference) {
      setReferenceCode(reference);
    }
  }, [searchParams]);

  // If no reference code is found, show an error
  if (!referenceCode) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-600">Terjadi Kesalahan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Maaf, kami tidak dapat menemukan informasi referensi untuk lamaran Anda.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/job-seeker/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Lamaran Berhasil Terkirim!</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-6">
            Terima kasih atas lamaran yang Anda kirimkan. Tim rekrutmen akan meninjau
            lamaran Anda dan akan menghubungi jika profil Anda sesuai dengan kebutuhan.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Kode Referensi Lamaran Anda:</p>
            <p className="text-xl font-mono font-bold text-blue-600">{referenceCode}</p>
            <p className="text-xs text-gray-500 mt-2">
              Simpan kode referensi ini untuk melacak status lamaran Anda.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/job-seeker/applications">
                Lihat Lamaran Saya
              </Link>
            </Button>
            
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/job-seeker/browse-jobs">
                Cari Lowongan Lainnya
              </Link>
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <Button asChild variant="link" className="text-gray-500">
            <Link href="/job-seeker/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 