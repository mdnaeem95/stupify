/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - SUPABASE OPERATIONS
// Created: October 22, 2025
// Version: 1.0
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
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    const { error } = await supabase
      .from('companion_messages')
      .update({ was_read: true })
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

/**
 * Mark all messages as read for a companion
 */
export async function markAllMessagesAsRead(companionId: string): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    const { error } = await supabase
      .from('companion_messages')
      .update({ was_read: true })
      .eq('companion_id', companionId)
      .eq('was_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    throw error;
  }
}

/**
 * Log a companion interaction
 */
export async function logInteraction(
  companionId: string,
  interactionType: CompanionInteraction['interaction_type'],
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