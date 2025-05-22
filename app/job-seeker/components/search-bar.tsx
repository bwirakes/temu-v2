'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
}

export default function SearchBar({ 
  placeholder = "Cari lowongan (judul, perusahaan, lokasi, keahlian)...",
  initialQuery = ''
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  // Sync with initialQuery prop when it changes (e.g., during navigation)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct new URL with search parameters
    const params = new URLSearchParams(searchParams.toString());
    
    // Set or delete search query parameter
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    // Navigate to the updated URL
    router.push(`/job-seeker/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex rounded-md shadow-sm">
        <div className="relative flex-grow focus-within:z-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full rounded-l-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:z-10"
        >
          Cari
        </button>
      </div>
    </form>
  );
} 