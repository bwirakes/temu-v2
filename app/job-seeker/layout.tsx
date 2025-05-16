"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import JobSeekerHeader from "@/components/job-seeker-dashboard/Header";
import JobSeekerSidebar from "@/components/job-seeker-dashboard/Sidebar";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const userName = session?.user?.name || "";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if we're on a job detail or application page
  const isJobDetailOrApplication = 
    (pathname.includes('/job-seeker/jobs/') && pathname.split('/').length > 3) || 
    pathname.includes('/job-seeker/job-application/');

  // For job detail and application pages, we'll use a different layout approach
  // Header and sidebar will be hidden on mobile but visible on desktop
  if (isJobDetailOrApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <JobSeekerHeader 
            toggleSidebar={toggleSidebar} 
            isSidebarOpen={isSidebarOpen} 
            userName={userName}
          />
        </div>
        
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <JobSeekerSidebar isOpen={isSidebarOpen} />
        </div>
        
        {/* Main content - full width on mobile, adjusted on desktop */}
        <div className="md:pt-16 md:transition-all md:duration-300 md:ml-0 lg:ml-64">
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
      <JobSeekerSidebar isOpen={isSidebarOpen} />
      
      <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? "md:ml-64" : ""}`}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 