'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NotionHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isLoggedIn = !!session?.user;
  const isEmployerArea = pathname?.startsWith('/employer') && pathname !== '/employer/register';
  const isJobSeekerArea = pathname?.startsWith('/job-seeker') && pathname !== '/job-seeker/register';
  
  // Don't render the header in logged-in areas
  if (isEmployerArea || isJobSeekerArea) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Determine user type for navigation
  const userRole = session?.user ? (session.user as any).role : null;
  const dashboardLink = userRole === 'EMPLOYER' ? '/employer/dashboard' : '/job-seeker/dashboard';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-notion ${
        scrolled 
          ? 'bg-notion-background/90 backdrop-blur-sm shadow-sm border-b border-notion-border' 
          : 'bg-transparent'
      }`}
    >
      <div className="notion-container py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-start mr-8">
            <div className="flex items-start">
              <Image 
                src="/temu-logo.png" 
                alt="TEMU Logo" 
                width={32} 
                height={32} 
              />
              <div className="flex flex-col ml-2">
                <span className="font-bold text-black">TEMU</span>
                <span className="text-[10px] text-notion-text-light">untuk Kemnaker</span>
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex">
            <ul className="flex">
              <li>
                <Link 
                  href="/" 
                  className={`notion-nav-link ${pathname === '/' ? 'bg-notion-background-hover' : ''}`}
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className={`notion-nav-link ${pathname === '/careers' || pathname?.startsWith('/careers/') ? 'bg-notion-background-hover' : ''}`}
                >
                  Lowongan
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className={`notion-nav-link ${pathname === '/about' ? 'bg-notion-background-hover' : ''}`}
                >
                  Tentang
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link 
                href={dashboardLink} 
                className="notion-button-outline hidden sm:inline-flex"
              >
                Dashboard
              </Link>
              <Link href="/api/auth/signout" className="notion-button">
                Keluar
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="notion-button-outline hidden sm:inline-flex">
                Masuk
              </Link>
              <Link href="/auth/signup" className="notion-button">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 