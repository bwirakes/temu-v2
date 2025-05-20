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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Get callback URL from search params for redirect after Google auth
      const callbackUrl = searchParams.get('callbackUrl');
      
      // Sign in with Google, passing the callback URL
      const res = await signIn('google', {
        redirect: false,
        callbackUrl: callbackUrl ? decodeURIComponent(callbackUrl) : undefined
      });
      
      if (res?.error) {
        setServerError('Gagal masuk dengan Google. Silakan coba lagi.');
        setIsLoading(false);
        return;
      }
      
      // Get session to determine user type
      const session = await getSession();
      // Safely access userType with type assertion
      const userType = (session?.user as ExtendedUser | undefined)?.userType;
      
      // Get redirect URL (either callback URL or default path)
      const redirectUrl = getRedirectUrl(userType);
      router.push(redirectUrl);
    } catch (error) {
      console.error("Google sign in error:", error);
      setServerError('Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.');
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
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-r-transparent animate-spin inline-block rounded-full" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-4 h-auto" width="46" height="47" viewBox="0 0 46 47" fill="none">
                  <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4"/>
                  <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853"/>
                  <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05"/>
                  <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335"/>
                </svg>
                Masuk dengan Google
              </>
            )}
          </button>

          <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-gray-200 before:me-6 after:flex-1 after:border-t after:border-gray-200 after:ms-6 dark:text-neutral-500 dark:before:border-neutral-600 dark:after:border-neutral-600">
            Atau
          </div>

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
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="shrink-0 mt-0.5 border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ms-3 text-sm dark:text-white">
                  Ingat saya
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting || isLoading ? (
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