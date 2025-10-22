// ============================================================================
// STUPIFY AI COMPANION FEATURE - COMPANION PROFILE
// Created: October 22, 2025
// Version: 1.0
// Description: Full companion profile for stats dashboard
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, MessageCircle, Award, Calendar, Target, Zap } from 'lucide-react';
import { ARCHETYPE_EMOJIS, ARCHETYPE_DESCRIPTIONS } from '@/lib/companion/types';
import { CircularXPIndicator } from './XPProgressBar';
import type { Companion, LevelProgress } from '@/lib/companion/types';
import { formatDistanceToNow } from 'date-fns';

interface CompanionProfileProps {
  companion: Companion;
  progress: LevelProgress;
  stats?: {
    total_messages: number;
    total_interactions: number;
    questions_asked: number;
    messages_sent: number;
    level_ups: number;
  };
  onOpenMessages?: () => void;
  className?: string;
}

/**
 * CompanionProfile - Full profile view for stats dashboard
 * 
 * Features:
 * - Companion details
 * - Level and XP progress
 * - Stats overview
 * - Journey timeline
 * - Achievements
 */
export function CompanionProfile({
  companion,
  progress,
  stats,
  onOpenMessages,
  className = '',
}: CompanionProfileProps) {
  const emoji = ARCHETYPE_EMOJIS[companion.archetype];
  const archetypeDescription = ARCHETYPE_DESCRIPTIONS[companion.archetype];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 p-8 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar and Level */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-2xl">
                  <span className="text-7xl">{emoji}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-xl font-bold text-gray-900 shadow-lg ring-4 ring-white">
                  {companion.level}
                </div>
              </motion.div>

              <CircularXPIndicator progress={progress} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold mb-2">{companion.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {companion.archetype}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {companion.current_avatar} stage
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  Level {companion.level}
                </Badge>
              </div>
              <p className="text-white/90 mb-4 max-w-md">
                {archetypeDescription}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {formatDistanceToNow(new Date(companion.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{companion.total_xp} Total XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Questions */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.questions_asked || 0}
          </div>
          <div className="text-sm text-gray-600">Questions Asked</div>
          <div className="mt-2 text-xs text-gray-500">
            Keep asking to level up faster!
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            {stats && stats.total_messages > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenMessages}
                className="h-auto p-0 text-xs hover:text-purple-600"
              >
                View all
              </Button>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.total_messages || 0}
          </div>
          <div className="text-sm text-gray-600">Messages from {companion.name}</div>
          <div className="mt-2 text-xs text-gray-500">
            Your companion checks in regularly
          </div>
        </Card>

        {/* Level Ups */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-orange-100">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats?.level_ups || 0}
          </div>
          <div className="text-sm text-gray-600">Level Ups</div>
          <div className="mt-2 text-xs text-gray-500">
            {progress.xp_to_next_level} XP until next level
          </div>
        </Card>
      </div>

      {/* XP Progress Detail */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">XP Progress</h3>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Level {companion.level}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="relative h-4 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress_percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>{progress.current_xp} XP</span>
            <span>{progress.xp_to_next_level} XP to next level</span>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
            const isComplete = companion.level >= level;
            const isCurrent = companion.level === level;
            const isMilestone = level === 5 || level === 10;

            return (
              <div key={level} className="flex flex-col items-center gap-1">
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
                    transition-all
                    ${isCurrent
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white ring-4 ring-purple-200 scale-110'
                      : isComplete
                      ? 'bg-gradient-to-br from-purple-400 to-blue-400 text-white'
                      : 'bg-gray-200 text-gray-400'
                    }
                    ${isMilestone ? 'ring-2 ring-yellow-400' : ''}
                  `}
                >
                  {level}
                </div>
                {isMilestone && (
                  <span className="text-xs text-yellow-600">★</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Favorite Topics */}
      {companion.favorite_topics && companion.favorite_topics.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Favorite Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {companion.favorite_topics.map((topic, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {topic}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Summary */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Activity Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Total Interactions</span>
            <span className="font-semibold text-gray-900">
              {companion.total_interactions}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Last Active</span>
            <span className="font-semibold text-gray-900">
              {formatDistanceToNow(new Date(companion.last_interaction_at), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Total XP Earned</span>
            <span className="font-semibold text-gray-900">
              {companion.total_xp} XP
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Current Avatar Stage</span>
            <Badge variant="secondary">{companion.current_avatar}</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}