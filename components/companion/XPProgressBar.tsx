// ============================================================================
// STUPIFY AI COMPANION FEATURE - XP PROGRESS BAR
// Created: October 22, 2025
// Version: 1.0
// Description: Visual XP progress indicator
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';
import type { LevelProgress } from '@/lib/companion/types';

interface XPProgressBarProps {
  progress: LevelProgress;
  showLabel?: boolean;
  showXPNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * XPProgressBar - Visual XP progress indicator
 * 
 * Features:
 * - Animated progress bar
 * - Shows current XP / XP needed
 * - Visual level indicator
 * - Multiple sizes
 * - Optional labels
 */
export function XPProgressBar({
  progress,
  showLabel = true,
  showXPNumbers = true,
  size = 'md',
  animated = true,
  className = '',
}: XPProgressBarProps) {
  const {
    current_level,
    current_xp,
    xp_to_next_level,
    progress_percentage,
  } = progress;

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-2',
      text: 'text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      height: 'h-3',
      text: 'text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      height: 'h-4',
      text: 'text-base',
      icon: 'h-5 w-5',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and XP numbers */}
      {(showLabel || showXPNumbers) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <div className={`flex items-center gap-1 font-medium text-gray-700 ${config.text}`}>
              <Zap className={`text-yellow-500 ${config.icon}`} />
              <span>Level {current_level}</span>
            </div>
          )}

          {showXPNumbers && (
            <div className={`text-gray-600 ${config.text}`}>
              {current_xp} / {current_xp + xp_to_next_level} XP
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="relative">
        {animated ? (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="origin-left"
          >
            <Progress
              value={progress_percentage}
              className={`${config.height} bg-gray-200`}
            />
          </motion.div>
        ) : (
          <Progress
            value={progress_percentage}
            className={`${config.height} bg-gray-200`}
          />
        )}

        {/* Sparkle effect at the end of progress */}
        {animated && progress_percentage > 5 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${Math.min(progress_percentage, 95)}%` }}
          >
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
          </motion.div>
        )}
      </div>

      {/* XP remaining text */}
      {showXPNumbers && xp_to_next_level > 0 && (
        <div className={`text-center text-gray-500 ${config.text}`}>
          {xp_to_next_level} XP to level {current_level + 1}
        </div>
      )}

      {/* Max level indicator */}
      {xp_to_next_level === 0 && (
        <div className={`text-center font-semibold text-purple-600 ${config.text}`}>
          Max Level! 🎉
        </div>
      )}
    </div>
  );
}

/**
 * CompactXPBar - Minimal XP indicator for tight spaces
 */
export function CompactXPBar({ progress }: { progress: LevelProgress }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
        <Zap className="h-3 w-3 text-yellow-500" />
        <span>Lv.{progress.current_level}</span>
      </div>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress_percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
        />
      </div>
      <span className="text-xs text-gray-600">
        {Math.round(progress.progress_percentage)}%
      </span>
    </div>
  );
}

/**
 * CircularXPIndicator - Circular progress for companion profile
 */
export function CircularXPIndicator({ progress }: { progress: LevelProgress }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.progress_percentage / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900">{progress.current_level}</div>
        <div className="text-xs text-gray-600">Level</div>
      </div>
    </div>
  );
}

/**
 * XPGainAnimation - Animated +XP popup
 */
export function XPGainAnimation({
  xpGained,
  onComplete,
}: {
  xpGained: number;
  onComplete?: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -50, opacity: 0, scale: 1.2 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="pointer-events-none fixed right-24 bottom-24 z-50"
    >
      <div className="flex items-center gap-1 rounded-full bg-green-500 px-4 py-2 font-bold text-white shadow-lg">
        <Zap className="h-4 w-4" />
        <span>+{xpGained} XP</span>
      </div>
    </motion.div>
  );
}