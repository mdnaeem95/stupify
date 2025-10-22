// ============================================================================
// STUPIFY AI COMPANION FEATURE - USE COMPANION HOOK
// Created: October 22, 2025
// Version: 1.0
// Description: Hook for managing companion state
// ============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Companion, UpdateCompanionPayload } from '@/lib/companion/types';

interface UseCompanionReturn {
  companion: Companion | null;
  progress: {
    current_xp: number;
    xp_to_next_level: number;
    progress_percentage: number;
    current_level: number;
    xp_for_current_level: number;
    xp_for_next_level: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  updateCompanion: (updates: UpdateCompanionPayload) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useCompanion - Manage companion state
 * 
 * Features:
 * - Fetch companion on mount
 * - Update companion (name, archetype)
 * - Auto-create if doesn't exist
 * - Loading & error states
 * - Refetch capability
 * 
 * @returns Companion state and methods
 */
export function useCompanion(): UseCompanionReturn {
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [progress, setProgress] = useState<NonNullable<UseCompanionReturn['progress']> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch companion from API
   */
  const fetchCompanion = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/companion', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch companion: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch companion');
      }

      setCompanion(data.companion);
      
      // Set progress if available
      if (data.companion.progress) {
        setProgress(data.companion.progress);
      }
    } catch (err) {
      console.error('Error fetching companion:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companion');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update companion
   */
  const updateCompanion = useCallback(async (updates: UpdateCompanionPayload) => {
    try {
      setError(null);

      const response = await fetch('/api/companion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update companion: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update companion');
      }

      setCompanion(data.companion);
      
      // Update progress if available
      if (data.companion.progress) {
        setProgress(data.companion.progress);
      }
    } catch (err) {
      console.error('Error updating companion:', err);
      setError(err instanceof Error ? err.message : 'Failed to update companion');
      throw err; // Re-throw so caller can handle
    }
  }, []);

  /**
   * Refetch companion (useful after XP awards)
   */
  const refetch = useCallback(async () => {
    await fetchCompanion();
  }, [fetchCompanion]);

  // Fetch companion on mount
  useEffect(() => {
    fetchCompanion();
  }, [fetchCompanion]);

  return {
    companion,
    progress,
    isLoading,
    error,
    updateCompanion,
    refetch,
  };
}