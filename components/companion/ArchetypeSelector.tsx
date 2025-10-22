/**
 * ARCHETYPE SELECTOR COMPONENT - Phase 2
 * 
 * Main interface for selecting and changing companion archetype.
 * Shows all 3 archetypes and handles selection flow.
 * 
 * Features:
 * - Displays all 3 archetype options
 * - Visual selection state
 * - Confirmation dialog for changes
 * - API integration to update companion
 * - Mobile-responsive (stacked on mobile, grid on desktop)
 * - Loading and error states
 * - Success feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArchetypeCard, ArchetypeCardCompact } from './ArchetypeCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { type CompanionArchetype, getAllArchetypes } from '@/lib/companion/archetypes';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ArchetypeSelectorProps {
  currentArchetype?: CompanionArchetype;
  onSelect?: (archetype: CompanionArchetype) => void;
  onConfirm?: (archetype: CompanionArchetype) => Promise<void>;
  showCompact?: boolean;
  allowChange?: boolean;
  isOnboarding?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ArchetypeSelector({
  currentArchetype,
  onSelect,
  onConfirm,
  showCompact = false,
  allowChange = true,
  isOnboarding = false,
  className,
}: ArchetypeSelectorProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<CompanionArchetype | undefined>(
    currentArchetype
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const archetypes = getAllArchetypes();
  const hasChanged = selectedArchetype !== currentArchetype;

  // Reset selection if currentArchetype changes
  useEffect(() => {
    if (currentArchetype) {
      setSelectedArchetype(currentArchetype);
    }
  }, [currentArchetype]);

  // Handle archetype selection
  const handleSelect = (archetype: CompanionArchetype) => {
    setSelectedArchetype(archetype);
    setError(null);
    setSuccess(false);
    
    if (onSelect) {
      onSelect(archetype);
    }

    // In onboarding mode, no confirmation needed
    if (isOnboarding) {
      return;
    }

    // If changing from existing archetype, show confirmation
    if (currentArchetype && archetype !== currentArchetype && allowChange) {
      setShowConfirmDialog(true);
    }
  };

  // Handle confirmation
  const handleConfirm = async () => {
    if (!selectedArchetype || !onConfirm) return;

    setIsLoading(true);
    setError(null);

    try {
      await onConfirm(selectedArchetype);
      setSuccess(true);
      setShowConfirmDialog(false);
      
      // Show success message briefly
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update archetype');
      setShowConfirmDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedArchetype(currentArchetype);
    setShowConfirmDialog(false);
    setError(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isOnboarding ? 'Choose Your Companion' : 'Your Companion Personality'}
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          {isOnboarding 
            ? 'Each personality brings a unique approach to your learning journey. Pick the one that resonates with you!'
            : 'Your companion adapts their messages and style based on their personality.'
          }
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Companion personality updated successfully!
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

      {/* Archetype Cards */}
      {showCompact ? (
        // Compact vertical layout for mobile
        <div className="space-y-3">
          {archetypes.map((def) => (
            <ArchetypeCardCompact
              key={def.id}
              archetype={def.id}
              selected={selectedArchetype === def.id}
              onClick={() => handleSelect(def.id)}
            />
          ))}
        </div>
      ) : (
        // Full card grid for desktop
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {archetypes.map((def) => (
            <ArchetypeCard
              key={def.id}
              archetype={def.id}
              selected={selectedArchetype === def.id}
              onClick={() => handleSelect(def.id)}
              showTraits={!isOnboarding}
            />
          ))}
        </div>
      )}

      {/* Action Buttons (only show in non-onboarding mode with changes) */}
      {!isOnboarding && allowChange && hasChanged && (
        <div className="flex justify-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Update Personality
              </>
            )}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Companion Personality?</DialogTitle>
            <DialogDescription>
              Your companion will adopt a new personality style. Their level and progress 
              will remain the same, but future messages will match the new archetype.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Changing from:</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {currentArchetype}
                </p>
              </div>
              <div className="text-2xl">→</div>
              <div>
                <p className="text-sm text-gray-600">Changing to:</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {selectedArchetype}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm Change'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// SIMPLE SELECTOR (for settings page)
// ============================================================================

export interface SimpleArchetypeSelectorProps {
  currentArchetype: CompanionArchetype;
  onUpdate: (archetype: CompanionArchetype) => Promise<void>;
  className?: string;
}

/**
 * Simplified selector for settings page
 */
export function SimpleArchetypeSelector({
  currentArchetype,
  onUpdate,
  className,
}: SimpleArchetypeSelectorProps) {
  return (
    <ArchetypeSelector
      currentArchetype={currentArchetype}
      onConfirm={onUpdate}
      showCompact={false}
      allowChange={true}
      isOnboarding={false}
      className={className}
    />
  );
}

// ============================================================================
// ONBOARDING SELECTOR (for initial setup)
// ============================================================================

export interface OnboardingArchetypeSelectorProps {
  onSelect: (archetype: CompanionArchetype) => void;
  selectedArchetype?: CompanionArchetype;
  className?: string;
}

/**
 * Onboarding version - no confirmation, just selection
 */
export function OnboardingArchetypeSelector({
  onSelect,
  selectedArchetype,
  className,
}: OnboardingArchetypeSelectorProps) {
  return (
    <ArchetypeSelector
      currentArchetype={selectedArchetype}
      onSelect={onSelect}
      showCompact={false}
      allowChange={true}
      isOnboarding={true}
      className={className}
    />
  );
}