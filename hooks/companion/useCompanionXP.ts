/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - USE COMPANION XP HOOK
// Created: October 22, 2025
// Version: 1.0
// Description: Hook for awarding XP and handling level ups
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import type { AwardXPResponse, Companion } from '@/lib/companion/types';

interface UseCompanionXPReturn {
  awardXP: (action: string, amount?: number, metadata?: Record<string, any>) => Promise<AwardXPResponse | null>;
  awardQuestionXP: (simplicityLevel: '5yo' | 'normal' | 'advanced', metadata?: Record<string, any>) => Promise<AwardXPResponse | null>;
  isAwarding: boolean;
  error: string | null;
  lastLevelUp: {
    oldLevel: number;
    newLevel: number;
    companion: Companion;
  } | null;
  clearLastLevelUp: () => void;
}

/**
 * useCompanionXP - Award XP and handle level ups
 * 
 * Features:
 * - Award XP for any action
 * - Quick XP for questions
 * - Track level ups
 * - Loading & error states
 * - Last level up state for modal
 * 
 * @returns XP award methods and state
 */
export function useCompanionXP(): UseCompanionXPReturn {
  const [isAwarding, setIsAwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLevelUp, setLastLevelUp] = useState<UseCompanionXPReturn['lastLevelUp']>(null);

  /**
   * Award XP for a specific action
   */
  const awardXP = useCallback(async (
    action: string,
    amount?: number,
    metadata?: Record<string, any>
  ): Promise<AwardXPResponse | null> => {
    try {
      setIsAwarding(true);
      setError(null);

      const response = await fetch('/api/companion/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          amount,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to award XP: ${response.statusText}`);
      }

      const data: AwardXPResponse = await response.json();

      if (!data.success) {
        throw new Error('error' in data ? data.error as string : 'Failed to award XP');
      }

      // Check if leveled up
      if (data.leveled_up && data.new_level) {
        setLastLevelUp({
          oldLevel: data.new_level - 1, // Calculate old level
          newLevel: data.new_level,
          companion: data.companion,
        });
      }

      return data;
    } catch (err) {
      console.error('Error awarding XP:', err);
      setError(err instanceof Error ? err.message : 'Failed to award XP');
      return null;
    } finally {
      setIsAwarding(false);
    }
  }, []);

  /**
   * Award XP for asking a question (convenience method)
   */
  const awardQuestionXP = useCallback(async (
    simplicityLevel: '5yo' | 'normal' | 'advanced',
    metadata?: Record<string, any>
  ): Promise<AwardXPResponse | null> => {
    try {
      setIsAwarding(true);
      setError(null);

      const response = await fetch('/api/companion/xp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          simplicity_level: simplicityLevel,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to award question XP: ${response.statusText}`);
      }

      const data: AwardXPResponse = await response.json();

      if (!data.success) {
        throw new Error('error' in data ? data.error as string : 'Failed to award XP');
      }

      // Check if leveled up
      if (data.leveled_up && data.new_level) {
        setLastLevelUp({
          oldLevel: data.new_level - 1,
          newLevel: data.new_level,
          companion: data.companion,
        });
      }

      return data;
    } catch (err) {
      console.error('Error awarding question XP:', err);
      setError(err instanceof Error ? err.message : 'Failed to award XP');
      return null;
    } finally {
      setIsAwarding(false);
    }
  }, []);

  /**
   * Clear last level up (after modal is closed)
   */
  const clearLastLevelUp = useCallback(() => {
    setLastLevelUp(null);
  }, []);

  return {
    awardXP,
    awardQuestionXP,
    isAwarding,
    error,
    lastLevelUp,
    clearLastLevelUp,
  };
}