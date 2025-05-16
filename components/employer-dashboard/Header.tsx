"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Menu, X, Building2 } from "lucide-react";
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

  return (
    <header className="h-16 bg-gradient-to-r from-blue-600 to-blue-800 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
          aria-label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <Link href="/employer/dashboard" className="ml-3 flex items-center">
          <Building2 className="h-6 w-6 text-white" />
          <span className="ml-2 text-xl font-bold text-white hidden md:inline-block">
            LokerKita
          </span>
        </Link>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-blue-700">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <User size={18} />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/employer/profile" className="w-full flex">
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/employer/settings" className="w-full flex">
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              Ubah Tema
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/auth/logout" className="w-full flex text-red-500">
                Keluar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}