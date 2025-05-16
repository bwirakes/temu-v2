'use client';

import { Award } from 'lucide-react';

interface Certification {
  nama: string;
  penerbit: string;
  tanggalTerbit: string;
}

interface CertificationsSectionProps {
  certifications: Certification[];
}

export default function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (!certifications?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        Certifications
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <Award className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {cert.nama}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-300">{cert.penerbit}</span>
                <span className="hidden sm:block text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(cert.tanggalTerbit).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 