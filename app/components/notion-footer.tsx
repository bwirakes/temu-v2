'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function NotionFooter() {
  const pathname = usePathname();
  
  const isEmployerArea = pathname?.startsWith('/employer') && pathname !== '/employer/register';
  const isJobSeekerArea = pathname?.startsWith('/job-seeker') && pathname !== '/job-seeker/register';
  
  // Don't render the footer in logged-in areas
  if (isEmployerArea || isJobSeekerArea) {
    return null;
  }

  return (
    <footer className="border-t border-notion-border bg-notion-background">
      <div className="notion-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-start mb-3">
              <Image 
                src="/temu-logo.png" 
                alt="TEMU Logo" 
                width={40} 
                height={40} 
              />
              <div className="flex flex-col ml-2">
                <span className="font-bold text-black text-lg">TEMU</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="font-medium text-sm text-notion-text">Platform Dunia Kerja</p>
              <p className="text-xs text-notion-text-light mt-1">Temukan potensi kamu.</p>
              <p className="text-xs text-notion-text-light">Bangun karir yang tepat.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center justify-center h-12">
                <Image 
                  src="/naker.png" 
                  alt="Kementerian Ketenagakerjaan" 
                  width={100} 
                  height={40} 
                  className="h-auto max-h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-10">
                <Image 
                  src="/karirhub-lower.svg" 
                  alt="KarirHub" 
                  width={120} 
                  height={30} 
                  className="h-auto max-h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center h-10">
                <Image
                  src="/siaker-logo-blue.svg"
                  alt="Siaker Logo"
                  width={120}
                  height={30}
                  className="h-auto max-h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-3">Untuk Pencari Kerja</h5>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/careers" className="text-notion-text-light hover:text-notion-text transition-colors">
                  Jelajahi Lowongan
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-notion-text-light hover:text-notion-text transition-colors">
                  Buat Profil
                </Link>
              </li>
              <li>
                <Link href="/job-alerts" className="text-notion-text-light hover:text-notion-text transition-colors">
                  Notifikasi Lowongan
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-3">Untuk Perusahaan</h5>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/auth/signup" className="text-notion-text-light hover:text-notion-text transition-colors">
                  Daftar Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/employer/job-posting" className="text-notion-text-light hover:text-notion-text transition-colors">
                  Pasang Lowongan
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-notion-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-notion-text-light">
              © {new Date().getFullYear()} TEMU. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-notion-text-light hover:text-notion-text transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="text-sm text-notion-text-light hover:text-notion-text transition-colors">
                Syarat dan Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 