/**
 * ARCHETYPE SELECTOR COMPONENT - Redesigned v2.0
 * 
 * Following STUPIFY Design Principles:
 * - Clean, minimal interface
 * - Better typography hierarchy
 * - Premium confirmation dialog
 * - Smooth transitions
 * - Mobile-first responsive
 * 
 * Features:
 * - Displays all 3 archetype options
 * - Visual selection state
 * - Confirmation dialog for changes
 * - API integration to update companion
 * - Loading and error states
 * - Success feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArchetypeCard, ArchetypeCardCompact } from './ArchetypeCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { type CompanionArchetype, getAllArchetypes, getArchetypeDescription } from '@/lib/companion/archetypes';
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

  // Get archetype info for dialog
  const fromArchetype = currentArchetype ? getArchetypeDescription(currentArchetype) : null;
  const toArchetype = selectedArchetype ? getArchetypeDescription(selectedArchetype) : null;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header - Better typography */}
      {!isOnboarding && (
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">
            Personality Type
          </h3>
          <p className="text-base text-gray-600 leading-relaxed">
            Choose the teaching style that works best for you
          </p>
        </div>
      )}

      {isOnboarding && (
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            Choose Your Companion
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Each personality brings a unique approach to your learning journey
          </p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg shadow-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900 font-medium">
            Companion personality updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="bg-gradient-to-r from-red-50 to-pink-50 border-0 shadow-lg shadow-red-500/10">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-900 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Archetype Cards */}
      {showCompact ? (
        // Compact vertical layout for mobile
        <div className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 font-semibold gap-2"
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

      {/* Confirmation Dialog - Redesigned */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Companion Personality?</DialogTitle>
            <DialogDescription>
              Your companion will adopt a new personality style. Their level and progress 
              will remain the same, but future messages will match the new archetype.
            </DialogDescription>
          </DialogHeader>

          {/* Visual comparison - Clean card design */}
          <div className="py-1">
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-5">
              <div className="flex items-center justify-between gap-6">
                {/* From */}
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">From</p>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900">
                      {fromArchetype?.name}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {fromArchetype?.tagline}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-full bg-white shadow-sm">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* To */}
                <div className="flex-1 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">To</p>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900">
                      {toArchetype?.name}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {toArchetype?.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 font-semibold"
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