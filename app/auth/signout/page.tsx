'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the logout page
    router.replace('/auth/logout');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-r-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600 dark:text-neutral-400">Mengalihkan...</p>
      </div>
    </div>
  );
} 