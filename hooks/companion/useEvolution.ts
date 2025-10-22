/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * USE EVOLUTION HOOK - Phase 2, Days 15-17
 * 
 * React hook for managing companion evolution.
 * 
 * Features:
 * - Detect evolution events
 * - Trigger evolution animation
 * - Track evolution history
 * - Handle evolution callbacks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import {
  type EvolutionStage,
  getStageForLevel,
  willEvolveOnNextLevel,
  getNextStage,
  getPreviousStage,
} from '@/lib/companion/evolution-config';

// ============================================================================
// TYPES
// ============================================================================

export interface EvolutionEvent {
  fromStage: EvolutionStage;
  toStage: EvolutionStage;
  level: number;
  timestamp: Date;
}

export interface UseEvolutionOptions {
  archetype: CompanionArchetype;
  currentLevel: number;
  companionName: string;
  onEvolution?: (event: EvolutionEvent) => void;
  autoShowAnimation?: boolean;
}

export interface UseEvolutionReturn {
  currentStage: EvolutionStage;
  nextStage: EvolutionStage | null;
  previousStage: EvolutionStage | null;
  willEvolveNext: boolean;
  isEvolving: boolean;
  evolutionHistory: EvolutionEvent[];
  
  // Animation control
  showEvolutionAnimation: boolean;
  triggerEvolution: () => void;
  dismissEvolution: () => void;
  
  // Info
  hasEvolved: boolean;
  lastEvolution: EvolutionEvent | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEvolution({
  currentLevel,
  onEvolution,
  autoShowAnimation = true,
}: UseEvolutionOptions): UseEvolutionReturn {
  const [currentStage, setCurrentStage] = useState<EvolutionStage>(
    getStageForLevel(currentLevel)
  );
  const [previousLevel, setPreviousLevel] = useState(currentLevel);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [evolutionHistory, setEvolutionHistory] = useState<EvolutionEvent[]>([]);
  
  // Use ref to track if we've already evolved at this level
  const lastEvolutionLevel = useRef<number>(0);

  // Detect evolution
  useEffect(() => {
    const newStage = getStageForLevel(currentLevel);
    
    // Check if level increased and stage changed
    if (
      currentLevel > previousLevel &&
      newStage !== currentStage &&
      currentLevel !== lastEvolutionLevel.current
    ) {
      // Evolution detected!
      const event: EvolutionEvent = {
        fromStage: currentStage,
        toStage: newStage,
        level: currentLevel,
        timestamp: new Date(),
      };
      
      console.log('[EVOLUTION] Evolution detected!', event);
      
      // Update state
      setCurrentStage(newStage);
      setIsEvolving(true);
      lastEvolutionLevel.current = currentLevel;
      
      // Add to history
      setEvolutionHistory(prev => [...prev, event]);
      
      // Show animation
      if (autoShowAnimation) {
        setShowEvolutionAnimation(true);
      }
      
      // Callback
      if (onEvolution) {
        onEvolution(event);
      }
      
      // Reset evolving state after animation
      setTimeout(() => {
        setIsEvolving(false);
      }, 5000);
    }
    
    setPreviousLevel(currentLevel);
  }, [currentLevel, previousLevel, currentStage, onEvolution, autoShowAnimation]);

  // Computed values
  const nextStage = getNextStage(currentStage);
  const previousStage = getPreviousStage(currentStage);
  const willEvolveNext = willEvolveOnNextLevel(currentLevel);
  const hasEvolved = evolutionHistory.length > 0;
  const lastEvolution = evolutionHistory.length > 0 
    ? evolutionHistory[evolutionHistory.length - 1] 
    : null;

  // Manually trigger evolution animation
  const triggerEvolution = useCallback(() => {
    setShowEvolutionAnimation(true);
  }, []);

  // Dismiss evolution animation
  const dismissEvolution = useCallback(() => {
    setShowEvolutionAnimation(false);
  }, []);

  return {
    currentStage,
    nextStage,
    previousStage,
    willEvolveNext,
    isEvolving,
    evolutionHistory,
    showEvolutionAnimation,
    triggerEvolution,
    dismissEvolution,
    hasEvolved,
    lastEvolution,
  };
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to persist evolution history to localStorage
 */
export function usePersistentEvolutionHistory(
  companionId: string,
  evolutionHistory: EvolutionEvent[]
) {
  useEffect(() => {
    if (evolutionHistory.length > 0) {
      try {
        localStorage.setItem(
          `evolution_history_${companionId}`,
          JSON.stringify(evolutionHistory)
        );
      } catch (error) {
        console.error('[EVOLUTION] Error saving history:', error);
      }
    }
  }, [companionId, evolutionHistory]);
}

/**
 * Hook to load evolution history from localStorage
 */
export function useLoadEvolutionHistory(companionId: string): EvolutionEvent[] {
  const [history, setHistory] = useState<EvolutionEvent[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`evolution_history_${companionId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const events = parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
        setHistory(events);
      }
    } catch (error) {
      console.error('[EVOLUTION] Error loading history:', error);
    }
  }, [companionId]);

  return history;
}

/**
 * Hook for evolution celebration tracking
 */
export function useEvolutionCelebration() {
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const [celebrationTimeout, setCelebrationTimeout] = useState<NodeJS.Timeout | null>(null);

  const startCelebration = useCallback((duration: number = 5000) => {
    setShouldCelebrate(true);
    
    // Clear existing timeout
    if (celebrationTimeout) {
      clearTimeout(celebrationTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setShouldCelebrate(false);
    }, duration);
    
    setCelebrationTimeout(timeout);
  }, [celebrationTimeout]);

  const stopCelebration = useCallback(() => {
    setShouldCelebrate(false);
    if (celebrationTimeout) {
      clearTimeout(celebrationTimeout);
      setCelebrationTimeout(null);
    }
  }, [celebrationTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimeout) {
        clearTimeout(celebrationTimeout);
      }
    };
  }, [celebrationTimeout]);

  return {
    shouldCelebrate,
    startCelebration,
    stopCelebration,
  };
}