"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/employer-dashboard/Header";
import Sidebar from "@/components/employer-dashboard/Sidebar";

export default function EmployerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession({ required: false });
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're on mobile for responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to sign in page with callback URL to return after authentication
      const callbackUrl = encodeURIComponent(pathname || '/employer');
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
    }
  }, [status, pathname, router]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // While session is loading (initial auth check), show a minimal loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse p-4 rounded-md bg-white shadow-sm">
          <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} isMobile={isMobile} onClose={closeSidebar} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen && !isMobile ? 'md:ml-64' : ''}`}>
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
} 