'use client';

import { useEffect, useState } from 'react';
import { Mascot } from '../mascot/Mascot';
import { Flame } from 'lucide-react';

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
    return null; // Don't show anything while loading
  }

  // Don't show if no streak yet
  if (streak.currentStreak === 0) {
    return null;
  }

  // Compact version for mobile
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 rounded-full border border-orange-200">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-bold text-orange-900">{streak.currentStreak}</span>
      </div>
    );
  }

  // Full version for desktop
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      {/* Fire icon */}
      <div className="relative">
        <Flame className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
        {streak.currentStreak >= 7 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Streak number */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-orange-900">{streak.currentStreak}</span>
          <span className="text-xs text-orange-600">day streak</span>
        </div>
        {streak.currentStreak < streak.longestStreak && (
          <span className="text-xs text-orange-500">Record: {streak.longestStreak}</span>
        )}
        {streak.currentStreak === streak.longestStreak && streak.currentStreak > 1 && (
          <span className="text-xs text-orange-500">🏆 New record!</span>
        )}
      </div>
    </div>
  );
}

// Streak tooltip component (shows on hover)
export function StreakTooltip({ streak, calendar }: { 
  streak: number; 
  calendar: { date: string; active: boolean }[] 
}) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-200 w-80">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Mascot expression="proud" size={50} />
        <div>
          <h3 className="font-bold text-gray-900">Your Streak</h3>
          <p className="text-sm text-gray-600">{streak} days strong! 🔥</p>
        </div>
      </div>

      {/* Calendar heatmap (simplified) */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Last 30 days</p>
        <div className="grid grid-cols-10 gap-1">
          {calendar.slice(-30).map((day, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded ${
                day.active 
                  ? 'bg-orange-400' 
                  : 'bg-gray-100'
              }`}
              title={day.date}
            />
          ))}
        </div>
      </div>

      {/* Encouragement */}
      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
        <p className="text-sm text-orange-900">
          {streak === 1 && "Great start! Come back tomorrow to keep it going! 💪"}
          {streak === 2 && "Two in a row! You're building a habit! 🎯"}
          {streak >= 3 && streak < 7 && "Amazing! You're on fire! Keep it up! 🔥"}
          {streak >= 7 && streak < 30 && "Incredible dedication! A whole week! 🌟"}
          {streak >= 30 && "Legendary! A full month of learning! 🏆"}
        </p>
      </div>
    </div>
  );
}