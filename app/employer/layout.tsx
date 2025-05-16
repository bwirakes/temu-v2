"use client";

import { useState, useEffect } from "react";
import Header from "@/components/employer-dashboard/Header";
import Sidebar from "@/components/employer-dashboard/Sidebar";
import { Toaster } from "sonner";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <div className="h-full">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
} 