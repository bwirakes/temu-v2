import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { eq, count, gt } from 'drizzle-orm';
import { employers, jobs } from '@/lib/db';

// Add export config for ISR
export const revalidate = 3600; // Revalidate every hour

// Types
interface EmployerWithJobCount {
  id: string;
  namaPerusahaan: string;
  merekUsaha: string | null;
  industri: string;
  logoUrl: string | null;
  jobCount: number;
}

async function getEmployersWithJobCounts(): Promise<EmployerWithJobCount[]> {
  // Get all employers with at least one confirmed job
  const employersWithJobs = await db
    .select({
      id: employers.id,
      namaPerusahaan: employers.namaPerusahaan,
      merekUsaha: employers.merekUsaha,
      industri: employers.industri,
      logoUrl: employers.logoUrl,
      jobCount: count(jobs.id),
    })
    .from(employers)
    .leftJoin(jobs, eq(employers.id, jobs.employerId))
    .where(eq(jobs.isConfirmed, true))
    .groupBy(employers.id)
    .having(gt(count(jobs.id), 0))
    .orderBy(count(jobs.id));

  return employersWithJobs;
}

export default async function CareersPage() {
  const employersWithJobs = await getEmployersWithJobCounts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Find Your Next Career
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Browse job opportunities from top employers and take the next step in your career journey.
          </p>
        </div>

        {/* Employers section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Companies Hiring Now</h2>

        {employersWithJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employersWithJobs.map((employer) => (
              <Link
                key={employer.id}
                href={`/careers/${employer.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  {employer.logoUrl ? (
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={employer.logoUrl}
                        alt={employer.namaPerusahaan}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-gray-500">
                        {employer.namaPerusahaan.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {employer.namaPerusahaan}
                      {employer.merekUsaha && ` (${employer.merekUsaha})`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{employer.industri}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {employer.jobCount} open position{employer.jobCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No employers currently hiring</h3>
            <p className="text-gray-600">
              There are currently no job openings available. Please check back later.
            </p>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-16 bg-blue-600 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white">
                Are you an employer looking to hire?
              </h2>
              <p className="mt-4 text-lg leading-6 text-blue-100">
                Post your job openings and reach thousands of qualified candidates.
              </p>
              <div className="mt-8">
                <Link
                  href="/employer/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Register as Employer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
