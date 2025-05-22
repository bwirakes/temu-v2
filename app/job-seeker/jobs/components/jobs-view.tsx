'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBar from '../../components/search-bar';
import JobsLoader from './jobs-loader';
import JobsList from './JobsList';

export default function JobsView() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [jobsData, setJobsData] = useState([]);
  
  // Extract search query from search params
  const searchQuery = searchParams.get('q') || '';

  // Fetch jobs data
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/jobs?${new URLSearchParams({
            ...(searchQuery ? { q: searchQuery } : {})
          }).toString()}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const data = await response.json();
        setJobsData(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobsData([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [searchQuery]);

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-notion-text mb-4">Temukan Pekerjaan Impian Anda</h1>
        <p className="text-xl text-notion-text-light max-w-2xl mx-auto">
          Jelajahi berbagai peluang karir yang tersedia. Kami membantu Anda menemukan pekerjaan yang sesuai dengan keterampilan dan minat Anda.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <SearchBar initialQuery={searchQuery} />
      </div>

      {loading ? (
        <JobsLoader />
      ) : (
        <JobsList jobsData={jobsData} />
      )}
    </main>
  );
} 