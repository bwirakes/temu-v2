"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmployerOnboardingSuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center px-4">
      <Card className="max-w-lg w-full p-6 md:p-8 bg-white shadow-xl rounded-xl">
        <div className="text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pendaftaran Berhasil!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Luar biasa! Semua data yang kami perlukan untuk pendaftaran awal perusahaan Anda telah kami terima. 
            Akun perusahaan Anda sedang kami proses.
          </p>
          
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg text-left">
              <h3 className="font-medium text-indigo-900 mb-2">Berikutnya apa?</h3>
              <ul className="list-disc text-indigo-800 text-sm space-y-2 pl-5">
                <li>Anda akan segera menerima email konfirmasi beserta tautan untuk mengakses dasbor perusahaan Anda.</li>
                <li>Melalui dasbor tersebut, Anda dapat melengkapi profil perusahaan lebih lanjut (termasuk mengunggah logo jika belum).</li>
                <li>Anda dapat mengelola informasi, dan tentunya mulai memasang informasi lowongan kerja.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Jika ada pertanyaan, tim dukungan kami siap membantu:
              </p>
              <p className="text-sm font-semibold text-indigo-600">
                support@platformanda.com
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <Link href="/employer/dashboard" passHref>
              <Button className="w-full">
                Ke Dasbor
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
} 