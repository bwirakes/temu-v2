"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  const isEmployerArea = pathname?.startsWith('/employer');
  const isJobSeekerArea = pathname?.startsWith('/job-seeker');
  
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

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-notion ${
        scrolled 
          ? 'bg-notion-background shadow-sm border-b border-notion-border' 
          : 'bg-notion-background'
      } h-16 flex items-center`}
    >
      <div className="w-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md transition-colors hover:bg-notion-background-hover text-black"
            aria-label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <Link href={isEmployerArea ? "/employer/dashboard" : "/job-seeker/dashboard"} className="ml-3 flex items-start">
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
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-notion-background-hover">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                  <User size={18} />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={isEmployerArea ? "/employer/settings" : "/job-seeker/profile"} className="w-full flex">
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={isEmployerArea ? "/employer/settings" : "/job-seeker/settings"} className="w-full flex">
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                Ubah Tema
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/api/auth/signout" className="w-full flex text-red-500">
                  Keluar
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}