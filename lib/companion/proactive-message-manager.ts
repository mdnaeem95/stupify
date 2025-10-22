/**
 * PROACTIVE MESSAGE MANAGER - Phase 2, Day 12
 * 
 * Orchestrates proactive message generation using:
 * - Trigger system (when to send)
 * - Knowledge graph (what to send about)
 * - GPT generation (how to say it)
 * - Message queue (delivery management)
 * 
 * This is the main coordinator for all proactive companion messages.
 */

import { type Companion } from './types';
import { getSession, updateSessionActivity, checkTrigger, detectAutoTriggers, incrementTriggerCount, type TriggerEvent } from './message-triggers';
import { getMessageQueue, type QueuedMessage } from './message-queue';
import { getLearningPattern, buildEnrichedContext, getTopicEncouragementContext, getTopicSuggestionContext } from './knowledge-graph-integration';
import { generateMessage } from './gpt-message-generator';
import { MessageContext, MessageTrigger } from './personality-prompts';

// ============================================================================
// TYPES
// ============================================================================

export interface ProactiveMessageOptions {
  force?: boolean; // Bypass frequency checks
  priority?: number; // Override priority
  reason?: string; // Custom reason
}

export interface ProactiveMessageResult {
  success: boolean;
  messageId?: string;
  message?: string;
  trigger?: string;
  reason?: string;
  blocked?: string;
}

// ============================================================================
// MAIN COORDINATOR
// ============================================================================

/**
 * Check if companion should send a proactive message
 * This is called on:
 * - User asks a question
 * - User returns to app
 * - Periodic background checks (cron)
 */
export async function checkProactiveMessage(
  userId: string,
  sessionId: string,
  companion: Companion,
  context: {
    questionsAsked?: number;
    currentTopic?: string;
    currentStreak?: number;
    lastActivity?: Date;
  } = {}
): Promise<ProactiveMessageResult> {
  console.log('[PROACTIVE] Checking for proactive message opportunity...');
  
  // Get session
  const session = getSession(userId, sessionId);
  
  // Update session with current context
  if (context.questionsAsked !== undefined) {
    updateSessionActivity(sessionId, {
      questionsAsked: context.questionsAsked,
    });
  }
  
  // Get learning pattern from knowledge graph
  const pattern = await getLearningPattern(userId);
  
  // Detect automatic triggers
  const autoTriggers = detectAutoTriggers(sessionId, companion, {
    questionsAsked: context.questionsAsked || session.questionsAsked,
    currentStreak: context.currentStreak || 0,
    lastActivity: context.lastActivity,
    favoriteTopics: pattern.favoriteTopics,
    recentTopics: pattern.recentTopics,
  });
  
  if (autoTriggers.length === 0) {
    console.log('[PROACTIVE] No triggers detected');
    return {
      success: false,
      blocked: 'No triggers',
    };
  }
  
  // Get highest priority trigger
  const trigger = autoTriggers[0];
  console.log(`[PROACTIVE] Trigger detected: ${trigger.trigger} (priority: ${trigger.priority})`);
  
  // Double-check if we should actually send this
  const check = checkTrigger(trigger.trigger, sessionId, companion, trigger.context);
  
  if (!check.shouldTrigger) {
    console.log(`[PROACTIVE] Trigger blocked: ${check.blockedReason}`);
    return {
      success: false,
      trigger: trigger.trigger,
      blocked: check.blockedReason,
    };
  }
  
  // Generate and queue the message
  try {
    const result = await generateAndQueueMessage(
      trigger,
      userId,
      sessionId,
      companion,
      pattern.favoriteTopics,
      pattern.recentTopics
    );
    
    return result;
  } catch (error) {
    console.error('[PROACTIVE] Error generating message:', error);
    return {
      success: false,
      trigger: trigger.trigger,
      blocked: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manually trigger a specific type of proactive message
 */
export async function sendProactiveMessage(
  userId: string,
  sessionId: string,
  companion: Companion,
  triggerType: 'encouragement' | 'topic_suggestion' | 'curiosity' | 'streak_reminder',
  options: ProactiveMessageOptions = {}
): Promise<ProactiveMessageResult> {
  console.log(`[PROACTIVE] Manual trigger: ${triggerType}`);
  
  // Get session
  const session = getSession(userId, sessionId);
  
  // Check if allowed (unless forced)
  if (!options.force) {
    const check = checkTrigger(triggerType, sessionId, companion);
    
    if (!check.shouldTrigger) {
      console.log(`[PROACTIVE] Trigger blocked: ${check.blockedReason}`);
      return {
        success: false,
        trigger: triggerType,
        blocked: check.blockedReason,
      };
    }
  }
  
  // Get learning pattern
  const pattern = await getLearningPattern(userId);
  
  // Build context based on trigger type
  let context: Partial<MessageContext>;
  
  switch (triggerType) {
    case 'encouragement':
      context = await getTopicEncouragementContext(userId);
      break;
    case 'topic_suggestion':
      context = await getTopicSuggestionContext(userId);
      break;
    case 'curiosity':
      context = {
        favoriteTopics: pattern.favoriteTopics,
        recentTopics: pattern.recentTopics,
        reason: 'Spark curiosity about learning',
      };
      break;
    case 'streak_reminder':
      context = {
        currentStreak: session.questionsAsked > 0 ? 1 : 0,
        reason: 'Remind about daily streak',
      };
      break;
  }
  
  // Create trigger event
  const triggerEvent: TriggerEvent = {
    trigger: triggerType,
    reason: options.reason || context.reason || 'Manual trigger',
    context,
    priority: options.priority || 5,
    timestamp: new Date(),
  };
  
  // Generate and queue
  return await generateAndQueueMessage(
    triggerEvent,
    userId,
    sessionId,
    companion,
    pattern.favoriteTopics,
    pattern.recentTopics
  );
}

/**
 * Get next queued message for user
 */
export async function getNextProactiveMessage(
  userId: string
): Promise<QueuedMessage | null> {
  const queue = getMessageQueue();
  return queue.dequeue(userId);
}

/**
 * Mark message as delivered
 */
export async function markMessageDelivered(messageId: string): Promise<boolean> {
  const queue = getMessageQueue();
  return queue.markDelivered(messageId);
}

/**
 * Mark message as dismissed by user
 */
export async function markMessageDismissed(
  messageId: string,
  sessionId: string
): Promise<boolean> {
  const queue = getMessageQueue();
  const success = queue.markDismissed(messageId);
  
  if (success) {
    // Record dismissal in session for analytics
    const { recordDismissal } = await import('./message-triggers');
    recordDismissal(sessionId);
  }
  
  return success;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Generate message content and add to queue
 */
async function generateAndQueueMessage(
  trigger: TriggerEvent,
  userId: string,
  sessionId: string,
  companion: Companion,
  favoriteTopics: string[],
  recentTopics: string[]
): Promise<ProactiveMessageResult> {
  // Build full context
  const fullContext = await buildEnrichedContext(
    {
      ...trigger.context,
      trigger: trigger.trigger,
      favoriteTopics,
      recentTopics,
    },
    userId
  );
  
  // Parse personality traits
  const traits = typeof companion.personality_traits === 'string'
    ? JSON.parse(companion.personality_traits)
    : companion.personality_traits;
  
  // Generate message using GPT
  console.log('[PROACTIVE] Generating message with GPT...');
  
  const result = await generateMessage({
    archetype: companion.archetype,
    traits,
    context: fullContext,
  });
  
  const messageContent = result.message;
  
  console.log(`[PROACTIVE] Generated: "${messageContent.substring(0, 50)}..."`);
  
  // Add to queue
  const queue = getMessageQueue();
  const messageId = queue.enqueue(trigger, userId, sessionId);
  
  if (!messageId) {
    return {
      success: false,
      trigger: trigger.trigger,
      blocked: 'Failed to queue (duplicate or queue full)',
    };
  }
  
  // Increment trigger count in session
  incrementTriggerCount(sessionId, trigger.trigger);
  
  return {
    success: true,
    messageId,
    message: messageContent,
    trigger: trigger.trigger,
    reason: trigger.reason,
  };
}

// ============================================================================
// BACKGROUND JOBS (for cron)
// ============================================================================

/**
 * Check all active users for proactive message opportunities
 * Called by cron job every hour
 */
export async function checkAllUsersForProactiveMessages(): Promise<{
  checked: number;
  sent: number;
  blocked: number;
}> {
  console.log('[PROACTIVE] Running background check for all users...');
  
  // This would be implemented with a proper user query
  // For now, this is a placeholder for the cron job structure
  
  return {
    checked: 0,
    sent: 0,
    blocked: 0,
  };
}

/**
 * Send streak reminders at 8 PM local time
 * Called by cron job daily
 */
export async function sendStreakReminders(): Promise<{
  sent: number;
  skipped: number;
}> {
  console.log('[PROACTIVE] Sending streak reminders...');
  
  // This would query users with active streaks
  // and send reminders via sendProactiveMessage
  
  return {
    sent: 0,
    skipped: 0,
  };
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get proactive message statistics
 */
export async function getProactiveMessageStats(sessionId: string): Promise<{
  totalProactive: number;
  delivered: number;
  dismissed: number;
  dismissalRate: number;
}> {
  const queue = getMessageQueue();
  const stats = queue.getStats();
  
  const { getTriggerStats } = await import('./message-triggers');
  const triggerStats = getTriggerStats(sessionId);
  
  if (!triggerStats) {
    return {
      totalProactive: 0,
      delivered: 0,
      dismissed: 0,
      dismissalRate: 0,
    };
  }
  
  const proactiveTriggers: MessageTrigger[] = ['proactive', 'streak_reminder', 'topic_suggestion', 'curiosity'];
  const totalProactive = proactiveTriggers.reduce(
    (sum, trigger) => sum + (triggerStats.triggerBreakdown[trigger] ?? 0),
    0
  );
  
  return {
    totalProactive,
    delivered: stats.delivered,
    dismissed: stats.dismissed,
    dismissalRate: triggerStats.dismissalRate,
  };
}