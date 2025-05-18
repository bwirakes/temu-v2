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
    <div className="max-w-[85rem] mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Profil Saya</h1>
        <p className="text-gray-500 mb-6">Kelola informasi profil pencari kerja Anda</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Informasi Profil
          </h2>
          <p className="text-sm text-gray-600">
            Lengkapi profil Anda untuk meningkatkan peluang mendapatkan pekerjaan
          </p>
        </div>
        
        <div className="p-4 md:p-6">
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileClient userId={session.user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 