'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApplicationSuccessPage() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState<string>('');
  
  useEffect(() => {
    // Just get the reference from URL, no auth check
    const ref = searchParams.get('reference');
    setReference(ref || 'Unknown');
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto p-4 mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Lamaran Berhasil Dikirim!</CardTitle>
          <p className="text-gray-500 mt-2">
            Kode Referensi: <span className="font-bold">{reference}</span>
          </p>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-600">
            Tim rekrutmen akan meninjau lamaran Anda dalam 5-7 hari kerja.
            Mohon simpan kode referensi ini untuk keperluan pengecekan status.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/job-seeker/jobs">
              <ArrowLeft className="mr-2" /> Kembali ke Lowongan
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 