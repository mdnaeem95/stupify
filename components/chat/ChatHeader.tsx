import { Sparkles } from 'lucide-react';
import { SimplifySelector } from './SimplifySelector';
import { SimplicityLevel } from '@/lib/prompts';

interface ChatHeaderProps {
  simplicityLevel: SimplicityLevel;
  onLevelChange: (level: SimplicityLevel) => void;
}

export function ChatHeader({ simplicityLevel, onLevelChange }: ChatHeaderProps) {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Stupify</h1>
              <p className="text-xs text-gray-500">Finally, an AI that speaks human</p>
            </div>
          </div>

          {/* Mode Selector */}
          <SimplifySelector selected={simplicityLevel} onSelect={onLevelChange} />
        </div>
      </div>
    </div>
  );
}