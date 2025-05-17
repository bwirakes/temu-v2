import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getUserProfileByUserId } from '@/lib/db';
import ProfileClient from '@/components/job-seeker/profile/ProfileClient';
import ProfileSkeleton from '@/components/job-seeker/profile/ProfileSkeleton';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profil Pencari Kerja | Temu',
  description: 'Kelola profil pencari kerja Anda',
};

// Enable ISR for this page
export const revalidate = 60; // Revalidate at most once per minute

// This ensures the page is server-rendered but allows client side navigation
export const dynamic = 'force-dynamic';

async function getProfileData(userId: string) {
  try {
    return await getUserProfileByUserId(userId);
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return null;
  }
}

export default async function ProfilePage() {
  // Fetch the session on the server side
  const session = await auth();
  
  // Verify authentication - if no user ID, redirect
  if (!session?.user?.id) {
    console.log('Profile page: No authenticated user found, redirecting to signin');
    // Use a full URL to ensure the callback works properly
    return redirect('/auth/signin?callbackUrl=/job-seeker/profile');
  }
  
  // Verify user type for additional security
  const userType = (session.user as any).userType;
  if (userType !== 'job_seeker') {
    console.log('Profile page: Non-job-seeker attempting to access profile, redirecting');
    return redirect('/');
  }
  
  // Prefetch profile data (useful for SEO and initial load)
  const profileData = await getProfileData(session.user.id);
  
  // If no profile data exists, the client component will handle showing the appropriate UI
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-4xl">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil Saya</h1>
        <p className="text-blue-700">
          Lengkapi profil Anda untuk meningkatkan peluang mendapatkan pekerjaan yang sesuai
        </p>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileClient userId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
} 