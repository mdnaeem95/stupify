'use client';

import { Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { CompactLevelSelector } from './CompactLevelSelector';

interface ChatHeaderProps {
  simplicityLevel: SimplicityLevel;
  onLevelChange: (level: SimplicityLevel) => void;
  isMobile?: boolean;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function ChatHeader({ 
  simplicityLevel, 
  onLevelChange,
  isMobile,
  triggerHaptic 
}: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Stupify</h1>
              <p className="text-xs text-gray-500">AI that speaks human</p>
            </div>
          </div>

          {/* Compact Level Selector */}
          <CompactLevelSelector
            selected={simplicityLevel}
            onSelect={onLevelChange}
            isMobile={isMobile}
            triggerHaptic={triggerHaptic}
          />
          
        </div>
      </div>
    </div>
  );
}