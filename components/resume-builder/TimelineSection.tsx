'use client';

import { Briefcase, FileText, Mail, PaintBucket, Slack } from 'lucide-react';

interface TimelineItem {
  period: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  responsibilities?: string[];
  icon?: string;
  gajiTerakhir?: string;
  alasanKeluar?: string;
}

interface TimelineSectionProps {
  experienceData?: TimelineItem[];
}

export default function TimelineSection({ experienceData = [] }: TimelineSectionProps) {
  if (!experienceData?.length) {
    return null;
  }

  // Function to render the appropriate icon
  const renderIcon = (iconType?: string) => {
    switch (iconType?.toLowerCase()) {
      case 'file':
        return <FileText size={16} className="text-blue-600" />;
      case 'palette':
        return <PaintBucket size={16} className="text-blue-600" />;
      case 'mail':
        return <Mail size={16} className="text-blue-600" />;
      case 'slack':
        return <Slack size={16} className="text-blue-600" />;
      default:
        return <Briefcase size={16} className="text-blue-600" />;
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        Work Experience
      </h2>
      
      <div className="space-y-6">
        {experienceData.map((item, index) => (
          <div key={index} className="relative pl-6 pb-4">
            {/* Timeline connector */}
            {index < experienceData.length - 1 && (
              <div className="absolute left-[7px] top-[24px] bottom-0 w-[2px] bg-gray-200 dark:bg-gray-700"></div>
            )}
            
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                {renderIcon(item.icon)}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm mb-2">
                <span className="font-medium text-blue-600 dark:text-blue-400">{item.company}</span>
                <span className="hidden sm:block text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">{item.period}</span>
                {item.location && (
                  <>
                    <span className="hidden sm:block text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.location}</span>
                  </>
                )}
              </div>
              
              {item.responsibilities && item.responsibilities.length > 0 ? (
                <ul className="mt-3 space-y-1.5 text-gray-700 dark:text-gray-300 list-disc pl-5">
                  {item.responsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              ) : item.description ? (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{item.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}