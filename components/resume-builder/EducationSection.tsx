'use client';

import { GraduationCap } from 'lucide-react';

interface EducationItem {
  degree: string;
  school: string;
  period: string;
  description?: string;
  achievements?: string[];
  nilaiAkhir?: string;
}

interface EducationSectionProps {
  educationData?: EducationItem[];
}

export default function EducationSection({ educationData = [] }: EducationSectionProps) {
  if (!educationData?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        Education
      </h2>
      
      <div className="space-y-6">
        {educationData.map((item, index) => (
          <div key={index} className="relative pl-6 pb-4">
            {/* Timeline connector */}
            {index < educationData.length - 1 && (
              <div className="absolute left-[7px] top-[24px] bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700"></div>
            )}
            
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap size={16} className="text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.degree}</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm mb-2">
                <span className="font-medium text-blue-600 dark:text-blue-400">{item.school}</span>
                <span className="hidden sm:block text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">{item.period}</span>
                {item.description && (
                  <>
                    <span className="hidden sm:block text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.description}</span>
                  </>
                )}
                {item.nilaiAkhir && (
                  <>
                    <span className="hidden sm:block text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">GPA: {item.nilaiAkhir}</span>
                  </>
                )}
              </div>
              
              {item.achievements && item.achievements.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {item.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}