'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function JobApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [referenceCode, setReferenceCode] = useState<string>('');
  
  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    // Get reference code from URL query params
    const reference = searchParams.get('reference');
    if (reference) {
      setReferenceCode(reference);
    }
  }, [status, router, searchParams]);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Card className="border-green-100 shadow-md">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-medium text-gray-900">
                Lamaran Berhasil Dikirim!
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Lamaran Anda telah berhasil dikirim dan akan segera diproses.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Kode Referensi Lamaran</h3>
                <p className="text-lg font-semibold text-gray-900">{referenceCode}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Simpan kode referensi ini untuk melacak status lamaran Anda.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Langkah Selanjutnya:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-3 flex-shrink-0">
                      1
                    </span>
                    <span className="text-gray-600">
                      Tim rekrutmen akan meninjau lamaran Anda dalam 5-7 hari kerja.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-3 flex-shrink-0">
                      2
                    </span>
                    <span className="text-gray-600">
                      Jika profil Anda sesuai, Anda akan dihubungi untuk proses selanjutnya.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-3 flex-shrink-0">
                      3
                    </span>
                    <span className="text-gray-600">
                      Anda dapat melihat status lamaran di halaman &quot;Lamaran Saya&quot;.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-6">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto" 
              asChild
            >
              <Link href="/job-seeker/browse-jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cari Lowongan Lain
              </Link>
            </Button>
            
            <Button 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" 
              asChild
            >
              <Link href="/job-seeker/applications">
                Lihat Lamaran Saya
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 