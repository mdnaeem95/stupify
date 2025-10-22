/**
 * COMPANION SETTINGS COMPONENT - Phase 2
 * 
 * Settings page for managing companion personality and preferences.
 * 
 * Features:
 * - Archetype selection
 * - Companion name customization
 * - Preview of current companion
 * - Save/cancel functionality
 * - Loading states
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { SimpleArchetypeSelector } from '../companion/ArchetypeSelector';
import { ArchetypePreview } from '../companion/ArchetypeCard';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { type Companion } from '@/lib/companion/types';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanionSettingsProps {
  companion: Companion;
  onUpdate?: (companion: Companion) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CompanionSettings({
  companion,
  onUpdate,
  className,
}: CompanionSettingsProps) {
  const [name, setName] = useState(companion.name);
  const [archetype, setArchetype] = useState<CompanionArchetype>(companion.archetype);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges = name !== companion.name || archetype !== companion.archetype;

  // Reset on companion change
  useEffect(() => {
    setName(companion.name);
    setArchetype(companion.archetype);
  }, [companion]);

  // Handle archetype update
  const handleArchetypeUpdate = async (newArchetype: CompanionArchetype) => {
    setArchetype(newArchetype);
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/companion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          archetype,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update companion');
      }

      const data = await response.json();
      const updatedCompanion: Companion = data.companion;

      // Show success
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Call onUpdate callback
      if (onUpdate) {
        onUpdate(updatedCompanion);
      }

      console.log('[COMPANION] ✅ Settings updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      console.error('[COMPANION] ❌ Settings update failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setName(companion.name);
    setArchetype(companion.archetype);
    setError(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Companion Settings
        </h2>
        <p className="text-gray-600 mt-1">
          Customize your learning companion&apos;s personality and preferences
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Companion settings updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Companion Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Current Companion
            </Label>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900">{companion.name}</p>
              <div className="mt-2">
                <ArchetypePreview archetype={companion.archetype} />
              </div>
            </div>
          </div>
          <div className="text-6xl">
            {archetype === 'mentor' && '🦉'}
            {archetype === 'friend' && '🌟'}
            {archetype === 'explorer' && '🧭'}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Level</p>
              <p className="font-semibold text-gray-900">{companion.level}</p>
            </div>
            <div>
              <p className="text-gray-600">Total XP</p>
              <p className="font-semibold text-gray-900">{companion.total_xp}</p>
            </div>
            <div>
              <p className="text-gray-600">Interactions</p>
              <p className="font-semibold text-gray-900">{companion.total_interactions}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-semibold text-gray-900">
                {new Date(companion.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Companion Name */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="companion-name" className="text-base font-semibold">
              Companion Name
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Give your companion a unique name
            </p>
          </div>
          
          <Input
            id="companion-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter companion name"
            maxLength={50}
            className="max-w-md"
          />

          <p className="text-xs text-gray-500">
            {name.length}/50 characters
          </p>
        </div>
      </Card>

      <Separator />

      {/* Personality Selection */}
      <div>
        <SimpleArchetypeSelector
          currentArchetype={archetype}
          onUpdate={handleArchetypeUpdate}
        />
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STANDALONE ARCHETYPE CHANGER
// ============================================================================

export interface QuickArchetypeChangerProps {
  companionId: string;
  currentArchetype: CompanionArchetype;
  onUpdate?: (archetype: CompanionArchetype) => void;
  className?: string;
}

/**
 * Quick archetype changer for modal/popover
 */
export function QuickArchetypeChanger({
  currentArchetype,
  onUpdate,
  className,
}: QuickArchetypeChangerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (archetype: CompanionArchetype) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/companion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archetype }),
      });

      if (!response.ok) {
        throw new Error('Failed to update archetype');
      }

      if (onUpdate) {
        onUpdate(archetype);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SimpleArchetypeSelector
        currentArchetype={currentArchetype}
        onUpdate={handleUpdate}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      )}
    </div>
  );
}