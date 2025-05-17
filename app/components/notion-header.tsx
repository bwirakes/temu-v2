'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NotionHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Use the session with the { required: false } option to avoid multiple unnecessary API calls
  const { data: session, status } = useSession({ required: false });
  
  // Check if we're in a logged-in area
  const isEmployerArea = pathname?.startsWith('/employer') && pathname !== '/employer/register';
  const isJobSeekerArea = pathname?.startsWith('/job-seeker') && pathname !== '/job-seeker/register';
  
  // Always call all hooks before any conditional returns
  useEffect(() => {
    // Only attach the scroll event if we're actually going to render the header
    if (isEmployerArea || isJobSeekerArea) {
      return; // Early return from useEffect, not from component
    }
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled, isEmployerArea, isJobSeekerArea]);

  // Determine user type for navigation
  const userRole = session?.user ? (session.user as any).role : null;
  const dashboardLink = userRole === 'EMPLOYER' ? '/employer/dashboard' : '/job-seeker/dashboard';

  // Don't render the header in logged-in areas, but AFTER all hooks are called
  if (isEmployerArea || isJobSeekerArea) {
    return null;
  }

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
                priority
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
          {status === 'loading' ? (
            <div className="w-20 h-9 animate-pulse bg-notion-background-gray rounded-md"></div> // Better loading state
          ) : status === 'authenticated' ? (
            <>
              <Link 
                href={dashboardLink} 
                className="notion-button-outline hidden sm:inline-flex items-center gap-1 hover:bg-notion-background-gray-hover transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Dashboard
              </Link>
              <Link 
                href="/api/auth/signout" 
                className="notion-button hover:bg-notion-blue-dark transition-colors duration-150 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Keluar
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="notion-button-outline hidden sm:inline-flex items-center gap-1 hover:bg-notion-background-gray-hover transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Masuk
              </Link>
              <Link 
                href="/auth/signup" 
                className="notion-button hover:bg-notion-blue-dark transition-colors duration-150 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 