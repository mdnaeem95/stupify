/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - TYPE DEFINITIONS
// Created: October 22, 2025
// Version: 1.1 (Phase 3 - Stats added)
// Description: TypeScript types for companion feature
// ============================================================================

/**
 * Companion archetype determines personality and message style
 */
export type CompanionArchetype = 'mentor' | 'friend' | 'explorer';

/**
 * Companion avatar stage (visual evolution)
 */
export type CompanionAvatar = 'baby' | 'teen' | 'adult';

/**
 * Types of messages the companion can send
 */
export type CompanionMessageType =
  | 'greeting'         // Hello messages
  | 'encouragement'    // After questions
  | 'milestone'        // Level ups, achievements
  | 'reminder'         // Streak reminders
  | 'celebration'      // After achievements
  | 'curiosity'        // Asking about user's interests
  | 'suggestion';      // Topic suggestions

/**
 * Types of interactions with companion
 */
export type CompanionInteractionType =
  | 'question_asked'   // User asked a question
  | 'message_sent'     // Companion sent message
  | 'clicked'          // User clicked companion bubble
  | 'customized'       // User changed companion name/archetype
  | 'level_up';        // Companion leveled up

/**
 * Personality traits (0-10 scale)
 */
export interface PersonalityTraits {
  enthusiasm: number;     // 0-10: How excited companion gets
  curiosity: number;      // 0-10: How much it asks questions
  supportiveness: number; // 0-10: How encouraging it is
  humor: number;          // 0-10: How much it uses humor
}

/**
 * Main companion entity
 */
export interface Companion {
  id: string;
  user_id: string;
  
  // Basic info
  name: string;
  archetype: CompanionArchetype;
  
  // Leveling
  level: number;
  xp: number;
  total_xp: number;
  
  // Stats (Phase 3)
  happiness: number; // 0-100
  energy: number; // 0-100
  knowledge: number; // 0-100
  
  // Personality
  personality_traits: PersonalityTraits;
  
  // Interaction tracking
  last_interaction_at: string; // ISO timestamp
  total_interactions: number;
  favorite_topics: string[];
  
  // Visual state
  current_avatar: CompanionAvatar;
  
  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  quiet_mode?: boolean;
}

/**
 * Companion message
 */
export interface CompanionMessage {
  id: string;
  companion_id: string;
  
  // Message details
  message_type: CompanionMessageType;
  content: string;
  
  // Context
  context?: Record<string, any>;
  was_proactive: boolean;
  
  // User interaction
  user_response?: string | null;
  was_read: boolean;
  
  // Metadata
  created_at: string; // ISO timestamp
}

/**
 * Companion interaction log entry
 */
export interface CompanionInteraction {
  id: string;
  companion_id: string;
  
  // Interaction details
  interaction_type: CompanionInteractionType;
  xp_gained: number;
  
  // Additional context
  metadata?: Record<string, any>;
  
  // Metadata
  created_at: string; // ISO timestamp
}

/**
 * XP rule definition
 */
export interface XPRule {
  id: string;
  action: string;
  xp_reward: number;
  description?: string;
  enabled: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Companion stats summary (from view)
 */
export interface CompanionStats {
  id: string;
  user_id: string;
  name: string;
  level: number;
  xp: number;
  total_xp: number;
  total_interactions: number;
  archetype: CompanionArchetype;
  total_messages: number;
  questions_asked: number;
  last_interaction_at: string;
  created_at: string;
}

/**
 * Level progression info
 */
export interface LevelProgress {
  current_level: number;
  current_xp: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  xp_to_next_level: number;
  progress_percentage: number;
}

/**
 * Create companion payload
 */
export interface CreateCompanionPayload {
  name?: string;
  archetype?: CompanionArchetype;
}

/**
 * Update companion payload
 */
export interface UpdateCompanionPayload {
  name?: string;
  archetype?: CompanionArchetype;
  personality_traits?: Partial<PersonalityTraits>;
}

/**
 * Award XP payload
 */
export interface AwardXPPayload {
  action: string;
  amount?: number; // Optional override
  metadata?: Record<string, any>;
}

/**
 * Award XP response
 */
export interface AwardXPResponse {
  success: boolean;
  xp_gained: number;
  new_xp: number;
  new_total_xp: number;
  leveled_up: boolean;
  new_level?: number;
  companion: Companion;
}

/**
 * Generate message payload
 */
export interface GenerateMessagePayload {
  message_type: CompanionMessageType;
  context?: Record<string, any>;
  was_proactive?: boolean;
}

/**
 * Generate message response
 */
export interface GenerateMessageResponse {
  success: boolean;
  message: CompanionMessage;
}

/**
 * Companion API error
 */
export interface CompanionError {
  error: string;
  details?: string;
}

/**
 * Level requirements (XP needed for each level)
 */
export const LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
};

export const MAX_LEVEL = 10;

export const DEFAULT_PERSONALITY: PersonalityTraits = {
  enthusiasm: 5,
  curiosity: 5,
  supportiveness: 5,
  humor: 5,
};

export const ARCHETYPE_DESCRIPTIONS: Record<CompanionArchetype, string> = {
  mentor: 'Wise and supportive, focused on guiding your learning journey',
  friend: 'Casual and encouraging, celebrates your wins and keeps you motivated',
  explorer: 'Curious and adventurous, loves discovering new topics with you',
};

export const ARCHETYPE_EMOJIS: Record<CompanionArchetype, string> = {
  mentor: '🧙‍♂️',
  friend: '🤗',
  explorer: '🚀',
};

export const MESSAGE_TYPE_DESCRIPTIONS: Record<CompanionMessageType, string> = {
  greeting: 'Welcome and hello messages',
  encouragement: 'Positive reinforcement after actions',
  milestone: 'Celebration of level ups and achievements',
  reminder: 'Friendly reminders about streaks',
  celebration: 'Major accomplishment celebrations',
  curiosity: 'Questions about user interests',
  suggestion: 'Topic or action suggestions',
};