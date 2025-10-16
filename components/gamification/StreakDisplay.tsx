'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

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
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 rounded-lg shadow-sm">
        <TrendingUp className="w-3.5 h-3.5 text-white" />
        <span className="text-sm font-bold text-white">{streak.currentStreak}</span>
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <TrendingUp className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
      
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-white">{streak.currentStreak}</span>
          <span className="text-xs font-medium text-white/90">day streak</span>
        </div>
        {streak.currentStreak < streak.longestStreak && (
          <span className="text-xs text-white/75">Best: {streak.longestStreak}</span>
        )}
        {streak.currentStreak === streak.longestStreak && streak.currentStreak > 1 && (
          <span className="text-xs font-medium text-white/90">Personal best!</span>
        )}
      </div>
    </div>
  );
}