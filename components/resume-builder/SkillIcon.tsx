import React from 'react';
import { 
  Figma, Palette, FileCode, 
  Code, MessagesSquare, Briefcase,
  FileSpreadsheet
} from 'lucide-react';

interface SkillIconProps {
  icon: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({ icon }) => {
  const getIcon = () => {
    switch(icon) {
      case 'figma':
        return <Figma className="size-5 text-indigo-500" />;
      case 'sketch':
        return <Palette className="size-5 text-yellow-500" />;
      case 'html':
        return <FileCode className="size-5 text-orange-500" />;
      case 'css':
        return <FileCode className="size-5 text-blue-500" />;
      case 'tailwind':
        return <Code className="size-5 text-teal-500" />;
      case 'react':
        return <Code className="size-5 text-blue-400" />;
      case 'vue':
        return <Code className="size-5 text-emerald-500" />;
      case 'notion':
        return <FileSpreadsheet className="size-5 text-gray-700 dark:text-gray-300" />;
      case 'mailchimp':
        return <MessagesSquare className="size-5 text-yellow-600" />;
      case 'slack':
        return <MessagesSquare className="size-5 text-purple-500" />;
      default:
        return <Briefcase className="size-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex-shrink-0 size-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600">
      {getIcon()}
    </div>
  );
};

export default SkillIcon;