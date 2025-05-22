'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Gauge, Users, Briefcase, ClipboardList, Settings, LogOut, Building } from 'lucide-react';

// Admin navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/admin', icon: Gauge },
  { name: 'Employers', href: '/admin/employers', icon: Building },
  { name: 'Job Seekers', href: '/admin/job-seekers', icon: Users },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Applications', href: '/admin/applications', icon: ClipboardList },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                </div>
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Icon className="mr-3 h-5 w-5 text-gray-500 group-hover:text-gray-500" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              {/* User Profile & Sign Out */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <Link 
                  href="/api/auth/signout"
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <div>
                      {session?.user?.image && (
                        <div className="relative h-9 w-9 rounded-full overflow-hidden">
                          <Image
                            src={session.user.image}
                            alt="Profile"
                            fill
                            sizes="36px"
                            className="rounded-full"
                          />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {session?.user?.name || 'Admin'}
                      </p>
                      <div className="flex items-center text-xs font-medium text-gray-500 group-hover:text-gray-700">
                        <LogOut className="mr-1 h-3 w-3" />
                        Sign out
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex items-center">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-medium text-gray-800 ml-2">Admin Dashboard</h1>
          </div>
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 