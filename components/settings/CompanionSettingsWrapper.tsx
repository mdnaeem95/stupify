/**
 * COMPANION SETTINGS WRAPPER - Phase 2
 * 
 * Wrapper component that fetches companion data and renders CompanionSettings.
 * Handles loading and error states.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CompanionSettings } from '@/components/settings/CompanionSettings';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type Companion } from '@/lib/companion/types';

export function CompanionSettingsWrapper() {
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companion on mount
  useEffect(() => {
    fetchCompanion();
  }, []);

  const fetchCompanion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/companion');

      if (!response.ok) {
        throw new Error('Failed to fetch companion');
      }

      const data = await response.json();
      setCompanion(data.companion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load companion');
      console.error('[COMPANION] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedCompanion: Companion) => {
    setCompanion(updatedCompanion);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading companion settings...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No companion (shouldn't happen, but handle it)
  if (!companion) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No companion found. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Render settings
  return (
    <CompanionSettings
      companion={companion}
      onUpdate={handleUpdate}
    />
  );
}