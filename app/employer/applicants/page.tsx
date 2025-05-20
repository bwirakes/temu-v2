import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getEmployerByUserId } from '@/lib/db';
import AllApplicantsClient from './components/all-applicants-client';
import { ApplicantRow } from './types';
import { getApplicantsForEmployer } from './actions';

export default async function ApplicantsPage() {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Get employer ID from the user ID
  const employer = session.user.id ? await getEmployerByUserId(session.user.id) : null;

  if (!employer) {
    redirect('/employer/onboarding');
  }

  // Check user type
  const userType = (session.user as any).userType;
  if (userType !== 'employer') {
    redirect('/login');
  }

  // Fetch applicants data using a server action
  const applicants = await getApplicantsForEmployer(employer.id);

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Daftar Pelamar</h1>
          <p className="text-muted-foreground mt-1">
            Lihat dan kelola semua pelamar kerja di organisasi Anda
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <AllApplicantsClient initialApplicants={applicants} />
        </Suspense>
      </div>
    </div>
  );
} 