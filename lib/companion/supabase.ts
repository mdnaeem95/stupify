/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - SUPABASE OPERATIONS
// Created: October 22, 2025
// Version: 1.1 - Added Check-In Functions (Phase 3 Day 3)
// Description: Database operations for companion system
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Companion,
  CompanionMessage,
  CompanionInteraction,
  CompanionStats,
  XPRule,
  CompanionMessageType,
  CreateCompanionPayload,
  UpdateCompanionPayload,
} from './types';

/**
 * Get Supabase client (server-side)
 * For client-side operations, use createClient from '@/lib/supabase/client'
 */
async function getSupabaseClient(): Promise<SupabaseClient> {
  return await createClient();
}

/**
 * Get companion for a user
 * Returns null if companion doesn't exist
 */
export async function getCompanion(userId: string): Promise<Companion | null> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no companion found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Companion;
  } catch (error) {
    console.error('Error fetching companion:', error);
    throw error;
  }
}

/**
 * Get companion by ID
 */
export async function getCompanionById(companionId: string): Promise<Companion | null> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companions')
      .select('*')
      .eq('id', companionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Companion;
  } catch (error) {
    console.error('Error fetching companion by ID:', error);
    throw error;
  }
}

/**
 * Create a new companion for a user
 * Note: Companions are auto-created via trigger, but this can be used manually
 */
export async function createCompanion(
  userId: string,
  payload?: CreateCompanionPayload
): Promise<Companion> {
  try {
    const supabase = await getSupabaseClient();

    const companionData = {
      user_id: userId,
      name: payload?.name || 'Buddy',
      archetype: payload?.archetype || 'friend',
    };

    const { data, error } = await supabase
      .from('companions')
      .insert(companionData)
      .select()
      .single();

    if (error) throw error;

    return data as Companion;
  } catch (error) {
    console.error('Error creating companion:', error);
    throw error;
  }
}

/**
 * Update companion
 */
export async function updateCompanion(
  companionId: string,
  updates: UpdateCompanionPayload | Partial<Companion>
): Promise<Companion> {
  try {
    const supabase = await getSupabaseClient();

    // Always update the updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('companions')
      .update(updateData)
      .eq('id', companionId)
      .select()
      .single();

    if (error) throw error;

    return data as Companion;
  } catch (error) {
    console.error('Error updating companion:', error);
    throw error;
  }
}

/**
 * Update companion stats
 * Phase 3: Stats System
 */
export async function updateCompanionStats(
  companionId: string,
  stats: {
    happiness?: number;
    energy?: number;
    knowledge?: number;
  }
): Promise<Companion> {
  try {
    const supabase = await getSupabaseClient();

    const updateData = {
      ...stats,
      last_interaction_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('companions')
      .update(updateData)
      .eq('id', companionId)
      .select()
      .single();

    if (error) throw error;

    return data as Companion;
  } catch (error) {
    console.error('Error updating companion stats:', error);
    throw error;
  }
}

/**
 * Get companion stats (happiness, energy, knowledge)
 * Phase 3: Stats System
 */
export async function getCompanionStatsOnly(companionId: string): Promise<{
  happiness: number;
  energy: number;
  knowledge: number;
} | null> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companions')
      .select('happiness, energy, knowledge')
      .eq('id', companionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as { happiness: number; energy: number; knowledge: number };
  } catch (error) {
    console.error('Error fetching companion stats:', error);
    throw error;
  }
}

// ============================================================================
// PHASE 3 DAY 3: DAILY CHECK-IN FUNCTIONS (UTC + Option A aligned)
// ============================================================================

type Mood = 'great' | 'good' | 'okay' | 'bad';
type RewardTypeIncoming = 'xp' | 'happiness' | 'energy' | 'knowledge' | 'coins';

/* ---------------------------- UTC date utilities --------------------------- */

function utcStartOfDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}
function utcEndOfDay(d = new Date()): Date {
  const start = utcStartOfDay(d);
  return new Date(start.getTime() + 86_400_000); // +1 day
}
/** "YYYY-MM-DD" (UTC) */
function ymdUTC(ts: string): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Create a daily check-in record (user-level, UTC aligned).
 * NOTE: We treat the first arg (companionId) as the *userId* to match the table schema.
 * rewardType mapping:
 *  - 'xp' -> reward_type='xp', reward_amount=N
 *  - 'happiness'|'energy'|'knowledge' -> reward_type='stat_boost', stats_updated={ key: N }
 *  - 'coins' -> not in schema; mapped to xp:0 (adjust if you later add a coins column)
 */
export async function createCheckIn(
  companionId: string, // actually userId
  mood: Mood, // not persisted unless you add a 'mood' column
  rewardType: RewardTypeIncoming,
  rewardAmount: number,
  streakDay: number
): Promise<any> {
  const supabase = await getSupabaseClient();

  let reward_type: 'xp' | 'stat_boost' = 'xp';
  let stats_updated: Record<string, number> | null = null;
  let amount: number | null = null;

  if (rewardType === 'xp') {
    reward_type = 'xp';
    amount = rewardAmount ?? 0;
  } else if (rewardType === 'happiness' || rewardType === 'energy' || rewardType === 'knowledge') {
    reward_type = 'stat_boost';
    stats_updated = { [rewardType]: rewardAmount ?? 0 };
    amount = null;
  } else {
    // 'coins' not supported by current schema—map to neutral xp:0
    reward_type = 'xp';
    amount = 0;
  }

  const payload = {
    user_id: companionId,                      // treat as userId
    checked_in_at: new Date().toISOString(),   // timestamptz
    day_in_cycle: streakDay,
    reward_type,
    reward_amount: amount,
    stats_updated: stats_updated ?? null,
    // mood not persisted; add a column if desired
  };

  const { data, error } = await supabase
    .from('companion_check_ins')
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Unique violation -> already checked in today (per UTC)
    if ((error as any).code === '23505') return null;
    throw error;
  }

  return data;
}

/**
 * Get today's check-in (UTC) for a user.
 * NOTE: first arg (companionId) is treated as userId.
 */
export async function getTodayCheckIn(companionId: string): Promise<any | null> {
  const supabase = await getSupabaseClient();

  const start = utcStartOfDay();
  const end = utcEndOfDay();

  // If your client has .maybeSingle(), you can use it. Here we handle empty results manually.
  const { data, error } = await supabase
    .from('companion_check_ins')
    .select('*')
    .eq('user_id', companionId)
    .gte('checked_in_at', start.toISOString())
    .lt('checked_in_at', end.toISOString())
    .order('checked_in_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  return (data && data.length > 0) ? data[0] : null;
}

/**
 * Get check-in streak for a user (UTC day buckets).
 * NOTE: first arg (companionId) is treated as userId.
 */
export async function getCheckInStreak(companionId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date | null;
}> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from('companion_check_ins')
    .select('checked_in_at')
    .eq('user_id', companionId)
    .order('checked_in_at', { ascending: false });

  if (error) {
    console.error('Error loading check-ins for streak:', error);
    return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  }
  if (!data || data.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCheckIn: null };
  }

  // Collapse multiple same-UTC-day check-ins into a single day
  const distinctDays: string[] = [];
  for (const row of data as Array<{ checked_in_at: string }>) {
    const day = ymdUTC(row.checked_in_at); // "YYYY-MM-DD" UTC
    if (distinctDays[distinctDays.length - 1] !== day) {
      distinctDays.push(day);
    }
  }

  // Current streak: count consecutive days from *today (UTC)* backwards
  const todayKey = ymdUTC(new Date().toISOString());
  const daySet = new Set(distinctDays);

  let currentStreak = 0;
  let cursor = new Date(todayKey + 'T00:00:00.000Z');
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      currentStreak += 1;
      cursor = new Date(cursor.getTime() - 86_400_000); // step back 1 UTC day
    } else {
      break;
    }
  }

  // Longest streak: scan distinctDays (ascending) for 1-day gaps
  const toDate = (ymd: string) => new Date(ymd + 'T00:00:00.000Z').getTime();
  const asc = [...distinctDays].sort();
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = toDate(asc[i - 1]);
    const curr = toDate(asc[i]);
    if ((curr - prev) === 86_400_000) {
      run += 1;
    } else if (curr !== prev) {
      longestStreak = Math.max(longestStreak, run);
      run = 1;
    }
  }
  longestStreak = Math.max(longestStreak, run, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastCheckIn: new Date((data as any[])[0].checked_in_at),
  };
}

/**
 * Get paginated check-in history (most recent first).
 * NOTE: first arg (companionId) is treated as userId.
 */
export async function getCheckInHistory(
  companionId: string,
  limit: number = 30,
  offset: number = 0
): Promise<any[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from('companion_check_ins')
    .select('*')
    .eq('user_id', companionId)
    .order('checked_in_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching check-in history:', error);
    throw error;
  }

  return data ?? [];
}


// ============================================================================
// END CHECK-IN FUNCTIONS
// ============================================================================

/**
 * Get or create companion for a user
 * Convenience method that ensures a companion exists
 */
export async function getOrCreateCompanion(userId: string): Promise<Companion> {
  try {
    // Try to get existing companion
    let companion = await getCompanion(userId);

    // If doesn't exist, create one
    if (!companion) {
      companion = await createCompanion(userId);
    }

    return companion;
  } catch (error) {
    console.error('Error getting or creating companion:', error);
    throw error;
  }
}

/**
 * Create a companion message
 */
export async function createCompanionMessage(
  companionId: string,
  messageType: CompanionMessageType,
  content: string,
  context?: Record<string, any>,
  wasProactive: boolean = false
): Promise<CompanionMessage> {
  try {
    const supabase = await getSupabaseClient();

    const messageData = {
      companion_id: companionId,
      message_type: messageType,
      content,
      context: context || null,
      was_proactive: wasProactive,
      was_read: false,
    };

    const { data, error } = await supabase
      .from('companion_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    return data as CompanionMessage;
  } catch (error) {
    console.error('Error creating companion message:', error);
    throw error;
  }
}

/**
 * Get recent companion messages
 */
export async function getRecentMessages(
  companionId: string,
  limit: number = 10
): Promise<CompanionMessage[]> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companion_messages')
      .select('*')
      .eq('companion_id', companionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data as CompanionMessage[]) || [];
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    throw error;
  }
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(companionId: string): Promise<number> {
  try {
    const supabase = await getSupabaseClient();

    const { count, error } = await supabase
      .from('companion_messages')
      .select('*', { count: 'exact', head: true })
      .eq('companion_id', companionId)
      .eq('was_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  companionId: string,
  messageIds?: string[]
): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    let query = supabase
      .from('companion_messages')
      .update({ was_read: true })
      .eq('companion_id', companionId);

    // If specific message IDs provided, only mark those
    if (messageIds && messageIds.length > 0) {
      query = query.in('id', messageIds);
    }

    const { error } = await query;

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Log a companion interaction
 */
export async function logInteraction(
  companionId: string,
  interactionType: string,
  xpGained: number = 0,
  metadata?: Record<string, any>
): Promise<CompanionInteraction> {
  try {
    const supabase = await getSupabaseClient();

    const interactionData = {
      companion_id: companionId,
      interaction_type: interactionType,
      xp_gained: xpGained,
      metadata: metadata || null,
    };

    const { data, error } = await supabase
      .from('companion_interactions')
      .insert(interactionData)
      .select()
      .single();

    if (error) throw error;

    return data as CompanionInteraction;
  } catch (error) {
    console.error('Error logging interaction:', error);
    throw error;
  }
}

/**
 * Get companion statistics
 */
export async function getCompanionStats(companionId: string): Promise<CompanionStats | null> {
  try {
    const supabase = await getSupabaseClient();

    // Use the companion_stats view
    const { data, error } = await supabase
      .from('companion_stats')
      .select('*')
      .eq('id', companionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as CompanionStats;
  } catch (error) {
    console.error('Error fetching companion stats:', error);
    throw error;
  }
}

/**
 * Get detailed interaction statistics
 */
export async function getInteractionStats(companionId: string): Promise<{
  total_messages: number;
  total_interactions: number;
  questions_asked: number;
  messages_sent: number;
  level_ups: number;
}> {
  try {
    const supabase = await getSupabaseClient();

    // Count messages
    const { count: messageCount } = await supabase
      .from('companion_messages')
      .select('*', { count: 'exact', head: true })
      .eq('companion_id', companionId);

    // Count interactions by type
    const { data: interactions } = await supabase
      .from('companion_interactions')
      .select('interaction_type')
      .eq('companion_id', companionId);

    const questionCount = interactions?.filter(
      (i) => i.interaction_type === 'question_asked'
    ).length || 0;

    const messageSentCount = interactions?.filter(
      (i) => i.interaction_type === 'message_sent'
    ).length || 0;

    const levelUpCount = interactions?.filter(
      (i) => i.interaction_type === 'level_up'
    ).length || 0;

    return {
      total_messages: messageCount || 0,
      total_interactions: interactions?.length || 0,
      questions_asked: questionCount,
      messages_sent: messageSentCount,
      level_ups: levelUpCount,
    };
  } catch (error) {
    console.error('Error fetching interaction stats:', error);
    throw error;
  }
}

/**
 * Get XP rules (cached)
 */
let xpRulesCache: XPRule[] | null = null;
let xpRulesCacheTime: number = 0;
const XP_RULES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getXPRules(forceRefresh: boolean = false): Promise<XPRule[]> {
  try {
    // Return cached rules if still valid
    const now = Date.now();
    if (!forceRefresh && xpRulesCache && now - xpRulesCacheTime < XP_RULES_CACHE_TTL) {
      return xpRulesCache;
    }

    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('xp_rules')
      .select('*')
      .eq('enabled', true)
      .order('action');

    if (error) throw error;

    xpRulesCache = (data as XPRule[]) || [];
    xpRulesCacheTime = now;

    return xpRulesCache;
  } catch (error) {
    console.error('Error fetching XP rules:', error);
    throw error;
  }
}

/**
 * Get XP reward for a specific action
 */
export async function getXPForAction(action: string): Promise<number> {
  try {
    const rules = await getXPRules();
    const rule = rules.find((r) => r.action === action);

    if (!rule) {
      console.warn(`No XP rule found for action: ${action}`);
      return 10; // Default fallback
    }

    return rule.xp_reward;
  } catch (error) {
    console.error('Error getting XP for action:', error);
    return 10; // Default fallback
  }
}

/**
 * Get all companions (admin only - for leaderboards in future)
 */
export async function getAllCompanions(
  limit: number = 100,
  offset: number = 0
): Promise<Companion[]> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companions')
      .select('*')
      .order('level', { ascending: false })
      .order('total_xp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data as Companion[]) || [];
  } catch (error) {
    console.error('Error fetching all companions:', error);
    throw error;
  }
}

/**
 * Delete a companion (admin only or user deletion)
 */
export async function deleteCompanion(companionId: string): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    // Delete will cascade to messages and interactions
    const { error } = await supabase
      .from('companions')
      .delete()
      .eq('id', companionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting companion:', error);
    throw error;
  }
}

/**
 * Get companion message history with pagination
 */
export async function getMessageHistory(
  companionId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CompanionMessage[]> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companion_messages')
      .select('*')
      .eq('companion_id', companionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data as CompanionMessage[]) || [];
  } catch (error) {
    console.error('Error fetching message history:', error);
    throw error;
  }
}

/**
 * Get interaction history with pagination
 */
export async function getInteractionHistory(
  companionId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CompanionInteraction[]> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('companion_interactions')
      .select('*')
      .eq('companion_id', companionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data as CompanionInteraction[]) || [];
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    throw error;
  }
}

/**
 * Update XP rule (admin only)
 */
export async function updateXPRule(
  action: string,
  xpReward: number,
  enabled: boolean = true
): Promise<XPRule> {
  try {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
      .from('xp_rules')
      .update({ xp_reward: xpReward, enabled, updated_at: new Date().toISOString() })
      .eq('action', action)
      .select()
      .single();

    if (error) throw error;

    // Clear cache
    xpRulesCache = null;

    return data as XPRule;
  } catch (error) {
    console.error('Error updating XP rule:', error);
    throw error;
  }
}

/**
 * Batch update companion (for fixing data inconsistencies)
 */
export async function batchUpdateCompanions(
  updates: Array<{ id: string; updates: Partial<Companion> }>
): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map((item) =>
          supabase
            .from('companions')
            .update(item.updates)
            .eq('id', item.id)
        )
      );
    }
  } catch (error) {
    console.error('Error batch updating companions:', error);
    throw error;
  }
}