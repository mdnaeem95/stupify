'use client';

import { Crown, Zap, Sparkles } from 'lucide-react';
import { type SubscriptionTier } from '@/lib/stripe';

interface UsageBadgeProps {
  tier: SubscriptionTier;
  // For free users
  dailyRemaining?: number;
  dailyLimit?: number;
  // For starter users
  monthlyRemaining?: number;
  monthlyLimit?: number;
}

export function UsageBadge({ 
  tier,
  dailyRemaining = 0,
  dailyLimit = 5,
  monthlyRemaining = 0,
  monthlyLimit = 100,
}: UsageBadgeProps) {
  
  // ============================================================================
  // PREMIUM TIER - Unlimited Badge
  // ============================================================================
  if (tier === 'premium') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-md">
        <Crown className="w-4 h-4" />
        <span>Premium • Unlimited</span>
      </div>
    );
  }
  
  // ============================================================================
  // STARTER TIER - Monthly Usage
  // ============================================================================
  if (tier === 'starter') {
    const monthlyUsed = monthlyLimit - monthlyRemaining;
    const percentage = (monthlyUsed / monthlyLimit) * 100;
    
    // Determine color based on remaining questions
    let bgColor = 'bg-blue-100 text-blue-800 border-blue-300';
    let icon = <Zap className="w-4 h-4" />;
    
    if (percentage >= 90) {
      bgColor = 'bg-red-100 text-red-800 border-red-300';
    } else if (percentage >= 70) {
      bgColor = 'bg-orange-100 text-orange-800 border-orange-300';
    }
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${bgColor}`}>
        {icon}
        <span>
          {monthlyUsed}/{monthlyLimit} this month
        </span>
      </div>
    );
  }
  
  // ============================================================================
  // FREE TIER - Daily Usage
  // ============================================================================
  const dailyUsed = dailyLimit - dailyRemaining;
  const percentage = (dailyUsed / dailyLimit) * 100;
  
  // Determine color based on remaining questions
  let bgColor = 'bg-green-100 text-green-800 border-green-300';
  let icon = <Sparkles className="w-4 h-4" />;
  
  if (percentage >= 80) {
    bgColor = 'bg-red-100 text-red-800 border-red-300';
  } else if (percentage >= 60) {
    bgColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${bgColor}`}>
      {icon}
      <span>
        {dailyRemaining}/{dailyLimit} left today
      </span>
    </div>
  );
}