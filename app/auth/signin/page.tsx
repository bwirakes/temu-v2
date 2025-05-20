'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Masukkan alamat email yang valid'),
  password: z.string().min(8, 'Minimal 8 karakter diperlukan'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

// Extend the standard session user type
interface ExtendedUser {
  userType?: 'job_seeker' | 'employer';
  [key: string]: any;
}

// Helper function to validate callback URL
const isValidCallbackUrl = (url: string): boolean => {
  // Basic security check - ensure the URL is relative and doesn't contain protocol/domain bypasses
  if (!url.startsWith('/') || url.startsWith('//') || url.includes(':')) {
    return false;
  }
  
  // Allow paths for job applications and other valid internal paths
  const validPrefixes = [
    '/careers/',
    '/job-seeker/',
    '/employer/',
    '/auth/',
    '/dashboard',
    '/profile',
    '/applications',
    '/jobs',
    '/api/auth/apply' // Also allow the API route for apply
  ];
  
  return validPrefixes.some(prefix => url.startsWith(prefix));
};

// Loading fallback component
function SignInLoadingFallback() {
  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700 w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="p-4 sm:p-7 flex justify-center items-center">
        <div className="h-8 w-8 border-4 border-blue-500 border-r-transparent animate-spin rounded-full"></div>
      </div>
    </div>
  );
}

// Main SignIn component that uses useSearchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  // Function to determine redirect path based on user type
  const getRedirectPath = (userType: string | undefined): string => {
    if (!userType) {
      return '/';
    }
    
    switch(userType) {
      case 'job_seeker':
        return '/job-seeker';
      case 'employer':
        return '/employer';
      default:
        return '/';
    }
  };
  
  // Function to get safe callback URL or default path
  const getRedirectUrl = (userType: string | undefined): string => {
    const callbackUrl = searchParams.get('callbackUrl');
    
    if (callbackUrl && isValidCallbackUrl(decodeURIComponent(callbackUrl))) {
      return decodeURIComponent(callbackUrl);
    }
    
    return getRedirectPath(userType);
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null);
      setIsLoading(true);
      
      // Sign in with credentials
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      
      if (res?.error) {
        setServerError('Email atau kata sandi tidak valid');
        setIsLoading(false);
        return;
      }
      
      // Fetch session to get user type
      const session = await getSession();
      // Safely access userType with type assertion
      const userType = (session?.user as ExtendedUser | undefined)?.userType;
      
      // Get redirect URL (either callback URL or default path)
      const redirectUrl = getRedirectUrl(userType);
      router.push(redirectUrl);
    } catch (error) {
      console.error("Sign in error:", error);
      setServerError('Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700 w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="p-4 sm:p-7">
        <div className="text-center">
          <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Masuk</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Belum memiliki akun?{' '}
            <Link href="/auth/signup" className="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500">
              Daftar di sini
            </Link>
          </p>
        </div>

        <div className="mt-5">
          {serverError && <p className="text-sm text-red-600 mb-4">{serverError}</p>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-y-4">
              <div>
                <label htmlFor="email" className="block text-sm mb-2 dark:text-white">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`py-2.5 sm:py-3 px-4 block w-full border ${errors.email ? 'border-red-600' : 'border-gray-200'} rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600`}
                    aria-describedby="email-error"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-2" id="email-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label htmlFor="password" className="block text-sm mb-2 dark:text-white">
                    Kata Sandi
                  </label>
                  <Link href="/auth/forgot-password" className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500">
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className={`py-2.5 sm:py-3 px-4 block w-full border ${errors.password ? 'border-red-600' : 'border-gray-200'} rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600`}
                    aria-describedby="password-error"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-2" id="password-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <div className="flex">
                  <input
                    id="rememberMe"
                    {...register('rememberMe')}
                    type="checkbox"
                    className="shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-neutral-900"
                    disabled={isLoading}
                  />
                </div>
                <label htmlFor="rememberMe" className="text-sm text-gray-600 ms-2 dark:text-neutral-400">
                  Ingat saya
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin inline-block rounded-full" />
                    Memproses...
                  </>
                ) : 'Masuk'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Page component with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoadingFallback />}>
      <SignInContent />
    </Suspense>
  );
} 