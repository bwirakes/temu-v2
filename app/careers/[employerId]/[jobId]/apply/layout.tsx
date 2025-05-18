import { Metadata } from 'next';
import { getJobById, getJobByHumanId, getEmployerById } from '@/lib/db';
import { notFound } from 'next/navigation';

// Metadata 
export async function generateMetadata(
  { params }: { params: { employerId: string; jobId: string } }
): Promise<Metadata> {
  // Check if jobId is a UUID or a human-readable ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.jobId);
  
  // Use the appropriate function based on the ID format
  const job = isUuid 
    ? await getJobById(params.jobId)
    : await getJobByHumanId(params.jobId);
    
  const employer = job ? await getEmployerById(job.employerId) : null;

  if (!job || !employer) {
    return {
      title: 'Lowongan Tidak Ditemukan',
      description: 'Lowongan yang diminta tidak dapat ditemukan.',
    };
  }

  return {
    title: `Lamar ${job.jobTitle} di ${employer.namaPerusahaan}`,
    description: `Isi formulir lamaran kerja untuk posisi ${job.jobTitle} di ${employer.namaPerusahaan}`,
  };
}

export default function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 