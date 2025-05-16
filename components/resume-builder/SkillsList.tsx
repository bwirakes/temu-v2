import React from 'react';
import { motion } from 'framer-motion';
import SkillIcon from './SkillIcon';

interface Skill {
  name: string;
  icon?: string;
  level: number;
  tingkat?: "Pemula" | "Menengah" | "Mahir";
}

interface SkillsListProps {
  title: string;
  skills: Skill[];
}

const SkillsList: React.FC<SkillsListProps> = ({ title, skills }) => {
  // Function to get label based on skill level
  const getLevelLabel = (level: number, tingkat?: string): string => {
    if (tingkat) return tingkat;
    
    if (level <= 30) return "Pemula";
    if (level <= 60) return "Menengah";
    return "Mahir";
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-y-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <div 
            key={index} 
            className="relative flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {skill.icon && <SkillIcon icon={skill.icon} />}
            <div className="grow">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {skill.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getLevelLabel(skill.level, skill.tingkat)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillsList;