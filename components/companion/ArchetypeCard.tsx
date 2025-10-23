/**
 * ARCHETYPE CARD COMPONENT - Redesigned v2.0
 * 
 * Following STUPIFY Design Principles:
 * - NO EMOJIS (using Lucide icons instead)
 * - Clean gradients with proper shadows
 * - Warm but professional aesthetic
 * - Premium card design with hover states
 * - Mobile-first responsive
 * 
 * Features:
 * - Beautiful gradient backgrounds per archetype
 * - Icon-based archetype identification
 * - Personality trait visualization (0-10 bars)
 * - "Best for" use case display
 * - Selected/unselected states with smooth transitions
 * - Compact and preview variants
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Brain, Heart, Compass } from 'lucide-react';
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
// ARCHETYPE DESIGN SYSTEM (NO EMOJIS)
// ============================================================================

const ARCHETYPE_CONFIG = {
  mentor: {
    icon: Brain,
    gradient: 'from-purple-500 via-purple-600 to-indigo-600',
    lightBg: 'from-purple-50 to-indigo-50',
    ringColor: 'ring-purple-500',
    iconColor: 'text-purple-600',
    barColor: 'from-purple-500 to-indigo-500',
    shadowColor: 'shadow-purple-500/20',
    hoverShadow: 'hover:shadow-purple-500/30',
  },
  friend: {
    icon: Heart,
    gradient: 'from-orange-400 via-pink-500 to-rose-500',
    lightBg: 'from-orange-50 to-pink-50',
    ringColor: 'ring-pink-500',
    iconColor: 'text-pink-600',
    barColor: 'from-orange-500 to-pink-500',
    shadowColor: 'shadow-pink-500/20',
    hoverShadow: 'hover:shadow-pink-500/30',
  },
  explorer: {
    icon: Compass,
    gradient: 'from-teal-500 via-emerald-500 to-green-600',
    lightBg: 'from-teal-50 to-emerald-50',
    ringColor: 'ring-teal-500',
    iconColor: 'text-teal-600',
    barColor: 'from-teal-500 to-emerald-500',
    shadowColor: 'shadow-teal-500/20',
    hoverShadow: 'hover:shadow-teal-500/30',
  },
};

// ============================================================================
// MAIN ARCHETYPE CARD
// ============================================================================

export function ArchetypeCard({
  archetype,
  selected = false,
  onClick,
  showTraits = true,
  className,
}: ArchetypeCardProps) {
  const info = getArchetypeDescription(archetype);
  const config = ARCHETYPE_CONFIG[archetype];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 cursor-pointer bg-white',
        'hover:shadow-2xl hover:-translate-y-1',
        config.shadowColor,
        config.hoverShadow,
        selected && 'ring-4 ring-offset-2',
        selected && config.ringColor,
        !selected && 'hover:shadow-xl',
        className
      )}
      onClick={onClick}
    >
      {/* Selected Indicator - Clean checkmark */}
      {selected && (
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-white blur-md opacity-50" />
            {/* Checkmark container */}
            <div className="relative bg-white rounded-full p-2 shadow-lg">
              <Check className={cn('w-5 h-5', config.iconColor)} strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {/* Gradient Header with Icon */}
      <div className={cn(
        'relative h-40 bg-gradient-to-br',
        config.gradient
      )}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Icon with glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full scale-150" />
            {/* Icon container */}
            <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-3xl transform group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Archetype Name Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white font-bold px-4 py-2 text-sm shadow-lg">
            {info.name}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Tagline */}
        <p className="text-base font-semibold text-gray-900">
          {info.tagline}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {info.description}
        </p>

        {/* Best For - Gradient card */}
        <div className={cn(
          'relative overflow-hidden rounded-2xl p-4 border-0',
          'bg-gradient-to-br',
          config.lightBg
        )}>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Best For
            </p>
            <p className="text-sm text-gray-900 font-medium leading-relaxed">
              {info.bestFor}
            </p>
          </div>
        </div>

        {/* Personality Traits */}
        {showTraits && (
          <div className="pt-4 space-y-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Personality Traits
            </p>
            <div className="space-y-3">
              {Object.entries(info.traits).map(([key, value]) => (
                <TraitBar
                  key={key}
                  label={TRAIT_LABELS[key as keyof PersonalityTraits]}
                  value={value}
                  gradient={config.barColor}
                />
              ))}
            </div>
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
  gradient: string;
}

function TraitBar({ label, value, gradient }: TraitBarProps) {
  const percentage = (value / 10) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}/10</span>
      </div>
      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        {/* Gradient progress bar */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r',
            gradient
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT (for mobile/smaller spaces)
// ============================================================================

export interface ArchetypeCardCompactProps {
  archetype: CompanionArchetype;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Compact horizontal card for mobile or constrained spaces
 */
export function ArchetypeCardCompact({
  archetype,
  selected = false,
  onClick,
  className,
}: ArchetypeCardCompactProps) {
  const info = getArchetypeDescription(archetype);
  const config = ARCHETYPE_CONFIG[archetype];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full p-5 rounded-2xl transition-all duration-300 bg-white',
        'hover:shadow-xl active:scale-[0.98]',
        config.shadowColor,
        config.hoverShadow,
        selected && 'ring-4 ring-offset-2',
        selected && config.ringColor,
        selected && cn('bg-gradient-to-br', config.lightBg),
        !selected && 'hover:shadow-lg border border-gray-100',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon with gradient background */}
        <div className="flex-shrink-0 relative">
          <div className={cn(
            'p-3.5 rounded-2xl bg-gradient-to-br shadow-lg transform transition-transform duration-300',
            config.gradient,
            'group-hover:scale-110'
          )}>
            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-left space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{info.name}</h3>
            {selected && (
              <Check className={cn('w-5 h-5', config.iconColor)} strokeWidth={3} />
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {info.tagline}
          </p>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// PREVIEW VARIANT (for tooltips/inline display)
// ============================================================================

export interface ArchetypePreviewProps {
  archetype: CompanionArchetype;
  showDescription?: boolean;
  className?: string;
}

/**
 * Minimal inline preview for tooltips or compact displays
 */
export function ArchetypePreview({ 
  archetype, 
  showDescription = false,
  className 
}: ArchetypePreviewProps) {
  const info = getArchetypeDescription(archetype);
  const config = ARCHETYPE_CONFIG[archetype];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {/* Small icon with gradient */}
      <div className={cn(
        'p-2 rounded-xl bg-gradient-to-br shadow-md',
        config.gradient
      )}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      
      {/* Text content */}
      <div className="space-y-0.5">
        <p className="text-sm font-bold text-gray-900">{info.name}</p>
        {showDescription && (
          <p className="text-xs text-gray-600">{info.tagline}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ARCHETYPE SELECTOR (horizontal layout)
// ============================================================================

export interface ArchetypeSelectorProps {
  currentArchetype: CompanionArchetype;
  onSelect: (archetype: CompanionArchetype) => void;
  variant?: 'full' | 'compact';
  className?: string;
}

/**
 * Full selector component with all three archetypes
 */
export function ArchetypeSelector({
  currentArchetype,
  onSelect,
  variant = 'full',
  className,
}: ArchetypeSelectorProps) {
  const archetypes: CompanionArchetype[] = ['mentor', 'friend', 'explorer'];
  
  const CardComponent = variant === 'compact' ? ArchetypeCardCompact : ArchetypeCard;

  return (
    <div className={cn(
      'grid gap-6',
      variant === 'compact' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3',
      className
    )}>
      {archetypes.map((archetype) => (
        <CardComponent
          key={archetype}
          archetype={archetype}
          selected={currentArchetype === archetype}
          onClick={() => onSelect(archetype)}
          showTraits={variant === 'full'}
        />
      ))}
    </div>
  );
}