"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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

// Type for dashboard statistics
interface DashboardStats {
  activeJobsCount: number;
  totalApplicantsCount: number;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

export default function EmployerDashboard() {
  const { data: session } = useSession() as { 
    data: CustomSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  
  const userName = session?.user?.name || "Pengguna";
  const [isLoading, setIsLoading] = useState(true);

  // Use SWR for data fetching - will only revalidate on focus and refresh
  const { data: employerData } = useSWR(
    session?.user ? '/api/employer/get-id' : null, 
    fetcher, 
    { revalidateOnFocus: false }
  );
  
  const employerId = employerData?.employerId;

  // Use SWR for dashboard stats
  const { data: dashboardStats, error: statsError } = useSWR<DashboardStats>(
    session?.user ? '/api/employer/dashboard-stats' : null, 
    fetcher,
    { revalidateOnFocus: false }
  );
  
  // Handle loading state for employer ID
  useEffect(() => {
    if (session?.user) {
      if (employerData !== undefined) {
        setIsLoading(false);
      }
    }
  }, [session, employerData]);

  // Determine if stats are loading
  const isStatsLoading = session?.user && !dashboardStats && !statsError;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Selamat datang, {userName}</h1>
            <p className="text-gray-500">
              Dasbor untuk membuat lowongan pekerjaan dan memantau pelamar
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<LoadingDashboard />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCard 
            title="Lowongan Aktif" 
            value={isStatsLoading ? '...' : statsError ? 'N/A' : dashboardStats?.activeJobsCount ?? 0} 
            icon="Briefcase"
          />
          <StatsCard 
            title="Total Pelamar" 
            value={isStatsLoading ? '...' : statsError ? 'N/A' : dashboardStats?.totalApplicantsCount ?? 0} 
            icon="Users"
          />
        </div>
      </Suspense>

      <DashboardCard title="Aksi Cepat">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
            <div className="flex items-start p-5 rounded-md border border-gray-200 bg-white shadow-sm">
              <div className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-gray-100 rounded-md">
                <div className="h-4 w-4 animate-pulse bg-gray-300 rounded-full"></div>
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="font-medium text-base text-gray-800">Memuat...</h3>
                <p className="text-sm mt-1 text-gray-500">Mengambil informasi perusahaan</p>
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