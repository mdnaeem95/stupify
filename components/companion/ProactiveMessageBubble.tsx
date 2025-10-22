/**
 * PROACTIVE MESSAGE BUBBLE - Phase 2, Day 13
 * 
 * Notification-style bubble for displaying proactive companion messages.
 * Appears in bottom-right corner (above chat input on mobile).
 * 
 * Features:
 * - Slide-in animation from right
 * - Dismiss button
 * - Reply option
 * - Auto-hide after 10 seconds (optional)
 * - Click to expand full message
 * - Archetype-specific styling
 * - Mobile-responsive
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ProactiveMessageBubbleProps {
  message: string;
  archetype: CompanionArchetype;
  companionName: string;
  companionLevel: number;
  messageId: string;
  trigger?: string;
  
  // Callbacks
  onDismiss?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onClick?: (messageId: string) => void;
  
  // Options
  autoHide?: boolean;
  autoHideDelay?: number; // milliseconds
  showReplyButton?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  
  className?: string;
}

// ============================================================================
// ARCHETYPE STYLES
// ============================================================================

const ARCHETYPE_STYLES: Record<CompanionArchetype, {
  gradient: string;
  icon: string;
  textColor: string;
  buttonColor: string;
}> = {
  mentor: {
    gradient: 'from-purple-500 to-indigo-600',
    icon: '🦉',
    textColor: 'text-purple-900',
    buttonColor: 'hover:bg-purple-100',
  },
  friend: {
    gradient: 'from-orange-400 to-yellow-500',
    icon: '🌟',
    textColor: 'text-orange-900',
    buttonColor: 'hover:bg-orange-100',
  },
  explorer: {
    gradient: 'from-teal-500 to-emerald-600',
    icon: '🧭',
    textColor: 'text-teal-900',
    buttonColor: 'hover:bg-teal-100',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ProactiveMessageBubble({
  message,
  archetype,
  companionName,
  companionLevel,
  messageId,
  trigger,
  onDismiss,
  onReply,
  onClick,
  autoHide = true,
  autoHideDelay = 10000,
  showReplyButton = true,
  position = 'bottom-right',
  className,
}: ProactiveMessageBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  const styles = ARCHETYPE_STYLES[archetype];
  
  // Slide in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-hide timer
  useEffect(() => {
    if (!autoHide) return;
    
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDelay);
    
    return () => clearTimeout(timer);
  }, [autoHide, autoHideDelay]);
  
  // Handle dismiss with animation
  const handleDismiss = () => {
    setIsDismissing(true);
    
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss(messageId);
      }
    }, 300);
  };
  
  // Handle reply
  const handleReply = () => {
    if (onReply) {
      onReply(messageId);
    }
  };
  
  // Handle click (expand)
  const handleClick = () => {
    if (onClick) {
      onClick(messageId);
    }
  };
  
  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4 md:bottom-8 md:right-8',
    'bottom-left': 'bottom-20 left-4 md:bottom-8 md:left-8',
    'top-right': 'top-4 right-4 md:top-8 md:right-8',
  };
  
  return (
    <Card
      className={cn(
        'fixed z-[9998] w-[calc(100vw-2rem)] md:w-96',
        'shadow-2xl border-2',
        'transition-all duration-300 ease-out',
        positionClasses[position],
        
        // Animation states
        isVisible && !isDismissing && 'translate-x-0 opacity-100',
        !isVisible && 'translate-x-full opacity-0',
        isDismissing && 'translate-x-full opacity-0',
        
        className
      )}
    >
      {/* Header with gradient */}
      <div className={cn(
        'flex items-center gap-3 p-4 bg-gradient-to-r rounded-t-lg',
        styles.gradient
      )}>
        {/* Icon */}
        <div className="text-3xl">
          {styles.icon}
        </div>
        
        {/* Companion info */}
        <div className="flex-1 text-white">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{companionName}</h3>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Lv. {companionLevel}
            </span>
          </div>
          {trigger && (
            <p className="text-xs text-white/80 capitalize">
              {trigger.replace(/_/g, ' ')}
            </p>
          )}
        </div>
        
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className={cn(
            'p-1 rounded-full transition-colors',
            'hover:bg-white/20 active:bg-white/30'
          )}
          aria-label="Dismiss message"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Message content */}
      <div
        onClick={handleClick}
        className={cn(
          'p-4 cursor-pointer transition-colors',
          onClick && 'hover:bg-gray-50'
        )}
      >
        <p className={cn(
          'text-sm leading-relaxed',
          styles.textColor
        )}>
          {message}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        {showReplyButton && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleReply}
            className={cn(
              'gap-2 flex-1',
              styles.buttonColor
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Reply
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-gray-600"
        >
          Got it
        </Button>
      </div>
      
      {/* Sparkle effect (optional) */}
      {trigger === 'celebration' && (
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// COMPACT VARIANT (for mobile)
// ============================================================================

export interface CompactProactiveMessageProps {
  message: string;
  archetype: CompanionArchetype;
  companionName: string;
  messageId: string;
  onDismiss?: (messageId: string) => void;
  onClick?: (messageId: string) => void;
  className?: string;
}

/**
 * Compact notification for mobile (minimal UI)
 */
export function CompactProactiveMessage({
  message,
  archetype,
  companionName,
  messageId,
  onDismiss,
  onClick,
  className,
}: CompactProactiveMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = ARCHETYPE_STYLES[archetype];
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss(messageId);
    }, 300);
  };
  
  return (
    <div
      onClick={() => onClick && onClick(messageId)}
      className={cn(
        'fixed bottom-20 left-4 right-4 z-[9998]',
        'flex items-start gap-3 p-3',
        'bg-white rounded-lg shadow-xl border-2',
        'transition-all duration-300 ease-out',
        'cursor-pointer active:scale-[0.98]',
        
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        
        className
      )}
    >
      {/* Icon */}
      <div className="text-2xl flex-shrink-0">
        {styles.icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 mb-1">
          {companionName}
        </p>
        <p className="text-sm text-gray-900 line-clamp-2">
          {message}
        </p>
      </div>
      
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}

// ============================================================================
// TOAST VARIANT (minimal notification)
// ============================================================================

export interface ProactiveMessageToastProps {
  message: string;
  archetype: CompanionArchetype;
  companionName: string;
  messageId: string;
  onDismiss?: (messageId: string) => void;
  autoHideDelay?: number;
  className?: string;
}

/**
 * Toast-style notification (appears, shows briefly, fades)
 */
export function ProactiveMessageToast({
  message,
  archetype,
  companionName,
  messageId,
  onDismiss,
  autoHideDelay = 5000,
  className,
}: ProactiveMessageToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = ARCHETYPE_STYLES[archetype];
  
  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onDismiss) onDismiss(messageId);
      }, 300);
    }, autoHideDelay);
    
    return () => clearTimeout(timer);
  }, [autoHideDelay, messageId, onDismiss]);
  
  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[9999]',
        'flex items-center gap-2 px-4 py-3',
        'bg-white rounded-lg shadow-lg border',
        'max-w-sm',
        'transition-all duration-300',
        
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        
        className
      )}
    >
      <span className="text-xl">{styles.icon}</span>
      <p className="text-sm text-gray-900 flex-1">
        <span className="font-semibold">{companionName}:</span> {message}
      </p>
    </div>
  );
}