import { Suspense } from 'react';
import { Metadata } from 'next';
import ProfileClient from '@/components/job-seeker/profile/ProfileClient';
import ProfileSkeleton from '@/components/job-seeker/profile/ProfileSkeleton';
import { getProfileData } from './actions';

// Mark this page as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil Pencari Kerja | Temu',
  description: 'Kelola profil pencari kerja Anda',
};

// Remove ISR revalidation since we're using force-dynamic
// export const revalidate = 60; // Revalidate at most once per minute

export default async function ProfilePage() {
  // Fetch profile data using the server action
  // This handles auth, authorization, and data fetching
  const profileData = await getProfileData();
  
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
            <ProfileClient initialProfileData={profileData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 