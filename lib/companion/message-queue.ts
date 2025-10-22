/**
 * MESSAGE QUEUE - Phase 2, Day 11
 * 
 * Queue system for managing companion messages.
 * 
 * Features:
 * - Message prioritization
 * - Scheduling and delivery
 * - Duplicate prevention
 * - Rate limiting
 * - Delivery tracking
 * - Message expiration
 */

import { type MessageTrigger, type MessageContext } from './personality-prompts';
import { type TriggerEvent } from './message-triggers';

// ============================================================================
// TYPES
// ============================================================================

export interface QueuedMessage {
  id: string;
  userId: string;
  sessionId: string;
  trigger: MessageTrigger;
  priority: number;
  context: Partial<MessageContext>;
  reason: string;
  
  // Scheduling
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  
  // Delivery
  delivered: boolean;
  deliveredAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  
  // Metadata
  retryCount: number;
  error?: string;
}

export interface QueueOptions {
  maxSize?: number;
  maxRetries?: number;
  defaultTTL?: number; // Time to live in minutes
}

export interface DeliveryResult {
  success: boolean;
  messageId: string;
  error?: string;
}

// ============================================================================
// MESSAGE QUEUE CLASS
// ============================================================================

export class MessageQueue {
  private queue: Map<string, QueuedMessage>;
  private maxSize: number;
  private maxRetries: number;
  private defaultTTL: number;
  
  constructor(options: QueueOptions = {}) {
    this.queue = new Map();
    this.maxSize = options.maxSize || 100;
    this.maxRetries = options.maxRetries || 3;
    this.defaultTTL = options.defaultTTL || 60; // 60 minutes default
  }
  
  /**
   * Add message to queue
   */
  enqueue(event: TriggerEvent, userId: string, sessionId: string): string | null {
    // Check queue size
    if (this.queue.size >= this.maxSize) {
      console.warn('[QUEUE] Queue full, removing oldest message');
      this.removeOldest();
    }
    
    // Generate message ID
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for duplicates (same trigger within 5 minutes)
    const duplicate = this.findDuplicate(userId, event.trigger, 5);
    if (duplicate) {
      console.log(`[QUEUE] Duplicate message detected, skipping: ${event.trigger}`);
      return null;
    }
    
    // Create queued message
    const message: QueuedMessage = {
      id: messageId,
      userId,
      sessionId,
      trigger: event.trigger,
      priority: event.priority,
      context: event.context,
      reason: event.reason,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.defaultTTL * 60 * 1000),
      delivered: false,
      dismissed: false,
      retryCount: 0,
    };
    
    this.queue.set(messageId, message);
    
    console.log(`[QUEUE] Enqueued: ${event.trigger} (priority: ${event.priority})`);
    
    // Clean up expired messages
    this.cleanupExpired();
    
    return messageId;
  }
  
  /**
   * Get next message to deliver (highest priority)
   */
  dequeue(userId: string): QueuedMessage | null {
    // Get all undelivered messages for user
    const userMessages = Array.from(this.queue.values()).filter(
      msg => msg.userId === userId && !msg.delivered && !this.isExpired(msg)
    );
    
    if (userMessages.length === 0) {
      return null;
    }
    
    // Sort by priority (highest first), then by created time (oldest first)
    userMessages.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    
    return userMessages[0];
  }
  
  /**
   * Mark message as delivered
   */
  markDelivered(messageId: string): boolean {
    const message = this.queue.get(messageId);
    
    if (!message) {
      console.warn(`[QUEUE] Message not found: ${messageId}`);
      return false;
    }
    
    message.delivered = true;
    message.deliveredAt = new Date();
    
    this.queue.set(messageId, message);
    
    console.log(`[QUEUE] Delivered: ${message.trigger}`);
    
    return true;
  }
  
  /**
   * Mark message as dismissed by user
   */
  markDismissed(messageId: string): boolean {
    const message = this.queue.get(messageId);
    
    if (!message) {
      return false;
    }
    
    message.dismissed = true;
    message.dismissedAt = new Date();
    
    this.queue.set(messageId, message);
    
    console.log(`[QUEUE] Dismissed: ${message.trigger}`);
    
    return true;
  }
  
  /**
   * Mark message as failed and retry if possible
   */
  markFailed(messageId: string, error: string): boolean {
    const message = this.queue.get(messageId);
    
    if (!message) {
      return false;
    }
    
    message.retryCount++;
    message.error = error;
    
    if (message.retryCount >= this.maxRetries) {
      // Max retries reached, remove from queue
      this.queue.delete(messageId);
      console.error(`[QUEUE] Message failed after ${this.maxRetries} retries: ${messageId}`);
      return false;
    }
    
    // Reset delivered flag for retry
    message.delivered = false;
    this.queue.set(messageId, message);
    
    console.log(`[QUEUE] Retry ${message.retryCount}/${this.maxRetries}: ${messageId}`);
    
    return true;
  }
  
  /**
   * Get all messages for user
   */
  getUserMessages(userId: string, includeDelivered: boolean = false): QueuedMessage[] {
    return Array.from(this.queue.values()).filter(msg => {
      if (msg.userId !== userId) return false;
      if (!includeDelivered && msg.delivered) return false;
      if (this.isExpired(msg)) return false;
      return true;
    });
  }
  
  /**
   * Get message by ID
   */
  getMessage(messageId: string): QueuedMessage | null {
    return this.queue.get(messageId) || null;
  }
  
  /**
   * Clear all messages for user
   */
  clearUserMessages(userId: string): number {
    let count = 0;
    
    for (const [id, msg] of this.queue.entries()) {
      if (msg.userId === userId) {
        this.queue.delete(id);
        count++;
      }
    }
    
    console.log(`[QUEUE] Cleared ${count} messages for user: ${userId}`);
    
    return count;
  }
  
  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    delivered: number;
    dismissed: number;
    expired: number;
  } {
    const all = Array.from(this.queue.values());
    
    return {
      total: all.length,
      pending: all.filter(m => !m.delivered && !this.isExpired(m)).length,
      delivered: all.filter(m => m.delivered).length,
      dismissed: all.filter(m => m.dismissed).length,
      expired: all.filter(m => this.isExpired(m)).length,
    };
  }
  
  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================
  
  /**
   * Check if message is expired
   */
  private isExpired(message: QueuedMessage): boolean {
    if (!message.expiresAt) return false;
    return Date.now() > message.expiresAt.getTime();
  }
  
  /**
   * Find duplicate message
   */
  private findDuplicate(
    userId: string,
    trigger: MessageTrigger,
    withinMinutes: number
  ): QueuedMessage | null {
    const cutoff = Date.now() - withinMinutes * 60 * 1000;
    
    for (const message of this.queue.values()) {
      if (
        message.userId === userId &&
        message.trigger === trigger &&
        message.createdAt.getTime() > cutoff &&
        !message.delivered
      ) {
        return message;
      }
    }
    
    return null;
  }
  
  /**
   * Remove oldest message to make room
   */
  private removeOldest(): void {
    let oldest: QueuedMessage | null = null;
    let oldestId: string | null = null;
    
    for (const [id, msg] of this.queue.entries()) {
      if (msg.delivered || msg.dismissed) {
        // Prioritize removing delivered/dismissed
        this.queue.delete(id);
        return;
      }
      
      if (!oldest || msg.createdAt < oldest.createdAt) {
        oldest = msg;
        oldestId = id;
      }
    }
    
    if (oldestId) {
      this.queue.delete(oldestId);
    }
  }
  
  /**
   * Clean up expired messages
   */
  private cleanupExpired(): void {
    let count = 0;
    
    for (const [id, msg] of this.queue.entries()) {
      if (this.isExpired(msg)) {
        this.queue.delete(id);
        count++;
      }
    }
    
    if (count > 0) {
      console.log(`[QUEUE] Cleaned up ${count} expired messages`);
    }
  }
}

// ============================================================================
// GLOBAL QUEUE INSTANCE
// ============================================================================

// Singleton queue instance (use Redis in production for multi-instance)
let globalQueue: MessageQueue | null = null;

/**
 * Get global message queue
 */
export function getMessageQueue(): MessageQueue {
  if (!globalQueue) {
    globalQueue = new MessageQueue({
      maxSize: 1000,
      maxRetries: 3,
      defaultTTL: 60,
    });
  }
  
  return globalQueue;
}

/**
 * Reset global queue (for testing)
 */
export function resetMessageQueue(): void {
  globalQueue = null;
}