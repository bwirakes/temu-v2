'use client';

import { 
  Briefcase, 
  Clock, 
  Bus, 
  User
} from 'lucide-react';

interface WorkSummarySectionProps {
  levelPengalaman?: string;
  status_pekerjaan?: string;
  transportation_for_work?: string;
  alasanKeluarLainnya?: string;
}

export default function WorkSummarySection({
  levelPengalaman,
  status_pekerjaan,
  transportation_for_work,
  alasanKeluarLainnya
}: WorkSummarySectionProps) {
  // Check if we have any work summary info to display
  const hasWorkSummaryInfo = levelPengalaman || status_pekerjaan || transportation_for_work || alasanKeluarLainnya;
  
  if (!hasWorkSummaryInfo) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        Work Summary
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {levelPengalaman && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience Level</h3>
            <p className="text-gray-900 dark:text-white">{levelPengalaman}</p>
          </div>
        )}
        
        {status_pekerjaan && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Employment Status</h3>
            <p className="text-gray-900 dark:text-white">{status_pekerjaan}</p>
          </div>
        )}
        
        {transportation_for_work && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transportation</h3>
            <p className="text-gray-900 dark:text-white">{transportation_for_work}</p>
          </div>
        )}
        
        {alasanKeluarLainnya && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason for Seeking New Job</h3>
            <p className="text-gray-900 dark:text-white">{alasanKeluarLainnya}</p>
          </div>
        )}
      </div>
    </section>
  );
} 