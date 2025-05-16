'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';

export default function TrackApplicationPage() {
  const router = useRouter();
  const [referenceCode, setReferenceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceCode.trim()) {
      setError('Silakan masukkan kode referensi lamaran Anda');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real application, you would verify the reference code with an API
      // For now, we'll just simulate a verification with a timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demonstration, we'll accept any code that matches the format JA-YYYYMMDD-XXXXXX
      const isValidFormat = /^JA-\d{8}-[A-Z0-9]{6}$/.test(referenceCode);
      
      if (isValidFormat) {
        // Navigate to a details page with the reference code
        router.push(`/job-application/track/${encodeURIComponent(referenceCode)}`);
      } else {
        setError('Kode referensi tidak valid. Format yang benar adalah JA-YYYYMMDD-XXXXXX');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memverifikasi kode referensi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">Lacak Status Lamaran</h1>
            <p className="mt-2 text-sm text-gray-500">
              Masukkan kode referensi lamaran Anda untuk melihat status terkini.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="referenceCode" className="sr-only">
                    Kode Referensi
                  </label>
                  <input
                    type="text"
                    id="referenceCode"
                    name="referenceCode"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: JA-20230101-ABC123"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {isSubmitting ? (
                    "Mencari..."
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Lacak
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900">Tidak memiliki kode referensi?</h2>
              <p className="mt-2 text-sm text-gray-500">
                Kode referensi diberikan setelah Anda mengirimkan lamaran. Jika Anda belum melamar, 
                silakan kunjungi halaman lamaran pekerjaan kami.
              </p>
              <div className="mt-4">
                <Link
                  href="/job-application/apply"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Lamar Pekerjaan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 