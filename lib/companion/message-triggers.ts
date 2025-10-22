/**
 * MESSAGE TRIGGERS - Phase 2, Day 11
 * 
 * System for detecting when companion should send proactive messages.
 * 
 * Features:
 * - Trigger detection based on user behavior
 * - Session tracking for frequency limits
 * - Cooldown management
 * - Priority-based triggering
 * - Analytics tracking
 * 
 * Trigger Types:
 * - question_asked: After user asks a question
 * - milestone: Level up or achievement
 * - inactivity: User inactive for 2+ hours
 * - streak_reminder: Streak at risk (8 PM local time)
 * - topic_suggestion: Related topic discovered
 * - session_start: User returns to app
 * - learning_pattern: Interesting pattern detected
 */

import { type MessageTrigger, type MessageContext } from './personality-prompts';
import { type Companion } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface TriggerCondition {
  type: MessageTrigger;
  priority: number; // 1-10, higher = more important
  cooldown: number; // Minutes before can trigger again
  maxPerSession: number; // Max times this trigger can fire per session
  enabled: boolean;
}

export interface TriggerEvent {
  trigger: MessageTrigger;
  reason: string;
  context: Partial<MessageContext>;
  priority: number;
  timestamp: Date;
}

export interface SessionState {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  questionsAsked: number;
  messagesReceived: number;
  triggerCounts: Record<MessageTrigger, number>;
  dismissedMessages: number;
}

export interface TriggerCheckResult {
  shouldTrigger: boolean;
  trigger?: MessageTrigger;
  reason?: string;
  context?: Partial<MessageContext>;
  blockedReason?: string;
}

// ============================================================================
// TRIGGER CONFIGURATION
// ============================================================================

export const TRIGGER_CONFIG: Record<MessageTrigger, TriggerCondition> = {
  // User-initiated (always allowed)
  greeting: {
    type: 'greeting',
    priority: 10,
    cooldown: 0,
    maxPerSession: 1,
    enabled: true,
  },
  question_asked: {
    type: 'question_asked',
    priority: 8,
    cooldown: 3, // 3 questions between encouragements
    maxPerSession: 3,
    enabled: true,
  },
  milestone: {
    type: 'milestone',
    priority: 10,
    cooldown: 0,
    maxPerSession: 99, // Unlimited milestones
    enabled: true,
  },
  celebration: {
    type: 'celebration',
    priority: 10,
    cooldown: 0,
    maxPerSession: 99,
    enabled: true,
  },
  
  // Proactive (frequency limited)
  proactive: {
    type: 'proactive',
    priority: 5,
    cooldown: 120, // 2 hours
    maxPerSession: 1,
    enabled: true,
  },
  streak_reminder: {
    type: 'streak_reminder',
    priority: 7,
    cooldown: 1440, // 24 hours
    maxPerSession: 1,
    enabled: true,
  },
  topic_suggestion: {
    type: 'topic_suggestion',
    priority: 6,
    cooldown: 5, // 5 questions
    maxPerSession: 2,
    enabled: true,
  },
  curiosity: {
    type: 'curiosity',
    priority: 5,
    cooldown: 10, // 10 questions
    maxPerSession: 2,
    enabled: true,
  },
  encouragement: {
    type: 'encouragement',
    priority: 6,
    cooldown: 3, // 3 questions
    maxPerSession: 3,
    enabled: true,
  },
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

// In-memory session storage (use Redis in production)
const activeSessions = new Map<string, SessionState>();

/**
 * Get or create session for user
 */
export function getSession(userId: string, sessionId?: string): SessionState {
  const id = sessionId || `session-${userId}-${Date.now()}`;
  
  let session = activeSessions.get(id);
  
  if (!session) {
    session = {
      sessionId: id,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      questionsAsked: 0,
      messagesReceived: 0,
      triggerCounts: {} as Record<MessageTrigger, number>,
      dismissedMessages: 0,
    };
    
    activeSessions.set(id, session);
    
    // Clean up old sessions
    cleanupOldSessions();
  }
  
  return session;
}

/**
 * Update session activity
 */
export function updateSessionActivity(
  sessionId: string,
  updates: Partial<SessionState>
): SessionState | null {
  const session = activeSessions.get(sessionId);
  
  if (!session) return null;
  
  Object.assign(session, updates, {
    lastActivity: new Date(),
  });
  
  activeSessions.set(sessionId, session);
  return session;
}

/**
 * Increment trigger count for session
 */
export function incrementTriggerCount(
  sessionId: string,
  trigger: MessageTrigger
): void {
  const session = activeSessions.get(sessionId);
  
  if (!session) return;
  
  if (!session.triggerCounts[trigger]) {
    session.triggerCounts[trigger] = 0;
  }
  
  session.triggerCounts[trigger]++;
  session.messagesReceived++;
  
  activeSessions.set(sessionId, session);
}

/**
 * Clean up sessions older than 24 hours
 */
function cleanupOldSessions(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastActivity.getTime() > maxAge) {
      activeSessions.delete(id);
    }
  }
}

// ============================================================================
// TRIGGER DETECTION
// ============================================================================

/**
 * Check if a trigger should fire
 */
export function checkTrigger(
  trigger: MessageTrigger,
  sessionId: string,
  companion: Companion,
  context: Partial<MessageContext> = {}
): TriggerCheckResult {
  const config = TRIGGER_CONFIG[trigger];
  
  if (!config.enabled) {
    return {
      shouldTrigger: false,
      blockedReason: 'Trigger disabled',
    };
  }
  
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return {
      shouldTrigger: false,
      blockedReason: 'No active session',
    };
  }
  
  // Check session limits
  const triggerCount = session.triggerCounts[trigger] || 0;
  
  if (triggerCount >= config.maxPerSession) {
    return {
      shouldTrigger: false,
      blockedReason: `Max per session reached (${config.maxPerSession})`,
    };
  }
  
  // Check total message limit (max 3 proactive per session)
  const proactiveTriggers: MessageTrigger[] = [
    'proactive',
    'streak_reminder',
    'topic_suggestion',
    'curiosity',
  ];
  
  if (proactiveTriggers.includes(trigger)) {
    const totalProactive = proactiveTriggers.reduce(
      (sum, t) => sum + (session.triggerCounts[t] || 0),
      0
    );
    
    if (totalProactive >= 3) {
      return {
        shouldTrigger: false,
        blockedReason: 'Max proactive messages per session (3)',
      };
    }
  }
  
  // Check cooldown (based on questions asked for some triggers)
  if (config.cooldown > 0) {
    if (trigger === 'question_asked' || trigger === 'topic_suggestion' || trigger === 'curiosity') {
      // Cooldown in questions
      const questionsSinceLastTrigger = session.questionsAsked - (triggerCount * config.cooldown);
      
      if (questionsSinceLastTrigger < config.cooldown) {
        return {
          shouldTrigger: false,
          blockedReason: `Cooldown (${config.cooldown - questionsSinceLastTrigger} questions remaining)`,
        };
      }
    }
  }
  
  // Check if user dismissed too many messages (quiet mode heuristic)
  const dismissRate = session.messagesReceived > 0 
    ? session.dismissedMessages / session.messagesReceived 
    : 0;
  
  if (dismissRate > 0.7 && proactiveTriggers.includes(trigger)) {
    return {
      shouldTrigger: false,
      blockedReason: 'User dismissing too many messages (quiet mode)',
    };
  }
  
  // All checks passed
  return {
    shouldTrigger: true,
    trigger,
    context,
  };
}

/**
 * Detect automatic triggers based on user behavior
 */
export function detectAutoTriggers(
  sessionId: string,
  companion: Companion,
  userContext: {
    questionsAsked: number;
    currentStreak: number;
    lastActivity?: Date;
    favoriteTopics?: string[];
    recentTopics?: string[];
  }
): TriggerEvent[] {
  const session = activeSessions.get(sessionId);
  if (!session) return [];
  
  const triggers: TriggerEvent[] = [];
  const now = new Date();
  
  // Session start (first question of session)
  if (session.questionsAsked === 1) {
    const result = checkTrigger('greeting', sessionId, companion, {
      userId: session.userId,
      companionName: companion.name,
      level: companion.level,
      totalXP: companion.total_xp,
      totalQuestions: companion.total_interactions,
      currentStreak: userContext.currentStreak,
      trigger: 'greeting',
    });
    
    if (result.shouldTrigger) {
      triggers.push({
        trigger: 'greeting',
        reason: 'Session start',
        context: result.context!,
        priority: TRIGGER_CONFIG.greeting.priority,
        timestamp: now,
      });
    }
  }
  
  // Inactivity check (2+ hours since last activity)
  if (userContext.lastActivity) {
    const hoursSinceActivity = 
      (now.getTime() - userContext.lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActivity >= 2) {
      const result = checkTrigger('proactive', sessionId, companion, {
        userId: session.userId,
        companionName: companion.name,
        level: companion.level,
        totalXP: companion.total_xp,
        totalQuestions: companion.total_interactions,
        currentStreak: userContext.currentStreak,
        trigger: 'proactive',
        lastInteractionAt: userContext.lastActivity,
        reason: `Inactive for ${Math.floor(hoursSinceActivity)} hours`,
      });
      
      if (result.shouldTrigger) {
        triggers.push({
          trigger: 'proactive',
          reason: 'User returned after inactivity',
          context: result.context!,
          priority: TRIGGER_CONFIG.proactive.priority,
          timestamp: now,
        });
      }
    }
  }
  
  // Streak reminder (8 PM local time, streak > 0)
  const hour = now.getHours();
  if (hour === 20 && userContext.currentStreak > 0) {
    const result = checkTrigger('streak_reminder', sessionId, companion, {
      userId: session.userId,
      companionName: companion.name,
      level: companion.level,
      totalXP: companion.total_xp,
      totalQuestions: companion.total_interactions,
      currentStreak: userContext.currentStreak,
      trigger: 'streak_reminder',
    });
    
    if (result.shouldTrigger) {
      triggers.push({
        trigger: 'streak_reminder',
        reason: 'Evening streak reminder',
        context: result.context!,
        priority: TRIGGER_CONFIG.streak_reminder.priority,
        timestamp: now,
      });
    }
  }
  
  // Topic suggestion (every 5 questions with related topics)
  if (session.questionsAsked % 5 === 0 && session.questionsAsked > 0) {
    if (userContext.recentTopics && userContext.recentTopics.length > 0) {
      const result = checkTrigger('topic_suggestion', sessionId, companion, {
        userId: session.userId,
        companionName: companion.name,
        level: companion.level,
        totalXP: companion.total_xp,
        totalQuestions: companion.total_interactions,
        currentStreak: userContext.currentStreak,
        trigger: 'topic_suggestion',
        recentTopics: userContext.recentTopics,
        favoriteTopics: userContext.favoriteTopics,
      });
      
      if (result.shouldTrigger) {
        triggers.push({
          trigger: 'topic_suggestion',
          reason: 'Milestone questions reached',
          context: result.context!,
          priority: TRIGGER_CONFIG.topic_suggestion.priority,
          timestamp: now,
        });
      }
    }
  }
  
  // Sort by priority (highest first)
  return triggers.sort((a, b) => b.priority - a.priority);
}

/**
 * Record message dismissal
 */
export function recordDismissal(sessionId: string): void {
  const session = activeSessions.get(sessionId);
  if (!session) return;
  
  session.dismissedMessages++;
  activeSessions.set(sessionId, session);
  
  console.log(`[TRIGGERS] Message dismissed. Rate: ${session.dismissedMessages}/${session.messagesReceived}`);
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get trigger statistics for analytics
 */
export function getTriggerStats(sessionId: string): {
  totalMessages: number;
  dismissalRate: number;
  triggerBreakdown: Record<MessageTrigger, number>;
  questionsAsked: number;
  sessionDuration: number;
} | null {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  
  const duration = Date.now() - session.startTime.getTime();
  
  return {
    totalMessages: session.messagesReceived,
    dismissalRate: session.messagesReceived > 0 
      ? session.dismissedMessages / session.messagesReceived 
      : 0,
    triggerBreakdown: session.triggerCounts,
    questionsAsked: session.questionsAsked,
    sessionDuration: duration,
  };
}

/**
 * Export session data for analytics
 */
export function exportSessionData(sessionId: string): SessionState | null {
  return activeSessions.get(sessionId) || null;
}