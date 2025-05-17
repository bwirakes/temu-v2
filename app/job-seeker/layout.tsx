"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import JobSeekerHeader from "@/components/job-seeker-dashboard/Header";
import JobSeekerSidebar from "@/components/job-seeker-dashboard/Sidebar";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session, status } = useSession();
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
  
  // Determine if we're on the profile page for special handling
  const isProfilePage = pathname?.startsWith('/job-seeker/profile');
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Special handling for profile page to preserve URL after login
      if (isProfilePage) {
        const callbackUrl = encodeURIComponent(pathname || '/job-seeker/profile');
        router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      } else {
        // For other pages, standard callback
        const callbackUrl = encodeURIComponent(pathname || '/job-seeker');
        router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      }
    }
  }, [status, pathname, router, isProfilePage]);
  
  const userName = session?.user?.name || "";

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

  // Check if we're on a job detail or application page
  const isJobDetailOrApplication = 
    (pathname?.includes('/job-seeker/jobs/') && pathname?.split('/').length > 3) || 
    pathname?.includes('/job-seeker/job-application/');

  // For job detail and application pages, we'll use a different layout approach
  if (isJobDetailOrApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - always visible */}
        <JobSeekerHeader 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
          userName={userName}
        />
        
        {/* Sidebar - controlled by state */}
        <JobSeekerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Main content - full width on mobile, adjusted on desktop */}
        <div className="pt-16 transition-all duration-300 md:ml-0 lg:ml-64">
          {children}
        </div>
      </div>
    );
  }

  // Standard layout for other pages
  return (
    <div className="min-h-screen bg-gray-50">
      <JobSeekerHeader 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
        userName={userName}
      />
      <JobSeekerSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main className={`pt-16 transition-all duration-300 ${isSidebarOpen && !isMobile ? "md:ml-64" : ""}`}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 