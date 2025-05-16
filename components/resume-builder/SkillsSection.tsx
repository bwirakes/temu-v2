'use client';

import { Code, FileText, Languages, Palette } from 'lucide-react';

interface Skill {
  name: string;
  icon: string;
  level: number;
  tingkat?: string;
}

interface SkillsSectionProps {
  skills: {
    technical: Skill[];
    languages: Skill[];
    it_skills?: string[];
  };
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'design':
        return <Palette size={16} className="text-pink-500" />;
      case 'code':
        return <Code size={16} className="text-blue-500" />;
      case 'language':
        return <Languages size={16} className="text-green-500" />;
      case 'office':
        return <FileText size={16} className="text-orange-500" />;
      default:
        return <Code size={16} className="text-gray-500" />;
    }
  };

  const getLevelLabel = (level: number) => {
    if (level <= 30) return 'Pemula';
    if (level <= 60) return 'Menengah';
    return 'Mahir';
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
        Skills
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Technical Skills</h3>
          <div className="space-y-3">
            {skills.technical.map((skill, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderIcon(skill.icon)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {skill.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {skill.tingkat || getLevelLabel(skill.level)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Languages */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Languages</h3>
          <div className="space-y-3">
            {skills.languages.map((language, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language.tingkat || getLevelLabel(language.level)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 dark:bg-green-500 rounded-full"
                    style={{ width: `${language.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* IT Skills */}
      {skills.it_skills && skills.it_skills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Other IT Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.it_skills.map((skill, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}