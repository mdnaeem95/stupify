/**
 * ARCHETYPE CARD COMPONENT - Phase 2
 * 
 * Visual card for displaying companion archetype information.
 * Shows archetype name, description, personality traits, and selection state.
 * 
 * Features:
 * - Beautiful gradient backgrounds per archetype
 * - Personality trait visualization (0-10 bars)
 * - "Best for" use case display
 * - Selected/unselected states
 * - Mobile-responsive design
 * - Haptic feedback on mobile
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { type CompanionArchetype, type PersonalityTraits, getArchetypeDescription, TRAIT_LABELS } from '@/lib/companion/archetypes';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ArchetypeCardProps {
  archetype: CompanionArchetype;
  selected?: boolean;
  onClick?: () => void;
  showTraits?: boolean;
  className?: string;
}

// ============================================================================
// ARCHETYPE COLORS
// ============================================================================

const ARCHETYPE_GRADIENTS: Record<CompanionArchetype, string> = {
  mentor: 'from-purple-500 via-purple-600 to-indigo-600',
  friend: 'from-orange-400 via-yellow-500 to-orange-500',
  explorer: 'from-teal-500 via-green-500 to-emerald-600',
};

const ARCHETYPE_COLORS: Record<CompanionArchetype, string> = {
  mentor: 'border-purple-500 bg-purple-50',
  friend: 'border-orange-500 bg-orange-50',
  explorer: 'border-teal-500 bg-teal-50',
};

const ARCHETYPE_ICONS: Record<CompanionArchetype, string> = {
  mentor: '🦉',
  friend: '🌟',
  explorer: '🧭',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ArchetypeCard({
  archetype,
  selected = false,
  onClick,
  showTraits = true,
  className,
}: ArchetypeCardProps) {
  const info = getArchetypeDescription(archetype);
  const gradient = ARCHETYPE_GRADIENTS[archetype];
  const colorScheme = ARCHETYPE_COLORS[archetype];
  const icon = ARCHETYPE_ICONS[archetype];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-pointer',
        'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        selected && 'ring-4 ring-offset-2',
        selected && archetype === 'mentor' && 'ring-purple-500',
        selected && archetype === 'friend' && 'ring-orange-500',
        selected && archetype === 'explorer' && 'ring-teal-500',
        !selected && 'hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Selected Indicator */}
      {selected && (
        <div className={cn(
          'absolute top-3 right-3 z-10',
          'w-8 h-8 rounded-full flex items-center justify-center',
          'bg-white shadow-lg'
        )}>
          <Check className={cn(
            'w-5 h-5',
            archetype === 'mentor' && 'text-purple-600',
            archetype === 'friend' && 'text-orange-600',
            archetype === 'explorer' && 'text-teal-600'
          )} />
        </div>
      )}

      {/* Gradient Header */}
      <div className={cn(
        'relative h-32 bg-gradient-to-br',
        gradient
      )}>
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-90 drop-shadow-lg">
            {icon}
          </span>
        </div>

        {/* Archetype Name Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-900 hover:bg-white font-semibold px-3 py-1">
            {info.name}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Tagline */}
        <p className="text-sm font-medium text-gray-600">
          {info.tagline}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {info.description}
        </p>

        {/* Best For */}
        <div className={cn(
          'p-3 rounded-lg border-2',
          colorScheme
        )}>
          <p className="text-xs font-semibold text-gray-600 mb-1">
            BEST FOR:
          </p>
          <p className="text-sm text-gray-800">
            {info.bestFor}
          </p>
        </div>

        {/* Personality Traits */}
        {showTraits && (
          <div className="pt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Personality Traits
            </p>
            {Object.entries(info.traits).map(([key, value]) => (
              <TraitBar
                key={key}
                label={TRAIT_LABELS[key as keyof PersonalityTraits]}
                value={value}
                archetype={archetype}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// TRAIT BAR SUB-COMPONENT
// ============================================================================

interface TraitBarProps {
  label: string;
  value: number;
  archetype: CompanionArchetype;
}

function TraitBar({ label, value, archetype }: TraitBarProps) {
  const percentage = (value / 10) * 100;
  
  const barColors: Record<CompanionArchetype, string> = {
    mentor: 'bg-purple-500',
    friend: 'bg-orange-500',
    explorer: 'bg-teal-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value}/10</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            barColors[archetype]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export interface ArchetypeCardCompactProps {
  archetype: CompanionArchetype;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Compact version for mobile or smaller spaces
 */
export function ArchetypeCardCompact({
  archetype,
  selected = false,
  onClick,
  className,
}: ArchetypeCardCompactProps) {
  const info = getArchetypeDescription(archetype);
  const icon = ARCHETYPE_ICONS[archetype];

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full p-4 rounded-xl border-2 transition-all',
        'hover:shadow-md active:scale-[0.98]',
        selected && 'ring-2 ring-offset-2',
        selected && archetype === 'mentor' && 'border-purple-500 bg-purple-50 ring-purple-500',
        selected && archetype === 'friend' && 'border-orange-500 bg-orange-50 ring-orange-500',
        selected && archetype === 'explorer' && 'border-teal-500 bg-teal-50 ring-teal-500',
        !selected && 'border-gray-200 bg-white hover:border-gray-300',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-4xl">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{info.name}</h3>
            {selected && (
              <Check className={cn(
                'w-4 h-4',
                archetype === 'mentor' && 'text-purple-600',
                archetype === 'friend' && 'text-orange-600',
                archetype === 'explorer' && 'text-teal-600'
              )} />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {info.tagline}
          </p>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// PREVIEW VARIANT (for tooltips/popovers)
// ============================================================================

export interface ArchetypePreviewProps {
  archetype: CompanionArchetype;
  className?: string;
}

/**
 * Minimal preview for tooltips or small displays
 */
export function ArchetypePreview({ archetype, className }: ArchetypePreviewProps) {
  const info = getArchetypeDescription(archetype);
  const icon = ARCHETYPE_ICONS[archetype];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-sm text-gray-900">{info.name}</p>
        <p className="text-xs text-gray-600">{info.tagline}</p>
      </div>
    </div>
  );
}