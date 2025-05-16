"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/employer-dashboard/StatsCard";
import ActionButton from "@/components/employer-dashboard/ActionButton";
import DashboardCard from "@/components/employer-dashboard/DashboardCard";
import LoadingDashboard from "@/components/employer-dashboard/LoadingDashboard";
import { Session } from "next-auth";

// Extended session type to include userType
interface CustomSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    userType?: 'job_seeker' | 'employer';
  };
}

export default function EmployerDashboard() {
  const { data: session } = useSession() as { 
    data: CustomSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  
  const userName = session?.user?.name || "Pengguna";
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployerId() {
      try {
        const response = await fetch('/api/employer/get-id');
        if (response.ok) {
          const data = await response.json();
          setEmployerId(data.employerId);
        }
      } catch (error) {
        console.error('Error fetching employer ID:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchEmployerId();
    }
  }, [session]);

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="flex flex-col gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Selamat datang, {userName}!</h1>
        
        <p className="text-muted-foreground">
          Dasbor untuk Anda yang ingin membuat lowongan pekerjaan dan lihat statistik pelamar
        </p>
      </div>

      <Suspense fallback={<LoadingDashboard />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard 
            title="Lowongan Aktif" 
            value={12} 
            trend={8} 
            trendLabel="dari bulan lalu"
            icon="Briefcase"
          />
          <StatsCard 
            title="Total Pelamar" 
            value={248} 
            trend={32} 
            trendLabel="dari bulan lalu"
            icon="Users"
          />
        </div>
      </Suspense>

      <DashboardCard title="Aksi Cepat">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <ActionButton 
            title="Lihat Lowongan" 
            description="Jelajahi dan edit lowongan aktif Anda"
            icon="Briefcase"
            href="/employer/jobs"
          />
          <ActionButton 
            title="Pasang Lowongan" 
            description="Buat lowongan pekerjaan baru"
            icon="FilePlus" 
            href="/employer/job-posting"
            primary
          />
          {isLoading ? (
            <div className="flex items-start p-4 rounded-lg border bg-white text-gray-800 border-gray-200">
              <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                <div className="h-5 w-5 animate-pulse bg-blue-300 rounded-full"></div>
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="font-medium text-base text-gray-800">Memuat...</h3>
                <p className="text-sm mt-1 text-muted-foreground">Mengambil informasi perusahaan</p>
              </div>
            </div>
          ) : employerId ? (
            <ActionButton 
              title="Halaman Karir Publik" 
              description="Lihat halaman lowongan publik perusahaan Anda"
              icon="Globe" 
              href={`/careers/${employerId}`}
            />
          ) : null}
        </div>
      </DashboardCard>
    </div>
  );
}