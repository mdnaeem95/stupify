// ============================================================================
// STUPIFY AI COMPANION FEATURE - COMPANION PROFILE - Phase 3
// Created: October 22, 2025
// Updated: October 23, 2025 (Phase 3 - Stats added)
// Version: 2.1
// Description: Full companion profile for stats dashboard
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  MessageCircle, 
  Award, 
  Calendar, 
  Target, 
  Zap,
  Brain,
  Heart,
  Compass,
  Star
} from 'lucide-react';
import { getArchetypeDescription } from '@/lib/companion/archetypes';
import { CircularXPIndicator } from './XPProgressBar';
import CompanionStatsDetail from './stats/CompanionStatsDetail';
import type { Companion, LevelProgress } from '@/lib/companion/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

const ARCHETYPE_CONFIG = {
  mentor: {
    icon: Brain,
    gradient: 'from-purple-500 via-purple-600 to-indigo-600',
    iconColor: 'text-purple-600',
    bgColor: 'from-purple-100 to-indigo-100',
  },
  friend: {
    icon: Heart,
    gradient: 'from-orange-500 via-pink-500 to-rose-500',
    iconColor: 'text-pink-600',
    bgColor: 'from-orange-100 to-pink-100',
  },
  explorer: {
    icon: Compass,
    gradient: 'from-teal-500 via-emerald-500 to-green-600',
    iconColor: 'text-teal-600',
    bgColor: 'from-teal-100 to-emerald-100',
  },
};

/**
 * CompanionProfile - Full profile view for stats dashboard
 * 
 * Features:
 * - Companion details with icon
 * - Level and XP progress
 * - Stats overview (Phase 3: happiness, energy, knowledge)
 * - Visual level progression
 * - Activity summary
 */
export function CompanionProfile({
  companion,
  progress,
  stats,
  onOpenMessages,
  className = '',
}: CompanionProfileProps) {
  const config = ARCHETYPE_CONFIG[companion.archetype];
  const Icon = config.icon;
  const archetypeInfo = getArchetypeDescription(companion.archetype);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card - Hero Section */}
      <Card className="relative overflow-hidden border-0 shadow-2xl">
        {/* Gradient Background */}
        <div className={cn(
          'relative bg-gradient-to-br p-8 sm:p-10 text-white',
          config.gradient
        )}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar and Level - Icon Based */}
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                {/* Icon container with glow */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full" />
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-2xl ring-4 ring-white/30">
                    <Icon className="h-16 w-16 text-white drop-shadow-lg" strokeWidth={2} />
                  </div>
                </div>
                
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 text-2xl font-bold text-gray-900 shadow-xl ring-4 ring-white">
                  {companion.level}
                </div>
              </motion.div>

              <CircularXPIndicator progress={progress} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-2">{companion.name}</h2>
                <p className="text-xl text-white/90">{archetypeInfo.tagline}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 text-sm font-semibold">
                  {archetypeInfo.name}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 text-sm font-semibold capitalize">
                  {companion.current_avatar} Stage
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 text-sm font-semibold">
                  Level {companion.level}
                </Badge>
              </div>

              <p className="text-base text-white/90 leading-relaxed max-w-2xl">
                {archetypeInfo.description}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" strokeWidth={2} />
                  <span className="font-medium">
                    Joined {formatDistanceToNow(new Date(companion.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                  <span className="font-medium">{companion.total_xp.toLocaleString()} Total XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Companion Stats (Phase 3) */}
      <Card className="p-8">
        <CompanionStatsDetail
          happiness={companion.happiness}
          energy={companion.energy}
          knowledge={companion.knowledge}
        />
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Questions */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
              'from-purple-100 to-indigo-100'
            )}>
              <Target className="h-7 w-7 text-purple-600" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats?.questions_asked || 0}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-2">Questions Asked</div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Keep asking to level up faster
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
              'from-green-100 to-emerald-100'
            )}>
              <MessageCircle className="h-7 w-7 text-green-600" strokeWidth={2.5} />
            </div>
            {stats && stats.total_messages > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenMessages}
                className="h-auto p-0 text-sm font-semibold hover:text-indigo-600 transition-colors"
              >
                View all
              </Button>
            )}
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats?.total_messages || 0}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-2">
            Messages from {companion.name}
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Your companion checks in regularly
          </div>
        </Card>

        {/* Level Ups */}
        <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg',
              'from-yellow-100 to-orange-100'
            )}>
              <Award className="h-7 w-7 text-yellow-600" strokeWidth={2.5} />
            </div>
            <Sparkles className="h-5 w-5 text-yellow-500" strokeWidth={2.5} />
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats?.level_ups || 0}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-2">Level Ups</div>
          <div className="text-sm text-gray-500 leading-relaxed">
            {progress.xp_to_next_level.toLocaleString()} XP until next level
          </div>
        </Card>
      </div>

      {/* XP Progress Detail */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">XP Progress</h3>
          <Badge className={cn(
            'gap-2 px-4 py-2 text-sm font-bold bg-gradient-to-r text-white',
            config.gradient
          )}>
            <Zap className="h-4 w-4" strokeWidth={2.5} />
            Level {companion.level}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="relative h-4 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress_percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn(
                'h-full bg-gradient-to-r shadow-lg',
                config.gradient
              )}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">
              {progress.current_xp.toLocaleString()} XP
            </span>
            <span className="font-semibold text-gray-700">
              {progress.xp_to_next_level.toLocaleString()} XP to next level
            </span>
          </div>
        </div>

        {/* Milestone progress */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Level Milestones
          </h4>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const isComplete = companion.level >= level;
              const isCurrent = companion.level === level;
              const isMilestone = level === 5 || level === 10;

              return (
                <div key={level} className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: level * 0.05 }}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all',
                      isCurrent
                        ? `bg-gradient-to-br ${config.gradient} text-white ring-4 ring-offset-2 ${config.iconColor.replace('text-', 'ring-')} scale-110 shadow-lg`
                        : isComplete
                        ? `bg-gradient-to-br ${config.gradient} text-white shadow-md`
                        : 'bg-gray-100 text-gray-400',
                      isMilestone && !isCurrent ? 'ring-2 ring-yellow-400' : ''
                    )}
                  >
                    {level}
                  </motion.div>
                  {isMilestone && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Favorite Topics */}
      {companion.favorite_topics && companion.favorite_topics.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">
            Favorite Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {companion.favorite_topics.map((topic, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-4 py-2 text-sm font-medium"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Summary */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-bold text-gray-900">
          Activity Summary
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-base text-gray-600">Total Interactions</span>
            <span className="text-lg font-bold text-gray-900">
              {companion.total_interactions.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-base text-gray-600">Last Active</span>
            <span className="text-lg font-bold text-gray-900">
              {formatDistanceToNow(new Date(companion.last_interaction_at), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-base text-gray-600">Total XP Earned</span>
            <span className="text-lg font-bold text-gray-900">
              {companion.total_xp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-base text-gray-600">Current Avatar Stage</span>
            <Badge variant="secondary" className="text-gray-900 px-4 py-1.5 text-sm font-semibold capitalize">
              {companion.current_avatar}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}