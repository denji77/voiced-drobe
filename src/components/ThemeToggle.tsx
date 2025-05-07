import React from 'react';
import { useTheme } from '@/lib/theme-provider';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative transition-all duration-300 hover:scale-110"
          aria-label="Toggle theme"
        >
          <Sun 
            size={20} 
            className={`absolute transform transition-all duration-500 ${
              theme === 'dark' ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
            }`} 
          />
          <Moon 
            size={20} 
            className={`absolute transform transition-all duration-500 ${
              theme === 'light' ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
            }`} 
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="animate-fade-in">
        {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle; 