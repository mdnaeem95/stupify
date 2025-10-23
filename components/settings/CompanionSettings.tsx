/**
 * COMPANION SETTINGS COMPONENT - Redesigned v2.0
 * 
 * Following STUPIFY Design Principles:
 * - Clean, minimal, warm aesthetic
 * - No harsh borders (shadows for depth)
 * - Mobile-first responsive
 * - Proper spacing and hierarchy
 * - Premium but accessible
 * 
 * Features:
 * - Archetype selection with visual previews
 * - Companion name customization
 * - Stats overview with gradient accents
 * - Message history panel
 * - Smooth transitions and hover states
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuietModeToggle } from '../companion/QuietModeToggle';
import { Loader2, AlertCircle, CheckCircle2, Sparkles, Star, TrendingUp, MessageSquare, Calendar } from 'lucide-react';
import { SimpleArchetypeSelector } from '../companion/ArchetypeSelector';
import { ArchetypePreview } from '../companion/ArchetypeCard';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { type Companion } from '@/lib/companion/types';
import { cn } from '@/lib/utils';
import { MessageHistoryPanel } from '../companion/MessageHistoryPanel';

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
  const [quietMode, setQuietMode] = useState(companion.quiet_mode || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges = name !== companion.name || archetype !== companion.archetype || quietMode !== (companion.quiet_mode || false);

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

  // Get companion emoji based on archetype
  const getCompanionEmoji = (archetype: CompanionArchetype) => {
    switch (archetype) {
      case 'mentor':
        return '🦉';
      case 'friend':
        return '🌟';
      case 'explorer':
        return '🧭';
      default:
        return '🌟';
    }
  };

  return (
    <div className={cn('space-y-6 pb-8', className)}>
      {/* Header - Clean and minimal */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">
          Companion Settings
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Customize your learning companion&apos;s personality and preferences
        </p>
      </div>

      {/* Success Message - Gradient accent */}
      {success && (
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg shadow-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900 font-medium">
            Companion settings updated successfully!
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

      {/* Current Companion - Hero card with gradient */}
      <Card className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/15 transition-all duration-300">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2 rounded-full border border-indigo-100/50">
                <Sparkles className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
                <span className="text-sm font-semibold bg-gradient-to-r from-indigo-900 to-violet-900 bg-clip-text text-transparent">
                  Your Companion
                </span>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{companion.name}</h2>
                <div className="mt-3">
                  <ArchetypePreview archetype={companion.archetype} />
                </div>
              </div>
            </div>
            
            {/* Large companion emoji with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl rounded-full" />
              <div className="relative text-6xl">
                {getCompanionEmoji(companion.archetype)}
              </div>
            </div>
          </div>

          {/* Stats Grid - Clean and organized */}
          <div className="mt-8 pt-8 border-t border-indigo-100/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Star}
                label="Level"
                value={companion.level.toString()}
                gradient="from-yellow-500 to-orange-500"
              />
              <StatCard
                icon={TrendingUp}
                label="Total XP"
                value={companion.total_xp.toLocaleString()}
                gradient="from-indigo-500 to-violet-500"
              />
              <StatCard
                icon={MessageSquare}
                label="Interactions"
                value={companion.total_interactions.toLocaleString()}
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard
                icon={Calendar}
                label="Created"
                value={new Date(companion.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                gradient="from-purple-500 to-pink-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Companion Name - Simple and clean */}
      <Card className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companion-name" className="text-xl font-bold text-gray-900">
              Companion Name
            </Label>
            <p className="text-gray-600 leading-relaxed">
              Give your companion a unique name that reflects their personality
            </p>
          </div>
          
          <div className="space-y-3">
            <Input
              id="companion-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter companion name"
              maxLength={50}
              className="text-lg text-gray-900 py-6 px-5 rounded-2xl border-indigo-100 focus:border-indigo-300 focus:ring-indigo-500/20"
            />
            <p className="text-sm text-gray-500">
              {name.length}/50 characters
            </p>
          </div>
        </div>
      </Card>

      {/* Personality Selection - Prominent section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Personality Type
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Choose the teaching style that works best for you
          </p>
        </div>
        
        <SimpleArchetypeSelector
          currentArchetype={archetype}
          onUpdate={handleArchetypeUpdate}
        />
      </div>

      {/* Quiet Mode */}
      <Card className="p-6">
        <h3>Quiet Mode</h3>
        <QuietModeToggle isQuiet={quietMode} onToggle={setQuietMode} companionName={companion.name} />
      </Card>

      {/* Message History - Integrated section */}
      <Card className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Message History
            </h3>
            <p className="text-gray-600 leading-relaxed">
              View all messages from {companion.name}
            </p>
          </div>
          
          <MessageHistoryPanel 
            companionId={companion.id} 
            companionName={companion.name} 
            archetype={companion.archetype} 
          />
        </div>
      </Card>

      {/* Action Buttons - Floating when changes exist */}
      {hasChanges && (
        <div className="sticky bottom-6 z-10">
          <Card className="bg-white rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 border border-indigo-100/50">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-700">
                You have unsaved changes
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 font-semibold gap-2"
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
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  gradient: string;
}

function StatCard({ icon: Icon, label, value, gradient }: StatCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-5 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300">
      <div className={cn(
        "inline-flex p-2.5 rounded-xl bg-gradient-to-br mb-3 shadow-md",
        gradient
      )}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ============================================================================
// QUICK ARCHETYPE CHANGER (for modals/popovers)
// ============================================================================

export interface QuickArchetypeChangerProps {
  companionId: string;
  currentArchetype: CompanionArchetype;
  onUpdate?: (archetype: CompanionArchetype) => void;
  className?: string;
}

/**
 * Lightweight archetype changer for modal/popover contexts
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
    <div className={cn('space-y-6', className)}>
      {error && (
        <Alert className="bg-gradient-to-r from-red-50 to-pink-50 border-0 shadow-lg shadow-red-500/10">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-900 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <SimpleArchetypeSelector
        currentArchetype={currentArchetype}
        onUpdate={handleUpdate}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl rounded-full" />
            <Loader2 className="relative w-8 h-8 animate-spin text-indigo-600" />
          </div>
        </div>
      )}
    </div>
  );
}