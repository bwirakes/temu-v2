import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Mail, Slack, Briefcase, MapPin, DollarSign, LogOut
} from 'lucide-react';

interface TimelineItemProps {
  period: string;
  title: string;
  company?: string;
  description: string;
  responsibilities?: string[];
  projectTitle?: string;
  projectDescription?: string;
  projectImage?: string;
  icon: string;
  isLast: boolean;
  lokasi?: string;
  gajiTerakhir?: string;
  alasanKeluar?: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  period, 
  title, 
  company, 
  description, 
  responsibilities, 
  projectTitle, 
  projectDescription, 
  projectImage, 
  icon, 
  isLast,
  lokasi,
  gajiTerakhir,
  alasanKeluar
}) => {

  const getIcon = () => {
    switch(icon) {
      case 'file':
        return <FileText className="size-5 text-indigo-500" />;
      case 'mail':
        return <Mail className="size-5 text-yellow-500" />;
      case 'slack':
        return <Slack className="size-5 text-purple-500" />;
      case 'briefcase':
      default:
        return <Briefcase className="size-5 text-gray-500" />;
    }
  };

  return (
    <motion.div 
      className="relative flex gap-x-5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon and line */}
      <div className="relative">
        <div className={`relative z-10 size-10 flex justify-center items-center rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm ${isLast ? '' : 'after:absolute after:top-10 after:bottom-0 after:start-1/2 after:w-px after:-translate-x-1/2 after:bg-gray-200 dark:after:bg-gray-600'}`}>
          {getIcon()}
        </div>
      </div>

      {/* Content */}
      <div className={`grow ${isLast ? '' : 'pb-8'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {period}
          </h3>
          {company && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
              {company}
            </span>
          )}
        </div>

        <p className="font-semibold text-lg text-gray-800 dark:text-white">
          {title}
        </p>

        {description && (
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-3">
          {lokasi && (
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={14} />
              <span>{lokasi}</span>
            </div>
          )}
          
          {gajiTerakhir && (
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <DollarSign size={14} />
              <span>{gajiTerakhir}</span>
            </div>
          )}
          
          {alasanKeluar && (
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <LogOut size={14} />
              <span>{alasanKeluar}</span>
            </div>
          )}
        </div>

        {responsibilities && responsibilities.length > 0 && (
          <ul className="mt-3 space-y-1.5 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
            {responsibilities.map((responsibility, index) => (
              <li key={index} className="pl-1">{responsibility}</li>
            ))}
          </ul>
        )}

        {projectTitle && projectImage && (
          <div className="mt-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 h-40 sm:h-auto relative">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover" 
                    src={projectImage} 
                    alt={projectTitle} 
                  />
                </div>
                <div className="p-4 sm:w-2/3">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {projectTitle}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {projectDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TimelineItem;