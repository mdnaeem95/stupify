'use client';

import { MessageSquare, Crown } from 'lucide-react';

interface UsageBadgeProps {
  remaining: number;
  limit: number;
  isPremium: boolean;
}

export function UsageBadge({ remaining, limit, isPremium }: UsageBadgeProps) {
  if (isPremium) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-medium shadow-md">
        <Crown className="w-4 h-4" />
        <span>Premium</span>
      </div>
    );
  }

  // Calculate percentage for color
  const percentage = (remaining / limit) * 100;
  
  // Determine color based on remaining
  let bgColor = 'bg-green-100 text-green-800 border-green-300';
  if (percentage <= 20) {
    bgColor = 'bg-red-100 text-red-800 border-red-300';
  } else if (percentage <= 50) {
    bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${bgColor}`}>
      <MessageSquare className="w-4 h-4" />
      <span>
        {remaining}/{limit} questions left today
      </span>
    </div>
  );
}