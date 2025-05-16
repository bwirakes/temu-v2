'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';

// Define user types
export type UserType = 'job_seeker' | 'employer';

const signupSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Masukkan alamat email yang valid'),
  password: z.string().min(8, 'Minimal 8 karakter diperlukan'),
  confirmPassword: z.string().min(8, 'Minimal 8 karakter diperlukan'),
  userType: z.enum(['job_seeker', 'employer'], {
    required_error: 'Pilih jenis pengguna',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ['confirmPassword']
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      userType: undefined
    }
  });

  const selectedUserType = watch('userType');

  const onSubmit = async (data: SignupForm) => {
    setServerError(null);
    setIsRegistering(true);
    
    try {
      // Step 1: Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          userType: data.userType
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Gagal mendaftar');
        setIsRegistering(false);
        return;
      }

      // Step 2: Automatically sign in the user
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password
      });

      if (signInResult?.error) {
        setServerError('Pendaftaran berhasil, tetapi gagal masuk secara otomatis. Silakan coba masuk secara manual.');
        router.push('/auth/signin');
        return;
      }

      // Step 3: Redirect based on user type
      if (data.userType === 'job_seeker') {
        router.push('/job-seeker/onboarding');
      } else {
        router.push('/employer/onboarding');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-2xs dark:bg-neutral-900 dark:border-neutral-700 w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="p-4 sm:p-7">
        <div className="text-center">
          <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Daftar</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
            Sudah memiliki akun?{' '}
            <Link href="/auth/signin" className="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500">
              Masuk di sini
            </Link>
          </p>
        </div>

        <div className="mt-5">
          {serverError && <p className="text-sm text-red-600 mb-4">{serverError}</p>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-y-4">
              <div>
                <label htmlFor="name" className="block text-sm mb-2 dark:text-white">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`py-2.5 sm:py-3 px-4 block w-full border ${errors.name ? 'border-red-600' : 'border-gray-200'} rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600`}
                    aria-describedby="name-error"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 mt-2" id="name-error">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-2" id="email-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm mb-2 dark:text-white">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className={`py-2.5 sm:py-3 px-4 block w-full border ${errors.password ? 'border-red-600' : 'border-gray-200'} rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600`}
                    aria-describedby="password-error"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-2" id="password-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm mb-2 dark:text-white">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    className={`py-2.5 sm:py-3 px-4 block w-full border ${errors.confirmPassword ? 'border-red-600' : 'border-gray-200'} rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600`}
                    aria-describedby="confirm-password-error"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-2" id="confirm-password-error">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm mb-2 dark:text-white">
                  Jenis Pengguna
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input 
                      type="radio" 
                      id="job_seeker" 
                      value="job_seeker" 
                      {...register('userType')} 
                      className="peer sr-only" 
                    />
                    <label 
                      htmlFor="job_seeker" 
                      className={`block p-3 border rounded-lg cursor-pointer text-center transition-all ${
                        selectedUserType === 'job_seeker' 
                          ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-500' 
                          : 'bg-white border-gray-200 hover:border-blue-600 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-blue-500'
                      }`}
                    >
                      <span className="block font-medium">Pencari Kerja</span>
                    </label>
                  </div>
                  <div>
                    <input 
                      type="radio" 
                      id="employer" 
                      value="employer" 
                      {...register('userType')} 
                      className="peer sr-only" 
                    />
                    <label 
                      htmlFor="employer" 
                      className={`block p-3 border rounded-lg cursor-pointer text-center transition-all ${
                        selectedUserType === 'employer' 
                          ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-500' 
                          : 'bg-white border-gray-200 hover:border-blue-600 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-blue-500'
                      }`}
                    >
                      <span className="block font-medium">Perusahaan</span>
                    </label>
                  </div>
                </div>
                {errors.userType && (
                  <p className="text-xs text-red-600 mt-2">
                    {errors.userType.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isRegistering}
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting || isRegistering ? 'Membuat akun...' : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 