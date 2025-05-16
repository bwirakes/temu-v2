"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingSuccessPage() {
  const router = useRouter();

  // Redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pendaftaran Berhasil!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Terima kasih telah melengkapi profil Anda. Kami akan menghubungi Anda
          jika ada lowongan yang sesuai dengan kualifikasi Anda.
        </p>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150"
          >
            Lihat Dashboard
          </Link>
          <Link
            href="/jobs"
            className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-lg border border-blue-200 transition duration-150"
          >
            Telusuri Lowongan
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Anda akan dialihkan ke dashboard dalam beberapa detik...
        </p>
      </div>
    </div>
  );
}