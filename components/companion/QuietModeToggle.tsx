'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface QuietModeToggleProps {
  isQuiet: boolean;
  onToggle: (enabled: boolean) => void;
  companionName?: string;
  className?: string;
}

/**
 * QuietModeToggle - Redesigned v2.0
 * 
 * Following STUPIFY Design Principles:
 * - Clean card design with proper shadows
 * - Better typography hierarchy
 * - Clear icon states with colors
 * - Premium hover effects
 * - Mobile-friendly sizing
 */
export function QuietModeToggle({
  isQuiet,
  onToggle,
  companionName = 'Your companion',
  className,
}: QuietModeToggleProps) {
  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-300',
      className
    )}>
      <div className="flex items-start justify-between gap-6">
        {/* Icon and Text */}
        <div className="flex items-start gap-4 flex-1">
          {/* Icon with gradient background */}
          <div className={cn(
            'flex-shrink-0 p-3 rounded-xl transition-all duration-300',
            isQuiet 
              ? 'bg-gray-100' 
              : 'bg-gradient-to-br from-purple-50 to-indigo-50'
          )}>
            {isQuiet ? (
              <BellOff className="w-6 h-6 text-gray-400" strokeWidth={2} />
            ) : (
              <Bell className="w-6 h-6 text-purple-600" strokeWidth={2} />
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <Label 
              htmlFor="quiet-mode" 
              className="text-lg font-bold text-gray-900 cursor-pointer block mb-2"
            >
              Quiet Mode
            </Label>
            <p className="text-base text-gray-600 leading-relaxed">
              {isQuiet 
                ? `${companionName} won't send proactive messages` 
                : `${companionName} will send encouraging messages`
              }
            </p>
          </div>
        </div>

        {/* Switch */}
        <div className="flex-shrink-0">
          <Switch
            id="quiet-mode"
            checked={isQuiet}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-600 data-[state=checked]:to-violet-600"
          />
        </div>
      </div>
    </Card>
  );
}

/**
 * QuietModeToggleCompact - Compact inline version without card
 */
export function QuietModeToggleCompact({
  isQuiet,
  onToggle,
  companionName = 'Your companion',
  className,
}: QuietModeToggleProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors',
      className
    )}>
      <div className="flex items-center gap-3">
        {isQuiet ? (
          <BellOff className="w-5 h-5 text-gray-500" strokeWidth={2} />
        ) : (
          <Bell className="w-5 h-5 text-purple-600" strokeWidth={2} />
        )}
        <div>
          <Label 
            htmlFor="quiet-mode-compact" 
            className="text-sm font-semibold text-gray-900 cursor-pointer block"
          >
            Quiet Mode
          </Label>
          <p className="text-xs text-gray-600 mt-1">
            {isQuiet 
              ? `${companionName} won't send messages` 
              : `${companionName} sends messages`
            }
          </p>
        </div>
      </div>

      <Switch
        id="quiet-mode-compact"
        checked={isQuiet}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-600 data-[state=checked]:to-violet-600"
      />
    </div>
  );
}