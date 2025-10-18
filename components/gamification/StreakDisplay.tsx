'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  compact?: boolean; // For mobile
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ compact = false }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/gamification/streak');
      if (response.ok) {
        const data = await response.json();
        setStreak({
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
        });
      }
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !streak) {
    return null;
  }

  // Don't show if no streak yet
  if (streak.currentStreak === 0) {
    return null;
  }

  // Compact version for mobile
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 min-h-[44px]">
        <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
        <span className="text-sm font-bold text-white">{streak.currentStreak}</span>
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className={cn(
      'flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-400 px-4 py-2.5 rounded-xl',
      'shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40',
      'transition-all duration-200 cursor-pointer group',
      'hover:scale-105',
      'min-h-[44px]'
    )}>
      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
        <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-white">{streak.currentStreak}</span>
          <span className="text-sm font-semibold text-white/90">day streak</span>
        </div>
        {streak.currentStreak < streak.longestStreak && (
          <span className="text-xs text-white/75 font-medium">Best: {streak.longestStreak}</span>
        )}
        {streak.currentStreak === streak.longestStreak && streak.currentStreak > 1 && (
          <span className="text-xs font-semibold text-white/90">Personal best!</span>
        )}
      </div>
    </div>
  );
}