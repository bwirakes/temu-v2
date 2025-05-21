"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactElement;
}

export default function Sidebar({ isOpen, isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      label: "Dasbor",
      href: "/employer/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      label: "Lowongan",
      href: "/employer/jobs",
      icon: <Briefcase size={20} />
    },
    {
      label: "Pelamar",
      href: "/employer/applicants",
      icon: <Users size={20} />
    },
    {
      label: "Pengaturan",
      href: "/employer/settings",
      icon: <Settings size={20} />
    }
  ];

  const isActive = (href: string) => {
    if (href === "/employer/dashboard") {
      return pathname === "/employer/dashboard";
    }
    return pathname.startsWith(href);
  };

  // If sidebar is closed and not mobile, just return null
  if (!isOpen && !isMobile) {
    return null;
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {isMobile && (
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors gap-3 mb-1 ${
                isActive(item.href)
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
              onClick={isMobile ? onClose : undefined}
            >
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <Link
          href="/api/auth/signout"
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors gap-3 text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <span className="opacity-70"><LogOut size={20} /></span>
          Keluar
        </Link>
      </div>
    </div>
  );

  // For mobile, render a modal/overlay
  if (isMobile) {
    return (
      <div 
        className={`fixed inset-0 z-50 transform transition-transform ease-in-out duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Sidebar */}
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg">
            {sidebarContent}
          </div>
        </div>
      </div>
    );
  }

  // For desktop
  return (
    <aside className="fixed top-0 bottom-0 left-0 pt-16 bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 z-20 w-64 transform transition-all duration-300 ease-in-out">
      {sidebarContent}
    </aside>
  );
}