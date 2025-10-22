/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - USE COMPANION MESSAGES HOOK
// Created: October 22, 2025
// Version: 1.0
// Description: Hook for managing companion messages
// ============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CompanionMessage, CompanionMessageType } from '@/lib/companion/types';

interface UseCompanionMessagesReturn {
  messages: CompanionMessage[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  generateMessage: (messageType: CompanionMessageType, context?: Record<string, any>) => Promise<CompanionMessage | null>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * useCompanionMessages - Manage companion messages
 * 
 * Features:
 * - Fetch messages
 * - Generate new messages
 * - Mark as read
 * - Unread count
 * - Auto-fetch on mount
 * 
 * @param limit - Number of messages to fetch (default: 10)
 * @returns Messages state and methods
 */
export function useCompanionMessages(limit: number = 10): UseCompanionMessagesReturn {
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch messages from API
   */
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/companion/interact?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.messages || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  /**
   * Generate a new companion message
   */
  const generateMessage = useCallback(async (
    messageType: CompanionMessageType,
    context?: Record<string, any>
  ): Promise<CompanionMessage | null> => {
    try {
      setError(null);

      const response = await fetch('/api/companion/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message_type: messageType,
          context,
          was_proactive: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate message: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate message');
      }

      // If message was generated, add to local state
      if (data.message) {
        setMessages((prev) => [data.message, ...prev]);
        setUnreadCount((prev) => prev + 1);
        return data.message;
      }

      return null;
    } catch (err) {
      console.error('Error generating message:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate message');
      return null;
    }
  }, []);

  /**
   * Mark a message as read
   */
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/companion/interact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message_ids: [messageId],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark message as read: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to mark message as read');
      }

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, was_read: true } : msg
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
    }
  }, []);

  /**
   * Mark all messages as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/companion/interact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mark_all: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all messages as read: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to mark all messages as read');
      }

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => ({ ...msg, was_read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all messages as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all messages as read');
    }
  }, []);

  /**
   * Refetch messages
   */
  const refetch = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    unreadCount,
    isLoading,
    error,
    generateMessage,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}