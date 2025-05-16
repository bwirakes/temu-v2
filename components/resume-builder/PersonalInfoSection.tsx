'use client';

import { 
  Calendar, 
  MapPin, 
  User, 
  Heart, 
  BookOpen, 
  Ruler, 
  Scale
} from 'lucide-react';

interface PersonalInfoSectionProps {
  tanggalLahir?: string;
  tempatLahir?: string;
  jenisKelamin?: string;
  statusPernikahan?: string;
  agama?: string;
  tinggiBadan?: number;
  beratBadan?: number;
}

export default function PersonalInfoSection({
  tanggalLahir,
  tempatLahir,
  jenisKelamin,
  statusPernikahan,
  agama,
  tinggiBadan,
  beratBadan
}: PersonalInfoSectionProps) {
  // Format date of birth if available
  const formattedDateOfBirth = tanggalLahir 
    ? new Date(tanggalLahir).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  // Check if we have any personal info to display
  const hasPersonalInfo = formattedDateOfBirth || tempatLahir || jenisKelamin || statusPernikahan || agama || tinggiBadan || beratBadan;
  
  if (!hasPersonalInfo) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {formattedDateOfBirth && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</h3>
            <p className="text-gray-900 dark:text-white">{formattedDateOfBirth}</p>
          </div>
        )}
        
        {tempatLahir && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Place of Birth</h3>
            <p className="text-gray-900 dark:text-white">{tempatLahir}</p>
          </div>
        )}
        
        {jenisKelamin && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h3>
            <p className="text-gray-900 dark:text-white">{jenisKelamin}</p>
          </div>
        )}
        
        {statusPernikahan && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Marital Status</h3>
            <p className="text-gray-900 dark:text-white">{statusPernikahan}</p>
          </div>
        )}
        
        {agama && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Religion</h3>
            <p className="text-gray-900 dark:text-white">{agama}</p>
          </div>
        )}
        
        {(tinggiBadan || beratBadan) && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Physical</h3>
            <p className="text-gray-900 dark:text-white">
              {tinggiBadan && `${tinggiBadan} cm`}
              {tinggiBadan && beratBadan && ', '}
              {beratBadan && `${beratBadan} kg`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
} 