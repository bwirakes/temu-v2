"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard,
  FileText,
  Briefcase,
  Search,
  User,
  Settings,
  LogOut
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactElement;
}

export default function JobSeekerSidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      label: "Dasbor",
      href: "/job-seeker/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      label: "Profil Saya",
      href: "/job-seeker/profile",
      icon: <User size={20} />
    },
    {
      label: "CV Builder",
      href: "/cv-builder",
      icon: <FileText size={20} />
    },
    {
      label: "Lamaran Saya",
      href: "/job-seeker/applications",
      icon: <Briefcase size={20} />
    },
    {
      label: "Cari Lowongan",
      href: "/job-seeker/browse-jobs",
      icon: <Search size={20} />
    },
    {
      label: "Pengaturan",
      href: "/job-seeker/settings",
      icon: <Settings size={20} />
    }
  ];

  const isActive = (href: string) => {
    if (href === "/job-seeker/dashboard") {
      return pathname === "/job-seeker/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="fixed top-0 bottom-0 left-0 pt-16 bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 z-20 w-64 transform transition-all duration-300 ease-in-out hidden md:block">
      <div className="flex flex-col h-full">
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
              >
                <span className="opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-3 border-t border-gray-200">
          <Link
            href="/auth/logout"
            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors gap-3 text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <span className="opacity-70"><LogOut size={20} /></span>
            Keluar
          </Link>
        </div>
      </div>
    </aside>
  );
} 