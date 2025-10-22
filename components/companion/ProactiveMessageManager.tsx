/**
 * PROACTIVE MESSAGE MANAGER COMPONENT - Phase 2, Day 13
 * 
 * Manages the display queue of proactive companion messages.
 * Fetches messages from API, displays them one at a time, and handles user interactions.
 * 
 * Features:
 * - Auto-fetch next message from queue
 * - Display one message at a time
 * - Handle dismissals and mark as read
 * - Track analytics (views, dismissals)
 * - Configurable display style
 * - Quiet mode support
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProactiveMessageBubble, CompactProactiveMessage, ProactiveMessageToast } from './ProactiveMessageBubble';
import { type Companion } from '@/lib/companion/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ProactiveMessage {
  id: string;
  content: string;
  trigger: string;
  priority: number;
  createdAt: Date;
}

export interface ProactiveMessageManagerProps {
  companion: Companion;
  sessionId: string;
  
  // Display options
  displayStyle?: 'bubble' | 'compact' | 'toast';
  autoFetch?: boolean;
  fetchInterval?: number; // milliseconds
  maxMessagesPerSession?: number;
  
  // Callbacks
  onMessageView?: (messageId: string) => void;
  onMessageDismiss?: (messageId: string) => void;
  onMessageReply?: (messageId: string) => void;
  onMessageClick?: (messageId: string) => void;
  
  // Quiet mode
  quietMode?: boolean;
  
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProactiveMessageManager({
  companion,
  sessionId,
  displayStyle = 'bubble',
  autoFetch = true,
  fetchInterval = 30000, // 30 seconds
  maxMessagesPerSession = 3,
  onMessageView,
  onMessageDismiss,
  onMessageReply,
  onMessageClick,
  quietMode = false,
  className,
}: ProactiveMessageManagerProps) {
  const [currentMessage, setCurrentMessage] = useState<ProactiveMessage | null>(null);
  const [messagesShown, setMessagesShown] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  
  // Fetch next message from queue
  const fetchNextMessage = useCallback(async () => {
    // Don't fetch if:
    // - Already showing a message
    // - Quiet mode enabled
    // - Max messages reached
    // - Currently fetching
    if (
      currentMessage ||
      quietMode ||
      messagesShown >= maxMessagesPerSession ||
      isFetching
    ) {
      return;
    }
    
    setIsFetching(true);
    
    try {
      const response = await fetch('/api/companion/proactive', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('[PROACTIVE] Failed to fetch message:', response.status);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.message) {
        const message: ProactiveMessage = {
          id: data.messageId,
          content: data.message.content,
          trigger: data.message.trigger,
          priority: data.message.priority || 5,
          createdAt: new Date(data.message.createdAt),
        };
        
        setCurrentMessage(message);
        setMessagesShown(prev => prev + 1);
        
        // Track view
        if (onMessageView) {
          onMessageView(message.id);
        }
        
        // Mark as delivered
        await markAsDelivered(message.id);
        
        console.log('[PROACTIVE] Displaying message:', message.id);
      }
    } catch (error) {
      console.error('[PROACTIVE] Error fetching message:', error);
    } finally {
      setIsFetching(false);
    }
  }, [
    currentMessage,
    quietMode,
    messagesShown,
    maxMessagesPerSession,
    isFetching,
    onMessageView,
  ]);
  
  // Auto-fetch on mount and interval
  useEffect(() => {
    if (!autoFetch) return;
    
    // Initial fetch after 5 seconds
    const initialTimer = setTimeout(() => {
      fetchNextMessage();
    }, 5000);
    
    // Then fetch on interval
    const intervalTimer = setInterval(() => {
      fetchNextMessage();
    }, fetchInterval);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [autoFetch, fetchInterval, fetchNextMessage]);
  
  // Handle dismiss
  const handleDismiss = async (messageId: string) => {
    setCurrentMessage(null);
    
    // Mark as dismissed
    await markAsDismissed(messageId, sessionId);
    
    // Callback
    if (onMessageDismiss) {
      onMessageDismiss(messageId);
    }
    
    console.log('[PROACTIVE] Message dismissed:', messageId);
  };
  
  // Handle reply
  const handleReply = (messageId: string) => {
    setCurrentMessage(null);
    
    if (onMessageReply) {
      onMessageReply(messageId);
    }
    
    console.log('[PROACTIVE] User replied to:', messageId);
  };
  
  // Handle click (expand)
  const handleClick = (messageId: string) => {
    if (onMessageClick) {
      onMessageClick(messageId);
    }
    
    console.log('[PROACTIVE] Message clicked:', messageId);
  };
  
  // Don't render if no message or quiet mode
  if (!currentMessage || quietMode) {
    return null;
  }
  
  // Render based on display style
  switch (displayStyle) {
    case 'compact':
      return (
        <CompactProactiveMessage
          message={currentMessage.content}
          archetype={companion.archetype}
          companionName={companion.name}
          messageId={currentMessage.id}
          onDismiss={handleDismiss}
          onClick={handleClick}
          className={className}
        />
      );
    
    case 'toast':
      return (
        <ProactiveMessageToast
          message={currentMessage.content}
          archetype={companion.archetype}
          companionName={companion.name}
          messageId={currentMessage.id}
          onDismiss={handleDismiss}
          className={className}
        />
      );
    
    case 'bubble':
    default:
      return (
        <ProactiveMessageBubble
          message={currentMessage.content}
          archetype={companion.archetype}
          companionName={companion.name}
          companionLevel={companion.level}
          messageId={currentMessage.id}
          trigger={currentMessage.trigger}
          onDismiss={handleDismiss}
          onReply={handleReply}
          onClick={handleClick}
          className={className}
        />
      );
  }
}

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Mark message as delivered
 */
async function markAsDelivered(messageId: string): Promise<void> {
  try {
    await fetch('/api/companion/proactive/mark-delivered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId }),
    });
  } catch (error) {
    console.error('[PROACTIVE] Error marking as delivered:', error);
  }
}

/**
 * Mark message as dismissed
 */
async function markAsDismissed(
  messageId: string,
  sessionId: string
): Promise<void> {
  try {
    await fetch('/api/companion/proactive/mark-dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId, sessionId }),
    });
  } catch (error) {
    console.error('[PROACTIVE] Error marking as dismissed:', error);
  }
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing proactive messages
 */
export function useProactiveMessages(
  companionId: string,
) {
  const [quietMode, setQuietMode] = useState(false);
  const [messagesViewed, setMessagesViewed] = useState(0);
  const [messagesDismissed, setMessagesDismissed] = useState(0);
  
  const handleMessageView = useCallback((messageId: string) => {
    setMessagesViewed(prev => prev + 1);
    
    // Track analytics
    trackMessageEvent('view', messageId, companionId);
  }, [companionId]);
  
  const handleMessageDismiss = useCallback((messageId: string) => {
    setMessagesDismissed(prev => prev + 1);
    
    // Track analytics
    trackMessageEvent('dismiss', messageId, companionId);
    
    // Auto-enable quiet mode if dismissal rate is high
    if (messagesViewed > 3 && messagesDismissed / messagesViewed > 0.6) {
      console.log('[PROACTIVE] High dismissal rate, enabling quiet mode');
      setQuietMode(true);
    }
  }, [companionId, messagesViewed, messagesDismissed]);
  
  const handleMessageReply = useCallback((messageId: string) => {
    // Track analytics
    trackMessageEvent('reply', messageId, companionId);
  }, [companionId]);
  
  const handleMessageClick = useCallback((messageId: string) => {
    // Track analytics
    trackMessageEvent('click', messageId, companionId);
  }, [companionId]);
  
  return {
    quietMode,
    setQuietMode,
    messagesViewed,
    messagesDismissed,
    handleMessageView,
    handleMessageDismiss,
    handleMessageReply,
    handleMessageClick,
  };
}

/**
 * Track message analytics event
 */
async function trackMessageEvent(
  event: 'view' | 'dismiss' | 'reply' | 'click',
  messageId: string,
  companionId: string
): Promise<void> {
  try {
    await fetch('/api/companion/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        messageId,
        companionId,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('[PROACTIVE] Error tracking event:', error);
  }
}