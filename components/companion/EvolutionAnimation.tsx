/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * EVOLUTION ANIMATION - Phase 2, Days 15-17
 * 
 * Animated modal that plays when companion evolves to a new stage.
 * 
 * Features:
 * - Full-screen celebration animation
 * - Stage transition effect
 * - Confetti/particle effects
 * - Evolution message
 * - Auto-dismiss or manual continue
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CompanionAvatar } from './CompanionAvatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Star, Zap } from 'lucide-react';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { type EvolutionStage, getUnlockMessage, getArchetypeStageTraits, EVOLUTION_STAGES } from '@/lib/companion/evolution-config';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface EvolutionAnimationProps {
  archetype: CompanionArchetype;
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
  companionName: string;
  level: number;
  onComplete?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EvolutionAnimation({
  archetype,
  fromStage,
  toStage,
  companionName,
  level,
  onComplete,
  autoDismiss = false,
  autoDismissDelay = 5000,
}: EvolutionAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'transform' | 'celebrate' | 'exit'>('enter');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContinue, setShowContinue] = useState(false);

  const toStageConfig = EVOLUTION_STAGES[toStage];
  const toStageTraits = getArchetypeStageTraits(archetype, toStage);
  const message = getUnlockMessage(toStage);

  // Animation sequence
  useEffect(() => {
    const sequence = [
      { phase: 'enter', delay: 0 },
      { phase: 'transform', delay: 1000 },
      { phase: 'celebrate', delay: 3000 },
    ];

    sequence.forEach(({ phase, delay }) => {
      setTimeout(() => {
        setAnimationPhase(phase as any);
        
        if (phase === 'celebrate') {
          generateParticles();
          setShowContinue(true);
        }
      }, delay);
    });

    // Auto-dismiss
    if (autoDismiss) {
      setTimeout(() => {
        handleComplete();
      }, autoDismissDelay);
    }
  }, [autoDismiss, autoDismissDelay]);

  // Generate celebration particles
  const generateParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: ['#FCD34D', '#F97316', '#8B5CF6', '#14B8A6'][Math.floor(Math.random() * 4)],
        duration: Math.random() * 2 + 1,
      });
    }
    setParticles(newParticles);
  };

  const handleComplete = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm',
        'transition-opacity duration-500',
        animationPhase === 'exit' ? 'opacity-0' : 'opacity-100'
      )}
      onClick={showContinue ? handleComplete : undefined}
    >
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Main content */}
      <Card
        className={cn(
          'relative p-8 max-w-md w-full mx-4 text-center',
          'transition-all duration-1000',
          animationPhase === 'enter' && 'scale-50 opacity-0',
          animationPhase === 'transform' && 'scale-100 opacity-100',
          animationPhase === 'celebrate' && 'scale-100 opacity-100',
          animationPhase === 'exit' && 'scale-125 opacity-0'
        )}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">
              Evolution Complete!
            </h2>
            <Star className="w-6 h-6 text-yellow-500 animate-spin" />
          </div>
          <p className="text-gray-600">
            {companionName} evolved into {toStageConfig.name}!
          </p>
        </div>

        {/* Avatar transformation */}
        <div className="flex items-center justify-center gap-8 mb-6">
          {/* Old stage (fading out) */}
          <div
            className={cn(
              'transition-all duration-1000',
              animationPhase === 'transform' && 'opacity-0 scale-75',
              animationPhase === 'celebrate' && 'opacity-0 scale-50'
            )}
          >
            <CompanionAvatar
              archetype={archetype}
              stage={fromStage}
              size="xl"
            />
          </div>

          {/* Arrow */}
          <div
            className={cn(
              'transition-all duration-500',
              animationPhase === 'enter' && 'opacity-0',
              animationPhase === 'transform' && 'opacity-100'
            )}
          >
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>

          {/* New stage (fading in) */}
          <div
            className={cn(
              'transition-all duration-1000',
              animationPhase === 'enter' && 'opacity-0 scale-50',
              animationPhase === 'transform' && 'opacity-100 scale-100',
              animationPhase === 'celebrate' && 'opacity-100 scale-110'
            )}
          >
            <CompanionAvatar
              archetype={archetype}
              stage={toStage}
              size="xl"
              glowing={animationPhase === 'celebrate'}
              animated={animationPhase === 'celebrate'}
            />
          </div>
        </div>

        {/* New stage info */}
        <div
          className={cn(
            'space-y-4 mb-6 transition-all duration-500',
            animationPhase !== 'celebrate' && 'opacity-0',
            animationPhase === 'celebrate' && 'opacity-100'
          )}
        >
          {/* Message */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <p className="text-lg font-medium text-gray-900 mb-2">
              &quot;{message}&quot;
            </p>
            <p className="text-sm text-gray-600">
              {toStageTraits.personality}
            </p>
          </div>

          {/* New abilities */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-900">
                New Ability Unlocked!
              </p>
              <p className="text-xs text-blue-700">
                {toStageTraits.specialAbility}
              </p>
            </div>
          </div>

          {/* Level info */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>Reached Level {level}</span>
            <span>•</span>
            <span>{toStageConfig.name} Stage</span>
          </div>
        </div>

        {/* Continue button */}
        {showContinue && (
          <Button
            onClick={handleComplete}
            size="lg"
            className={cn(
              'w-full transition-all duration-500',
              animationPhase !== 'celebrate' && 'opacity-0',
              animationPhase === 'celebrate' && 'opacity-100'
            )}
          >
            Continue Learning Together! 🎉
          </Button>
        )}

        {/* Auto-dismiss hint */}
        {autoDismiss && showContinue && (
          <p className="text-xs text-gray-500 mt-3">
            Click anywhere to continue
          </p>
        )}
      </Card>
    </div>
  );
}

// ============================================================================
// MINI EVOLUTION NOTIFICATION
// ============================================================================

export interface EvolutionNotificationProps {
  archetype: CompanionArchetype;
  toStage: EvolutionStage;
  companionName: string;
  onDismiss?: () => void;
}

/**
 * Smaller notification variant for less intrusive evolution alerts
 */
export function EvolutionNotification({
  archetype,
  toStage,
  companionName,
  onDismiss,
}: EvolutionNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toStageConfig = EVOLUTION_STAGES[toStage];

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[9999] max-w-sm',
        'transition-all duration-300',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <CompanionAvatar
            archetype={archetype}
            stage={toStage}
            size="md"
            glowing
          />
          
          <div className="flex-1">
            <p className="font-bold text-lg">Evolution! 🎉</p>
            <p className="text-sm opacity-90">
              {companionName} is now {toStageConfig.name}!
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      </Card>
    </div>
  );
}