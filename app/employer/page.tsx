import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CustomUser } from '@/lib/types';
import EmployerProfileForm from '@/components/employer-profile/employer-profile-form';
import { getEmployerProfileData } from '@/lib/actions/employer/profile';

// Mark this page as dynamic to prevent static generation errors with headers()
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Company Profile | Temu',
  description: 'Manage your company profile information',
};

/**
 * Server Component: Employer Profile Page
 * 
 * This component serves as the main page for the /employer route.
 * It fetches the employer profile data and renders the profile form.
 */
export default async function EmployerPage() {
  // Get auth session (cached by Next.js automatically)
  const session = await auth();
  
  // Get user from session
  const user = session?.user as CustomUser | undefined;
  
  // Redirect logic based on authentication and user type
  if (!user) {
    // User not authenticated, redirect to sign in with callback URL
    redirect('/auth/signin?callbackUrl=/employer');
  }
  
  if (user.userType !== 'employer') {
    // Wrong user type, redirect to home
    redirect('/');
  }
  
  console.log('Employer page: User authenticated, fetching profile data');
  
  try {
    // Fetch employer profile data
    const profileData = await getEmployerProfileData();
    console.log('Employer page: Profile data fetched successfully:', profileData ? 'Has data' : 'No data');
    
    return (
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Company Profile</h1>
          <p className="text-gray-500 mb-6">Manage your company information</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Profile Information
            </h2>
            <p className="text-sm text-gray-600">
              Complete your company profile to enhance your presence on our platform
            </p>
          </div>
          
          <div className="p-4 md:p-6">
            <Suspense fallback={<p>Loading profile...</p>}>
              <EmployerProfileForm initialData={profileData} />
            </Suspense>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Employer page: Error fetching profile data:', error);
    
    // Provide a fallback UI for error state
    return (
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Company Profile</h1>
          <p className="text-gray-500 mb-6">Manage your company information</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-4">
            We encountered an error while loading your profile data. Please try refreshing the page.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
} 