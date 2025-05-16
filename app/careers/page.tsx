import Link from 'next/link';
import { db } from '@/lib/db';
import { eq, count, gt, desc } from 'drizzle-orm';
import { employers, jobs } from '@/lib/db';
import SearchBar from './components/search-bar';
import EmployerLogo from './components/employer-logo';

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
    .orderBy(desc(count(jobs.id)));

  return employersWithJobs;
}

export default async function CareersPage() {
  const employersWithJobs = await getEmployersWithJobCounts();

  return (
    <div className="bg-notion-background min-h-screen">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      <div className="notion-container py-16">
        {/* Hero section */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-notion-title mb-6">
            Job Fair Nasional Tahun 2025
          </h1>
          <p className="text-lg text-notion-text-light max-w-2xl animation-delay-100 animate-fade-in">
            Jelajahi peluang kerja dari perusahaan terkemuka dan ambil langkah selanjutnya dalam perjalanan karir Anda.
          </p>
          
          {/* Search bar */}
          <div className="mt-10 max-w-md animation-delay-200 animate-fade-in">
            <SearchBar />
          </div>
        </div>

        {/* Employers section */}
        <div className="mb-20 animation-delay-300 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-xl font-medium text-notion-text">Perusahaan yang Sedang Merekrut</h2>
            <p className="text-sm text-notion-text-light mt-1 sm:mt-0">
              {employersWithJobs.length} perusahaan dengan posisi terbuka
            </p>
          </div>

          {employersWithJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {employersWithJobs.map((employer, index) => (
                <div 
                  key={employer.id}
                  className={`notion-card card-hover animation-delay-${(index % 5) * 100} animate-fade-in`}
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
                        <p className="text-sm text-notion-text-light mb-2">{employer.industri}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-notion text-xs font-medium bg-notion-highlight-blue text-notion-text">
                          {employer.jobCount} posisi terbuka
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Link
                      href={`/careers/${employer.id}`}
                      className="notion-button w-full flex justify-center"
                    >
                      Lihat Lowongan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="notion-card p-8 text-center animation-delay-300 animate-fade-in">
              <h3 className="text-lg font-medium text-notion-text mb-2">Tidak ada perusahaan yang sedang merekrut</h3>
              <p className="text-notion-text-light">
                Saat ini tidak ada lowongan pekerjaan yang tersedia. Silakan periksa kembali nanti.
              </p>
            </div>
          )}
        </div>

        {/* Notion-style divider */}
        <div className="notion-divider animation-delay-400 animate-fade-in"></div>

        {/* Call to action */}
        <div className="my-16 animation-delay-500 animate-fade-in">
          <div className="bg-notion-background-gray rounded-notion border border-notion-border p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-xl font-medium text-notion-text mb-4">
                <span className="notion-highlight">Apakah Anda perusahaan yang ingin merekrut?</span>
              </h2>
              <p className="text-notion-text-light mb-8">
                Posting lowongan pekerjaan Anda dan jangkau ribuan kandidat berkualitas.
              </p>
              <div>
                <Link
                  href="/employer/register"
                  className="notion-button"
                >
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
