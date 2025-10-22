/**
 * QUIET MODE TOGGLE - Phase 2, Day 13
 * 
 * Toggle component for enabling/disabling proactive messages.
 * Allows users to control message frequency.
 * 
 * Features:
 * - Simple on/off toggle
 * - Saves preference to localStorage
 * - Visual feedback
 * - Tooltip explanation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface QuietModeToggleProps {
  userId: string;
  onChange?: (enabled: boolean) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function QuietModeToggle({
  userId,
  onChange,
  className,
}: QuietModeToggleProps) {
  const [quietMode, setQuietMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load quiet mode preference on mount
  useEffect(() => {
    const loadPreference = () => {
      try {
        const stored = localStorage.getItem(`quietMode_${userId}`);
        if (stored !== null) {
          const enabled = stored === 'true';
          setQuietMode(enabled);
        }
      } catch (error) {
        console.error('[QUIET MODE] Error loading preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [userId]);

  // Handle toggle
  const handleToggle = (enabled: boolean) => {
    setQuietMode(enabled);

    // Save to localStorage
    try {
      localStorage.setItem(`quietMode_${userId}`, enabled.toString());
    } catch (error) {
      console.error('[QUIET MODE] Error saving preference:', error);
    }

    // Callback
    if (onChange) {
      onChange(enabled);
    }

    console.log('[QUIET MODE]', enabled ? 'Enabled' : 'Disabled');
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        {quietMode ? (
          <BellOff className="w-5 h-5 text-gray-500" />
        ) : (
          <Bell className="w-5 h-5 text-purple-600" />
        )}
        <div>
          <Label 
            htmlFor="quiet-mode" 
            className="text-sm font-medium cursor-pointer"
          >
            Quiet Mode
          </Label>
          <p className="text-xs text-gray-500 mt-0.5">
            {quietMode 
              ? 'Proactive messages are paused' 
              : 'Receive companion messages while you learn'
            }
          </p>
        </div>
      </div>

      <Switch
        id="quiet-mode"
        checked={quietMode}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export interface QuietModeToggleCompactProps {
  userId: string;
  onChange?: (enabled: boolean) => void;
  className?: string;
}

/**
 * Compact version for mobile or small spaces
 */
export function QuietModeToggleCompact({
  userId,
  onChange,
  className,
}: QuietModeToggleCompactProps) {
  const [quietMode, setQuietMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`quietMode_${userId}`);
    if (stored !== null) {
      setQuietMode(stored === 'true');
    }
  }, [userId]);

  const handleToggle = (enabled: boolean) => {
    setQuietMode(enabled);
    localStorage.setItem(`quietMode_${userId}`, enabled.toString());
    if (onChange) onChange(enabled);
  };

  return (
    <button
      onClick={() => handleToggle(!quietMode)}
      className={cn(
        'p-2 rounded-lg transition-colors',
        quietMode 
          ? 'bg-gray-100 text-gray-600' 
          : 'bg-purple-50 text-purple-600',
        'hover:bg-gray-200',
        className
      )}
      title={quietMode ? 'Enable companion messages' : 'Pause companion messages'}
    >
      {quietMode ? (
        <BellOff className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
    </button>
  );
}