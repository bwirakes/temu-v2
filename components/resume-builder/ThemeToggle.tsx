'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function ThemeToggle({ isDarkMode, toggleTheme }: ThemeToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-md"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-500" />
      )}
    </Button>
  );
}