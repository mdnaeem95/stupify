/**
 * USE ARCHETYPE SELECTOR HOOK - Phase 2
 * 
 * React hook for managing archetype selection with API integration.
 * 
 * Features:
 * - Fetches current companion archetype
 * - Handles archetype updates via API
 * - Loading and error states
 * - Optimistic updates
 * - Success callbacks
 */

'use client';

import { useState, useCallback } from 'react';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { type Companion } from '@/lib/companion/types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseArchetypeSelectorOptions {
  companionId?: string;
  initialArchetype?: CompanionArchetype;
  onSuccess?: (archetype: CompanionArchetype) => void;
  onError?: (error: Error) => void;
}

export interface UseArchetypeSelectorReturn {
  currentArchetype: CompanionArchetype | undefined;
  isLoading: boolean;
  error: string | null;
  updateArchetype: (archetype: CompanionArchetype) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing archetype selection with API integration
 */
export function useArchetypeSelector(
  options: UseArchetypeSelectorOptions = {}
): UseArchetypeSelectorReturn {
  const { initialArchetype, onSuccess, onError } = options;

  const [currentArchetype, setCurrentArchetype] = useState<CompanionArchetype | undefined>(
    initialArchetype
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update archetype via API
   */
  const updateArchetype = useCallback(
    async (archetype: CompanionArchetype) => {
      setIsLoading(true);
      setError(null);

      try {
        // Call API to update companion archetype
        const response = await fetch('/api/companion', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            archetype,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update archetype');
        }

        // Update local state
        setCurrentArchetype(archetype);

        // Call success callback
        if (onSuccess) {
          onSuccess(archetype);
        }

        console.log('[ARCHETYPE] ✅ Updated to:', archetype);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update archetype';
        setError(errorMessage);

        // Call error callback
        if (onError && err instanceof Error) {
          onError(err);
        }

        console.error('[ARCHETYPE] ❌ Update failed:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setError(null);
    setCurrentArchetype(initialArchetype);
  }, [initialArchetype]);

  return {
    currentArchetype,
    isLoading,
    error,
    updateArchetype,
    reset,
  };
}

// ============================================================================
// FETCH CURRENT ARCHETYPE
// ============================================================================

/**
 * Fetch companion's current archetype
 */
export async function fetchCurrentArchetype(): Promise<CompanionArchetype | null> {
  try {
    const response = await fetch('/api/companion');

    if (!response.ok) {
      console.error('[ARCHETYPE] Failed to fetch companion');
      return null;
    }

    const data = await response.json();
    const companion: Companion = data.companion;

    return companion.archetype;
  } catch (error) {
    console.error('[ARCHETYPE] Error fetching companion:', error);
    return null;
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// In a component:

import { useArchetypeSelector } from '@/hooks/useArchetypeSelector';
import { ArchetypeSelector } from '@/components/companion/ArchetypeSelector';

function MyComponent() {
  const { currentArchetype, updateArchetype, isLoading, error } = useArchetypeSelector({
    initialArchetype: 'friend',
    onSuccess: (archetype) => {
      console.log('Updated to:', archetype);
      // Show toast notification
    },
    onError: (error) => {
      console.error('Update failed:', error);
      // Show error notification
    },
  });

  return (
    <ArchetypeSelector
      currentArchetype={currentArchetype}
      onConfirm={updateArchetype}
    />
  );
}
*/