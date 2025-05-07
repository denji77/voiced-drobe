import React from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  narratorEnabled: boolean;
  toggleNarrator: () => void;
  showApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ narratorEnabled, toggleNarrator, showApiKeyModal }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-primary relative group">
            VocalWardrobe
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNarrator}
                className={`relative transition-all duration-300 hover:scale-110 ${narratorEnabled ? 'text-green-600 hover:text-green-700' : 'hover:text-primary'}`}
              >
                {narratorEnabled ? (
                  <Volume2 size={20} className="animate-pulse" />
                ) : (
                  <VolumeX size={20} />
                )}
                {narratorEnabled && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="animate-fade-in">
              {narratorEnabled ? 'Disable narrator' : 'Enable narrator'}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                onClick={showApiKeyModal}
                className="text-sm flex items-center gap-1 transition-all duration-300 hover:bg-primary hover:text-white"
              >
                <Settings size={16} className="transition-transform duration-700 hover:rotate-90" />
                API Key
              </Button>
            </TooltipTrigger>
            <TooltipContent className="animate-fade-in">
              Configure your OpenAI API key
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default Header;
