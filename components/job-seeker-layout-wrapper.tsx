"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import JobSeekerHeader from "@/components/job-seeker-dashboard/Header";
import JobSeekerSidebar from "@/components/job-seeker-dashboard/Sidebar";

export default function JobSeekerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession({ required: false });
  const pathname = usePathname();
  const router = useRouter();
  
  // Check for mobile viewport on client side
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On larger screens, sidebar is open by default
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);
  
  // Determine if we should bypass authentication for certain routes
  const isPublicRoute = pathname === '/job-seeker' || pathname === '/job-seeker/jobs';
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated' && !isPublicRoute) {
      // Preserve the URL for returning after login
      const callbackUrl = encodeURIComponent(pathname || '/job-seeker');
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
    }
  }, [status, pathname, router, isPublicRoute]);
  
  const userName = session?.user?.name || "";

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // While session is loading (initial auth check) and we need authentication, show a loading state
  if (status === 'loading' && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse p-4 rounded-md bg-white shadow-sm">
          <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Use a consistent layout structure regardless of the page
  return (
    <div className="min-h-screen bg-gray-50">
      <JobSeekerHeader 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
        userName={userName}
      />
      <JobSeekerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
      
      <main className={`pt-16 transition-all duration-300 ${isSidebarOpen && !isMobile ? "md:ml-64" : ""}`}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 