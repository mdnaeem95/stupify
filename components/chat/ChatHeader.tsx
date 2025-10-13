import { Sparkles } from 'lucide-react';
import { SimplifySelector } from './SimplifySelector';
import { SimplicityLevel } from '@/lib/prompts';

interface ChatHeaderProps {
  simplicityLevel: SimplicityLevel;
  onLevelChange: (level: SimplicityLevel) => void;
  isMobile?: boolean;
}

export function ChatHeader({ simplicityLevel, onLevelChange }: ChatHeaderProps) {
  return (
    <div className="bg-white safe-top">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Stupify</h1>
              <p className="text-[10px] md:text-xs text-gray-500">Finally, an AI that speaks human</p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="w-full md:w-auto">
            <SimplifySelector 
              selected={simplicityLevel} 
              onSelect={onLevelChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}