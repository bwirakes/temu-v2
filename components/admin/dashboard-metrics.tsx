'use client';

import { useState } from 'react';
import { Users, Briefcase, ClipboardList, Building, FileSearch } from 'lucide-react';
import useSWR from 'swr';
import StatCard from './stat-card';

interface AdminMetrics {
  employerCount: number;
  jobSeekerCount: number;
  jobsPosted: number;
  applications: number;
  openings: number;
}

interface DashboardMetricsProps {
  initialData?: AdminMetrics;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
});

export default function DashboardMetrics({ initialData }: DashboardMetricsProps) {
  // Use SWR for client-side data fetching with the initialData from server
  const { data, error, isLoading } = useSWR<AdminMetrics>(
    '/api/admin/stats',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      fallbackData: initialData, // Use server-fetched data initially
      revalidateOnFocus: false, // Don't revalidate on window focus to reduce API calls
    }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard 
        title="Employers" 
        value={data?.employerCount || 0} 
        icon={Building}
        bgColor="bg-blue-50"
        iconColor="text-blue-500"
        loading={isLoading && !data}
      />
      <StatCard 
        title="Job Seekers" 
        value={data?.jobSeekerCount || 0} 
        icon={Users}
        bgColor="bg-green-50"
        iconColor="text-green-500"
        loading={isLoading && !data}
      />
      <StatCard 
        title="Jobs Posted" 
        value={data?.jobsPosted || 0} 
        icon={Briefcase}
        bgColor="bg-yellow-50"
        iconColor="text-yellow-500"
        loading={isLoading && !data}
      />
      <StatCard 
        title="Job Openings" 
        value={data?.openings || 0} 
        icon={FileSearch}
        bgColor="bg-indigo-50"
        iconColor="text-indigo-500"
        loading={isLoading && !data}
      />
      <StatCard 
        title="Applications" 
        value={data?.applications || 0} 
        icon={ClipboardList}
        bgColor="bg-purple-50"
        iconColor="text-purple-500"
        loading={isLoading && !data}
      />
      {error && (
        <div className="col-span-5 bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
          <h3 className="font-medium mb-2">Error</h3>
          <p>Failed to load dashboard metrics. Please refresh the page.</p>
        </div>
      )}
    </div>
  );
} 
