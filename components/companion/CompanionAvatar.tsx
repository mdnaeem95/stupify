/**
 * COMPANION AVATAR - Phase 2, Days 15-17
 * 
 * SVG-based avatar component for companion visualization.
 * Renders different designs for each archetype and evolution stage.
 * 
 * Features:
 * - 9 unique avatars (3 archetypes × 3 stages)
 * - SVG-based for crisp rendering at any size
 * - Animated expressions
 * - Glow effects for evolution
 * - Responsive sizing
 */

'use client';

import React from 'react';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { type EvolutionStage, getSizeMultiplier } from '@/lib/companion/evolution-config';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanionAvatarProps {
  archetype: CompanionArchetype;
  stage: EvolutionStage;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CLASSES = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CompanionAvatar({
  archetype,
  stage,
  size = 'md',
  animated = false,
  glowing = false,
  className,
}: CompanionAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const multiplier = getSizeMultiplier(stage);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClass,
        className
      )}
      style={{ transform: `scale(${multiplier})` }}
    >
      {/* Glow effect */}
      {glowing && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50 blur-lg animate-pulse" />
      )}

      {/* Avatar SVG */}
      <div className={cn('relative z-10', animated && 'animate-bounce')}>
        {renderAvatar(archetype, stage)}
      </div>
    </div>
  );
}

// ============================================================================
// AVATAR RENDERERS
// ============================================================================

function renderAvatar(archetype: CompanionArchetype, stage: EvolutionStage) {
  switch (archetype) {
    case 'mentor':
      return renderMentorAvatar(stage);
    case 'friend':
      return renderFriendAvatar(stage);
    case 'explorer':
      return renderExplorerAvatar(stage);
    default:
      return null;
  }
}

// ============================================================================
// MENTOR AVATARS (OWL)
// ============================================================================

function renderMentorAvatar(stage: EvolutionStage) {
  const colors = {
    primary: '#8B5CF6', // purple-600
    secondary: '#A78BFA', // purple-400
    accent: '#DDD6FE', // purple-200
  };

  switch (stage) {
    case 'baby':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Baby owl - small and cute */}
          <circle cx="50" cy="55" r="30" fill={colors.primary} />
          
          {/* Eyes */}
          <circle cx="42" cy="50" r="8" fill="white" />
          <circle cx="58" cy="50" r="8" fill="white" />
          <circle cx="42" cy="50" r="4" fill="black" />
          <circle cx="58" cy="50" r="4" fill="black" />
          
          {/* Beak */}
          <path d="M 50 55 L 45 60 L 55 60 Z" fill="#FFA500" />
          
          {/* Tufts (small) */}
          <circle cx="35" cy="35" r="5" fill={colors.secondary} />
          <circle cx="65" cy="35" r="5" fill={colors.secondary} />
        </svg>
      );

    case 'teen':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Teen owl - medium size */}
          <ellipse cx="50" cy="55" rx="32" ry="35" fill={colors.primary} />
          
          {/* Eyes (bigger) */}
          <circle cx="40" cy="48" r="10" fill="white" />
          <circle cx="60" cy="48" r="10" fill="white" />
          <circle cx="40" cy="48" r="5" fill="black" />
          <circle cx="60" cy="48" r="5" fill="black" />
          
          {/* Beak */}
          <path d="M 50 55 L 44 62 L 56 62 Z" fill="#FFA500" />
          
          {/* Tufts (medium) */}
          <ellipse cx="32" cy="30" rx="6" ry="10" fill={colors.secondary} />
          <ellipse cx="68" cy="30" rx="6" ry="10" fill={colors.secondary} />
          
          {/* Wings hint */}
          <ellipse cx="25" cy="60" rx="8" ry="15" fill={colors.accent} opacity="0.7" />
          <ellipse cx="75" cy="60" rx="8" ry="15" fill={colors.accent} opacity="0.7" />
        </svg>
      );

    case 'adult':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Adult owl - large and wise */}
          <ellipse cx="50" cy="55" rx="35" ry="40" fill={colors.primary} />
          
          {/* Eyes (largest, wise) */}
          <circle cx="38" cy="45" r="12" fill="white" />
          <circle cx="62" cy="45" r="12" fill="white" />
          <circle cx="38" cy="45" r="6" fill="black" />
          <circle cx="62" cy="45" r="6" fill="black" />
          
          {/* Glasses (wisdom) */}
          <circle cx="38" cy="45" r="13" fill="none" stroke={colors.accent} strokeWidth="2" />
          <circle cx="62" cy="45" r="13" fill="none" stroke={colors.accent} strokeWidth="2" />
          <line x1="51" y1="45" x2="49" y2="45" stroke={colors.accent} strokeWidth="2" />
          
          {/* Beak */}
          <path d="M 50 55 L 42 64 L 58 64 Z" fill="#FFA500" />
          
          {/* Tufts (large) */}
          <ellipse cx="28" cy="25" rx="7" ry="12" fill={colors.secondary} />
          <ellipse cx="72" cy="25" rx="7" ry="12" fill={colors.secondary} />
          
          {/* Wings */}
          <ellipse cx="20" cy="60" rx="10" ry="20" fill={colors.secondary} opacity="0.8" />
          <ellipse cx="80" cy="60" rx="10" ry="20" fill={colors.secondary} opacity="0.8" />
        </svg>
      );
  }
}

// ============================================================================
// FRIEND AVATARS (STAR)
// ============================================================================

function renderFriendAvatar(stage: EvolutionStage) {
  const colors = {
    primary: '#F97316', // orange-500
    secondary: '#FB923C', // orange-400
    accent: '#FED7AA', // orange-200
  };

  switch (stage) {
    case 'baby':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Baby star - small and bouncy */}
          <circle cx="50" cy="50" r="25" fill={colors.primary} />
          
          {/* Sparkles */}
          <circle cx="40" cy="30" r="3" fill={colors.accent} />
          <circle cx="60" cy="30" r="3" fill={colors.accent} />
          
          {/* Face */}
          <circle cx="43" cy="48" r="4" fill="white" />
          <circle cx="57" cy="48" r="4" fill="white" />
          <path d="M 40 58 Q 50 63 60 58" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'teen':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Teen star - energetic */}
          <circle cx="50" cy="50" r="28" fill={colors.primary} />
          
          {/* Rays */}
          <line x1="50" y1="15" x2="50" y2="25" stroke={colors.secondary} strokeWidth="3" />
          <line x1="50" y1="75" x2="50" y2="85" stroke={colors.secondary} strokeWidth="3" />
          <line x1="15" y1="50" x2="25" y2="50" stroke={colors.secondary} strokeWidth="3" />
          <line x1="75" y1="50" x2="85" y2="50" stroke={colors.secondary} strokeWidth="3" />
          
          {/* Sparkles */}
          <circle cx="35" cy="28" r="4" fill={colors.accent} />
          <circle cx="65" cy="28" r="4" fill={colors.accent} />
          <circle cx="35" cy="72" r="3" fill={colors.accent} />
          <circle cx="65" cy="72" r="3" fill={colors.accent} />
          
          {/* Face */}
          <circle cx="42" cy="47" r="5" fill="white" />
          <circle cx="58" cy="47" r="5" fill="white" />
          <path d="M 38 58 Q 50 65 62 58" stroke="white" strokeWidth="3" fill="none" />
        </svg>
      );

    case 'adult':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Adult star - radiant */}
          <circle cx="50" cy="50" r="30" fill={colors.primary} />
          
          {/* Large rays */}
          <line x1="50" y1="10" x2="50" y2="23" stroke={colors.secondary} strokeWidth="4" />
          <line x1="50" y1="77" x2="50" y2="90" stroke={colors.secondary} strokeWidth="4" />
          <line x1="10" y1="50" x2="23" y2="50" stroke={colors.secondary} strokeWidth="4" />
          <line x1="77" y1="50" x2="90" y2="50" stroke={colors.secondary} strokeWidth="4" />
          <line x1="23" y1="23" x2="33" y2="33" stroke={colors.secondary} strokeWidth="3" />
          <line x1="77" y1="23" x2="67" y2="33" stroke={colors.secondary} strokeWidth="3" />
          <line x1="23" y1="77" x2="33" y2="67" stroke={colors.secondary} strokeWidth="3" />
          <line x1="77" y1="77" x2="67" y2="67" stroke={colors.secondary} strokeWidth="3" />
          
          {/* Many sparkles */}
          <circle cx="30" cy="25" r="5" fill={colors.accent} />
          <circle cx="70" cy="25" r="5" fill={colors.accent} />
          <circle cx="30" cy="75" r="4" fill={colors.accent} />
          <circle cx="70" cy="75" r="4" fill={colors.accent} />
          
          {/* Face */}
          <circle cx="40" cy="45" r="6" fill="white" />
          <circle cx="60" cy="45" r="6" fill="white" />
          <path d="M 35 58 Q 50 68 65 58" stroke="white" strokeWidth="4" fill="none" />
        </svg>
      );
  }
}

// ============================================================================
// EXPLORER AVATARS (COMPASS)
// ============================================================================

function renderExplorerAvatar(stage: EvolutionStage) {
  const colors = {
    primary: '#14B8A6', // teal-500
    secondary: '#2DD4BF', // teal-400
    accent: '#99F6E4', // teal-200
  };

  switch (stage) {
    case 'baby':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Baby compass - simple */}
          <circle cx="50" cy="50" r="25" fill={colors.primary} />
          
          {/* Simple compass needle */}
          <polygon points="50,35 48,50 52,50" fill="white" />
          <polygon points="50,65 48,50 52,50" fill={colors.accent} />
          
          {/* Face */}
          <circle cx="43" cy="48" r="4" fill="white" />
          <circle cx="57" cy="48" r="4" fill="white" />
          <path d="M 42 58 Q 50 62 58 58" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'teen':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Teen compass - detailed */}
          <circle cx="50" cy="50" r="28" fill={colors.primary} />
          
          {/* Compass ring */}
          <circle cx="50" cy="50" r="23" fill="none" stroke={colors.secondary} strokeWidth="2" />
          
          {/* Cardinal directions */}
          <text x="50" y="33" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">N</text>
          <text x="50" y="71" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">S</text>
          <text x="32" y="53" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">W</text>
          <text x="68" y="53" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">E</text>
          
          {/* Compass needle */}
          <polygon points="50,38 47,50 53,50" fill="white" />
          <polygon points="50,62 47,50 53,50" fill={colors.accent} />
          
          {/* Face */}
          <circle cx="42" cy="47" r="5" fill="white" />
          <circle cx="58" cy="47" r="5" fill="white" />
        </svg>
      );

    case 'adult':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Adult compass - intricate */}
          <circle cx="50" cy="50" r="32" fill={colors.primary} />
          
          {/* Outer ring */}
          <circle cx="50" cy="50" r="28" fill="none" stroke={colors.secondary} strokeWidth="3" />
          
          {/* Inner ring */}
          <circle cx="50" cy="50" r="20" fill="none" stroke={colors.accent} strokeWidth="1" />
          
          {/* Cardinal directions with style */}
          <text x="50" y="28" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">N</text>
          <text x="50" y="76" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">S</text>
          <text x="27" y="53" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">W</text>
          <text x="73" y="53" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">E</text>
          
          {/* Intermediate directions */}
          <circle cx="35" cy="35" r="2" fill={colors.accent} />
          <circle cx="65" cy="35" r="2" fill={colors.accent} />
          <circle cx="35" cy="65" r="2" fill={colors.accent} />
          <circle cx="65" cy="65" r="2" fill={colors.accent} />
          
          {/* Detailed compass needle */}
          <polygon points="50,35 46,50 54,50" fill="white" />
          <polygon points="50,65 46,50 54,50" fill={colors.accent} />
          <circle cx="50" cy="50" r="4" fill={colors.secondary} />
          
          {/* Face */}
          <circle cx="40" cy="45" r="6" fill="white" />
          <circle cx="60" cy="45" r="6" fill="white" />
        </svg>
      );
  }
}