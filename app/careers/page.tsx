'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { eq, count, gt, desc, ilike, or, and } from 'drizzle-orm';
import { employers, jobs } from '@/lib/db';
import SearchBar from './components/search-bar';
import EmployerLogo from './components/employer-logo';
import { useEffect, useState } from 'react';
import CareersLoader from './components/careers-loader';

// Pagination constants
const ITEMS_PER_PAGE_INITIAL = 30;
const ITEMS_PER_PAGE_INCREMENT = 30;

// Types
interface EmployerWithJobCount {
  id: string;
  namaPerusahaan: string;
  merekUsaha: string | null;
  industri: string;
  logoUrl: string | null;
  jobCount: number;
}

// Main page component
export default function CareersPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [employers, setEmployers] = useState<EmployerWithJobCount[]>([]);
  const [hasMore, setHasMore] = useState(false);
  
  // Get search parameters
  const searchQuery = searchParams.get('q') || '';
  const limitParam = searchParams.get('limit') 
    ? parseInt(searchParams.get('limit') || '', 10) 
    : ITEMS_PER_PAGE_INITIAL;
  const currentLimit = isNaN(limitParam) ? ITEMS_PER_PAGE_INITIAL : limitParam;

  // Fetch employers data
  useEffect(() => {
    async function fetchEmployers() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/employers?${new URLSearchParams({
            ...(searchQuery ? { q: searchQuery } : {}),
            limit: (currentLimit + 1).toString()
          }).toString()}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch employers');
        }
        
        const data = await response.json();
        
        // Check if there are more items
        const hasMoreItems = data.length > currentLimit;
        setHasMore(hasMoreItems);
        
        // Remove the extra item we fetched to check for more
        const displayedData = hasMoreItems 
          ? data.slice(0, currentLimit) 
          : data;
          
        setEmployers(displayedData);
      } catch (error) {
        console.error('Error fetching employers:', error);
        setEmployers([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmployers();
  }, [searchQuery, currentLimit]);

  return (
    <div className="bg-notion-background min-h-screen">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      <div className="notion-container py-16 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero section */}
        <div className="mb-16">
          <h1 className="text-notion-title mb-6 text-4xl md:text-5xl font-bold">
            Job Fair Nasional Tahun 2025
          </h1>
          <p className="text-lg text-notion-text-light max-w-2xl">
            Jelajahi peluang kerja dari perusahaan terkemuka dan ambil langkah selanjutnya dalam perjalanan karir Anda.
          </p>
          
          {/* Search bar with initial query */}
          <div className="mt-10 max-w-md">
            <SearchBar initialQuery={searchQuery} />
          </div>
        </div>

        {/* Employers section */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-xl font-medium text-notion-text flex items-center">
              <svg className="w-6 h-6 mr-2 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              {searchQuery 
                ? `Hasil Pencarian: "${searchQuery}"` 
                : "Perusahaan yang Sedang Merekrut"}
            </h2>
            {searchQuery && (
              <Link 
                href="/careers" 
                className="text-notion-blue hover:text-notion-blue-dark flex items-center mt-2 sm:mt-0"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Lihat Semua Perusahaan
              </Link>
            )}
          </div>

          {loading ? (
            <CareersLoader />
          ) : (
            <EmployersListDisplay 
              employers={employers} 
              hasMore={hasMore} 
              currentLimit={currentLimit} 
              searchQuery={searchQuery}
            />
          )}
        </div>

        {/* Notion-style divider */}
        <div className="notion-divider"></div>

        {/* Call to action */}
        <div className="my-16">
          <div className="bg-notion-background-gray rounded-notion border border-notion-border p-8 md:p-12 shadow-sm">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-xl font-medium text-notion-text mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 mr-2 text-notion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span className="notion-highlight">Apakah Anda perusahaan yang ingin merekrut?</span>
              </h2>
              <p className="text-notion-text-light mb-8">
                Posting lowongan pekerjaan Anda dan jangkau ribuan kandidat berkualitas.
              </p>
              <div>
                <Link
                  href="/employer/register"
                  className="notion-button flex items-center justify-center gap-2 mx-auto w-auto inline-flex hover:bg-notion-blue-dark transition-colors duration-150"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Daftar sebagai Perusahaan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Employers list display component
function EmployersListDisplay({ 
  employers, 
  hasMore, 
  currentLimit, 
  searchQuery 
}: { 
  employers: EmployerWithJobCount[]; 
  hasMore: boolean; 
  currentLimit: number; 
  searchQuery?: string;
}) {
  if (employers.length === 0) {
    // No results message - context-aware based on search query
    return (
      <div className="notion-card p-8 text-center shadow-sm">
        <div className="flex justify-center mb-4 text-notion-text-light">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium text-notion-text mb-2">Tidak ada hasil pencarian</h3>
            <p className="text-notion-text-light">
              Kami tidak dapat menemukan perusahaan yang cocok dengan pencarian &quot;{searchQuery}&quot;. 
              Silakan coba kata kunci lain.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-notion-text mb-2">Tidak ada perusahaan yang sedang merekrut</h3>
            <p className="text-notion-text-light">
              Saat ini tidak ada lowongan pekerjaan yang tersedia. Silakan periksa kembali nanti.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {employers.map((employer) => (
          <div 
            key={employer.id}
            className="notion-card card-hover shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6 border-b border-notion-border">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <EmployerLogo 
                    logoUrl={employer.logoUrl} 
                    companyName={employer.namaPerusahaan} 
                    size="sm"
                  />
                </div>
                <div>
                  <h3 className="text-base font-medium text-notion-text">
                    {employer.namaPerusahaan}
                    {employer.merekUsaha && ` (${employer.merekUsaha})`}
                  </h3>
                  <p className="text-sm text-notion-text-light mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-notion-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {employer.industri}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-notion text-xs font-medium bg-notion-highlight-green text-notion-text">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    {employer.jobCount} posisi terbuka
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <Link
                href={`/careers/${employer.id}`}
                className="notion-button w-full flex justify-center items-center gap-2 hover:bg-notion-blue-dark transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                </svg>
                Lihat Lowongan
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Link
            href={`/careers?${new URLSearchParams({
              ...(searchQuery ? { q: searchQuery } : {}),
              limit: (currentLimit + ITEMS_PER_PAGE_INCREMENT).toString()
            }).toString()}`}
            className="notion-button flex items-center gap-2 hover:bg-notion-blue-dark transition-colors duration-150"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            Tampilkan Lebih Banyak
          </Link>
        </div>
      )}
    </div>
  );
} 
