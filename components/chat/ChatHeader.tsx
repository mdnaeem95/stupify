'use client';

import { Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { CompactLevelSelector } from './CompactLevelSelector';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';

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
    <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Title - Left */}
          <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl transform group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Stupify
              </h1>
              <p className="text-xs text-gray-500 font-medium">AI that speaks human</p>
            </div>
          </div>

          {/* Streak + Level Selector - Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <StreakDisplay compact={isMobile} />
            
            <CompactLevelSelector
              selected={simplicityLevel}
              onSelect={onLevelChange}
              isMobile={isMobile}
              triggerHaptic={triggerHaptic}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}