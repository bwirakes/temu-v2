import { Metadata } from 'next';
import { db } from '@/lib/db';
import { jobs, employers } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import SearchBar from '../components/search-bar';
import { Suspense } from 'react';
import JobsLoader from './components/jobs-loader';
import JobsList from './components/JobsList';

// Use ISR with revalidation
export const revalidate = 3600; // Revalidate every hour

// Metadata
export const metadata: Metadata = {
  title: 'Temukan Pekerjaan Impian Anda',
  description: 'Jelajahi peluang kerja yang tersedia. Temukan peluang karir berikutnya bersama kami.',
};

// Jobs list content component
async function JobsContent() {
  // Fetch jobs with their employers
  const dbJobsWithEmployers = await db
    .select({
      id: jobs.id,
      jobId: jobs.jobId,
      jobTitle: jobs.jobTitle,
      postedDate: jobs.postedDate,
      numberOfPositions: jobs.numberOfPositions,
      isConfirmed: jobs.isConfirmed,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      employerId: jobs.employerId,
      minWorkExperience: jobs.minWorkExperience,
      lokasiKerja: jobs.lokasiKerja,
      lastEducation: jobs.lastEducation,
      requiredCompetencies: jobs.requiredCompetencies,
      expectations: jobs.expectations,
      additionalRequirements: jobs.additionalRequirements,
      employer: {
        namaPerusahaan: employers.namaPerusahaan,
        logoUrl: employers.logoUrl
      }
    })
    .from(jobs)
    .leftJoin(employers, eq(jobs.employerId, employers.id))
    .where(eq(jobs.isConfirmed, true))
    .orderBy(desc(jobs.postedDate));

  // We don't need to manually map the jobs as the JobsList component will handle that
  // The JobsList component has the mapDbJobToFrontendJob function to correctly map enum values
  return <JobsList jobsData={dbJobsWithEmployers} />;
}

// Main page component
export default function JobsPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-notion-text mb-4">Temukan Pekerjaan Impian Anda</h1>
        <p className="text-xl text-notion-text-light max-w-2xl mx-auto">
          Jelajahi berbagai peluang karir yang tersedia. Kami membantu Anda menemukan pekerjaan yang sesuai dengan keterampilan dan minat Anda.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <SearchBar />
      </div>

      <Suspense fallback={<JobsLoader />}>
        <JobsContent />
      </Suspense>
    </main>
  );
} 
