/**
 * EVOLUTION PROGRESS - Phase 2, Days 15-17
 * 
 * Component displaying companion's evolution progress.
 * 
 * Features:
 * - Current stage indicator
 * - Progress bar to next stage
 * - Levels until evolution
 * - Stage preview
 * - All stages roadmap
 */

'use client';

import React from 'react';
import { CompanionAvatar } from './CompanionAvatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, TrendingUp } from 'lucide-react';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { getStageForLevel, getStageProgress, getLevelsUntilEvolution, getNextStage, EVOLUTION_STAGES, getAllStages, isStageUnlocked, getArchetypeStageTraits } from '@/lib/companion/evolution-config';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface EvolutionProgressProps {
  archetype: CompanionArchetype;
  currentLevel: number;
  companionName: string;
  showRoadmap?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EvolutionProgress({
  archetype,
  currentLevel,
  showRoadmap = true,
  className,
}: EvolutionProgressProps) {
  const currentStage = getStageForLevel(currentLevel);
  const nextStage = getNextStage(currentStage);
  const stageProgress = getStageProgress(currentLevel);
  const levelsUntilEvolution = getLevelsUntilEvolution(currentLevel);
  const currentStageConfig = EVOLUTION_STAGES[currentStage];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Current stage card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <CompanionAvatar
            archetype={archetype}
            stage={currentStage}
            size="lg"
          />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {currentStageConfig.name} Stage
              </h3>
              <Badge variant="secondary">Level {currentLevel}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              {currentStageConfig.description}
            </p>
          </div>
        </div>

        {/* Traits */}
        <div className="flex flex-wrap gap-2 mb-4">
          {currentStageConfig.traits.map((trait) => (
            <Badge key={trait} variant="outline" className="text-xs">
              {trait}
            </Badge>
          ))}
        </div>

        {/* Progress to next stage */}
        {nextStage ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Progress to {EVOLUTION_STAGES[nextStage].name}
              </span>
              <span className="font-semibold text-gray-900">
                {Math.round(stageProgress * 100)}%
              </span>
            </div>

            <Progress value={stageProgress * 100} className="h-3" />

            <p className="text-xs text-gray-500">
              {levelsUntilEvolution === 1
                ? 'Next level you will evolve! 🎉'
                : `${levelsUntilEvolution} more levels until evolution`
              }
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">
              Maximum evolution reached! 🏆
            </p>
          </div>
        )}
      </Card>

      {/* Evolution roadmap */}
      {showRoadmap && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Evolution Stages
          </h3>

          <div className="space-y-4">
            {getAllStages().map((stage, index) => {
              const stageConfig = EVOLUTION_STAGES[stage];
              const isUnlocked = isStageUnlocked(stage, currentLevel);
              const isCurrent = stage === currentStage;
              const stageTraits = getArchetypeStageTraits(archetype, stage);

              return (
                <div
                  key={stage}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                    isCurrent && 'border-purple-500 bg-purple-50',
                    !isCurrent && isUnlocked && 'border-green-200 bg-green-50',
                    !isUnlocked && 'border-gray-200 bg-gray-50 opacity-60'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <CompanionAvatar
                      archetype={archetype}
                      stage={stage}
                      size="md"
                    />
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {stageConfig.name}
                      </h4>
                      <Badge
                        variant={isCurrent ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {isCurrent ? 'Current' : isUnlocked ? 'Unlocked' : 'Locked'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {stageConfig.description}
                    </p>

                    {/* Personality */}
                    <p className="text-xs text-gray-500 mb-1">
                      {stageTraits.personality}
                    </p>

                    {/* Special ability */}
                    {isUnlocked && (
                      <div className="flex items-center gap-2 text-xs text-purple-700">
                        <span className="font-medium">Special:</span>
                        <span>{stageTraits.specialAbility}</span>
                      </div>
                    )}

                    {/* Unlock requirement */}
                    {!isUnlocked && (
                      <p className="text-xs text-gray-500 mt-1">
                        Unlocks at level {stageConfig.minLevel}
                      </p>
                    )}
                  </div>

                  {/* Stage number */}
                  <div className="text-2xl font-bold text-gray-300">
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export interface CompactEvolutionProgressProps {
  archetype: CompanionArchetype;
  currentLevel: number;
  className?: string;
}

/**
 * Compact evolution progress for smaller spaces
 */
export function CompactEvolutionProgress({
  archetype,
  currentLevel,
  className,
}: CompactEvolutionProgressProps) {
  const currentStage = getStageForLevel(currentLevel);
  const nextStage = getNextStage(currentStage);
  const stageProgress = getStageProgress(currentLevel);
  const levelsUntilEvolution = getLevelsUntilEvolution(currentLevel);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Current stage */}
      <div className="flex items-center gap-3">
        <CompanionAvatar
          archetype={archetype}
          stage={currentStage}
          size="sm"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {EVOLUTION_STAGES[currentStage].name} Stage
          </p>
          {nextStage && levelsUntilEvolution && (
            <p className="text-xs text-gray-500">
              {levelsUntilEvolution} levels to {EVOLUTION_STAGES[nextStage].name}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {nextStage && (
        <Progress value={stageProgress * 100} className="h-2" />
      )}
    </div>
  );
}

// ============================================================================
// EVOLUTION PREVIEW (for next stage)
// ============================================================================

export interface EvolutionPreviewProps {
  archetype: CompanionArchetype;
  currentLevel: number;
  className?: string;
}

/**
 * Shows preview of next evolution stage
 */
export function EvolutionPreview({
  archetype,
  currentLevel,
  className,
}: EvolutionPreviewProps) {
  const currentStage = getStageForLevel(currentLevel);
  const nextStage = getNextStage(currentStage);
  const levelsUntilEvolution = getLevelsUntilEvolution(currentLevel);

  if (!nextStage || !levelsUntilEvolution) {
    return null;
  }

  const nextStageConfig = EVOLUTION_STAGES[nextStage];
  const nextStageTraits = getArchetypeStageTraits(archetype, nextStage);

  return (
    <Card className={cn('p-4 bg-gradient-to-r from-purple-50 to-pink-50', className)}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <CompanionAvatar
            archetype={archetype}
            stage={nextStage}
            size="md"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
            <Lock className="w-4 h-4 text-gray-700" />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
            Next Evolution
          </p>
          <p className="font-bold text-gray-900">
            {nextStageConfig.name}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        {nextStageConfig.description}
      </p>

      <p className="text-xs text-purple-700">
        <span className="font-medium">Unlocks:</span> {nextStageTraits.specialAbility}
      </p>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-600">
          {levelsUntilEvolution} {levelsUntilEvolution === 1 ? 'level' : 'levels'} away
        </span>
        <Badge variant="secondary" className="text-xs">
          Level {nextStageConfig.minLevel}+
        </Badge>
      </div>
    </Card>
  );
}