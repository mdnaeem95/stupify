/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - COMPANION MANAGER
// Created: October 22, 2025
// Version: 1.0
// Description: Core business logic for companion system
// ============================================================================

import { calculateLevel, checkLevelUp, getLevelProgress, getAvatarForLevel, isMilestoneLevel, getLevelUpMessage, isValidXPValue } from './xp-calculator';
import { generateMessage, generateGreeting, generateEncouragement, generateMilestone, shouldSendProactiveMessage } from './message-generator';

import * as db from './supabase';

import type {
  Companion,
  CompanionMessage,
  CompanionInteraction,
  AwardXPResponse,
  GenerateMessageResponse,
  CompanionMessageType,
  CompanionArchetype,
  LevelProgress,
} from './types';

/**
 * Companion Manager
 * Central orchestrator for all companion-related business logic
 */
export class CompanionManager {
  /**
   * Get companion for a user (from database)
   */
  static async getCompanion(userId: string): Promise<Companion | null> {
    return await db.getCompanion(userId);
  }

  /**
   * Create a new companion for a user
   */
  static async createCompanion(
    userId: string,
    name?: string,
    archetype?: CompanionArchetype
  ): Promise<Companion> {
    return await db.createCompanion(userId, { name, archetype });
  }

  /**
   * Update companion details
   */
  static async updateCompanion(
    companionId: string,
    updates: Partial<Companion>
  ): Promise<Companion> {
    return await db.updateCompanion(companionId, updates);
  }

  /**
   * Award XP to a companion and handle level ups
   * This is the main entry point for XP awards
   * 
   * @param companion - Current companion state
   * @param action - Action that triggered XP (e.g., 'question_asked')
   * @param xpAmount - Optional XP override (otherwise uses xp_rules)
   * @param context - Additional context for logging
   * @returns Updated companion and level up information
   */
  static async awardXP(
    companion: Companion,
    action: string,
    xpAmount?: number,
    context?: Record<string, any>
  ): Promise<AwardXPResponse> {
    try {
      // Validate XP amount if provided
      const xpToAward = xpAmount ?? await this.getXPForAction(action);
      
      if (!isValidXPValue(xpToAward)) {
        throw new Error(`Invalid XP value: ${xpToAward}`);
      }

      // Calculate new XP values
      const newTotalXP = companion.total_xp + xpToAward;
      const newLevel = calculateLevel(newTotalXP);
      const levelUpInfo = checkLevelUp(companion.total_xp, xpToAward);

      // Calculate current level XP (XP within current level)
      const currentLevelProgress = getLevelProgress(newLevel, newTotalXP);
      const newXP = currentLevelProgress.current_xp;

      // Check if avatar should evolve
      const newAvatar = getAvatarForLevel(newLevel);

      // Prepare companion updates
      const updates: Partial<Companion> = {
        level: newLevel,
        xp: newXP,
        total_xp: newTotalXP,
        current_avatar: newAvatar,
        total_interactions: companion.total_interactions + 1,
        last_interaction_at: new Date().toISOString(),
      };

      // Update companion in database
      const updatedCompanion = await this.updateCompanion(companion.id, updates);

      // Log interaction
      await this.logInteraction(companion.id, 'question_asked', xpToAward, context);

      // If leveled up, log level_up interaction and generate milestone message
      if (levelUpInfo.willLevelUp) {
        await this.logInteraction(companion.id, 'level_up', 0, {
          old_level: levelUpInfo.oldLevel,
          new_level: levelUpInfo.newLevel,
          levels_gained: levelUpInfo.levelsGained,
        });

        // Generate milestone message
        const milestoneMessage = generateMilestone(
          companion.archetype,
          newLevel
        );

        await this.createMessage(
          companion.id,
          'milestone',
          milestoneMessage,
          {
            level: newLevel,
            old_level: levelUpInfo.oldLevel,
            is_milestone: isMilestoneLevel(newLevel),
          },
          false // Not proactive, triggered by level up
        );
      }

      return {
        success: true,
        xp_gained: xpToAward,
        new_xp: newXP,
        new_total_xp: newTotalXP,
        leveled_up: levelUpInfo.willLevelUp,
        new_level: levelUpInfo.willLevelUp ? newLevel : undefined,
        companion: updatedCompanion,
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Get XP reward for a specific action
   * Queries xp_rules table
   */
  static async getXPForAction(action: string): Promise<number> {
    return await db.getXPForAction(action);
  }

  /**
   * Generate and save a companion message
   * 
   * @param companionId - Companion ID
   * @param messageType - Type of message to generate
   * @param content - Optional pre-generated content
   * @param context - Additional context for message
   * @param wasProactive - Whether message was auto-triggered
   * @returns Generated message
   */
  static async createMessage(
    companionId: string,
    messageType: CompanionMessageType,
    content?: string,
    context?: Record<string, any>,
    wasProactive: boolean = false
  ): Promise<CompanionMessage> {
    // If no content provided, generate it
    if (!content) {
      const companion = await db.getCompanionById(companionId);
      if (!companion) {
        throw new Error('Companion not found');
      }
      content = generateMessage(companion.archetype, messageType, context);
    }

    return await db.createCompanionMessage(
      companionId,
      messageType,
      content,
      context,
      wasProactive
    );
  }

  /**
   * Generate a greeting message for user
   * Typically called on first visit of the day
   * 
   * @param companion - Companion state
   * @returns Generated greeting message
   */
  static async generateGreetingMessage(
    companion: Companion
  ): Promise<GenerateMessageResponse> {
    try {
      const content = generateGreeting(companion.archetype);

      const message = await this.createMessage(
        companion.id,
        'greeting',
        content,
        { generated_at: new Date().toISOString() },
        true // Greeting is proactive
      );

      // Log interaction
      await this.logInteraction(companion.id, 'message_sent', 0, {
        message_type: 'greeting',
        was_proactive: true,
      });

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('Error generating greeting:', error);
      throw error;
    }
  }

  /**
   * Generate an encouragement message after user action
   * 
   * @param companion - Companion state
   * @param context - Context about what triggered this
   * @param proactiveThreshold - Messages sent in session (for rate limiting)
   * @returns Generated message or null if shouldn't send
   */
  static async generateEncouragementMessage(
    companion: Companion,
    context?: Record<string, any>,
    proactiveThreshold: number = 0
  ): Promise<GenerateMessageResponse | null> {
    try {
      // Check if we should send a proactive message
      if (!shouldSendProactiveMessage(proactiveThreshold)) {
        return null;
      }

      const content = generateEncouragement(companion.archetype, context);

      const message = await this.createMessage(
        companion.id,
        'encouragement',
        content,
        context,
        true // Encouragement is proactive
      );

      // Log interaction
      await this.logInteraction(companion.id, 'message_sent', 0, {
        message_type: 'encouragement',
        was_proactive: true,
      });

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('Error generating encouragement:', error);
      throw error;
    }
  }

  /**
   * Get companion's level progress information
   * 
   * @param companion - Companion state
   * @returns Level progress details
   */
  static getLevelProgress(companion: Companion): LevelProgress {
    return getLevelProgress(companion.level, companion.total_xp);
  }

  /**
   * Check if companion should evolve avatar
   * 
   * @param companion - Companion state
   * @returns true if avatar should change
   */
  static shouldEvolveAvatar(companion: Companion): boolean {
    const expectedAvatar = getAvatarForLevel(companion.level);
    return companion.current_avatar !== expectedAvatar;
  }

  /**
   * Get user-friendly level up message
   * 
   * @param level - Level reached
   * @returns Celebratory message
   */
  static getLevelUpMessage(level: number): string {
    return getLevelUpMessage(level);
  }

  /**
   * Check if a level is a milestone (special rewards)
   * 
   * @param level - Level to check
   * @returns true if milestone level
   */
  static isMilestoneLevel(level: number): boolean {
    return isMilestoneLevel(level);
  }

  /**
   * Log an interaction with companion (for analytics)
   * 
   * @param companionId - Companion ID
   * @param interactionType - Type of interaction
   * @param xpGained - XP gained from interaction
   * @param metadata - Additional context
   */
  static async logInteraction(
    companionId: string,
    interactionType: CompanionInteraction['interaction_type'],
    xpGained: number = 0,
    metadata?: Record<string, any>
  ): Promise<void> {
    await db.logInteraction(companionId, interactionType, xpGained, metadata);
  }

  /**
   * Get recent messages from companion
   * 
   * @param companionId - Companion ID
   * @param limit - Number of messages to fetch
   * @returns Array of messages
   */
  static async getRecentMessages(
    companionId: string,
    limit: number = 10
  ): Promise<CompanionMessage[]> {
    return await db.getRecentMessages(companionId, limit);
  }

  /**
   * Mark a message as read
   * 
   * @param messageId - Message ID
   */
  static async markMessageAsRead(messageId: string): Promise<void> {
    await db.markMessagesAsRead(messageId);
  }

  /**
   * Get unread message count
   * 
   * @param companionId - Companion ID
   * @returns Number of unread messages
   */
  static async getUnreadMessageCount(companionId: string): Promise<number> {
    return await db.getUnreadMessageCount(companionId);
  }

  /**
   * Update companion's favorite topics based on recent questions
   * 
   * @param companion - Companion state
   * @param newTopic - Topic to add to favorites
   */
  static async updateFavoriteTopics(
    companion: Companion,
    newTopic: string
  ): Promise<void> {
    try {
      // Add topic to favorites if not already there
      const favoriteTopics = companion.favorite_topics || [];
      
      if (!favoriteTopics.includes(newTopic)) {
        // Keep only last 10 topics
        const updatedTopics = [newTopic, ...favoriteTopics].slice(0, 10);
        
        await this.updateCompanion(companion.id, {
          favorite_topics: updatedTopics,
        });
      }
    } catch (error) {
      console.error('Error updating favorite topics:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Generate a personalized message based on companion archetype and context
   * Phase 1: Uses canned messages
   * Phase 2: Will use GPT-4o-mini for dynamic generation
   * 
   * @param archetype - Companion personality type
   * @param messageType - Type of message to generate
   * @param context - Additional context
   * @returns Generated message content
   */
  static generatePersonalizedMessage(
    archetype: CompanionArchetype,
    messageType: CompanionMessageType,
    context?: Record<string, any>
  ): string {
    return generateMessage(archetype, messageType, context);
  }

  /**
   * Validate companion state
   * Ensures companion data is consistent
   * 
   * @param companion - Companion to validate
   * @returns true if valid, throws error if invalid
   */
  static validateCompanion(companion: Companion): boolean {
    if (!companion.id || !companion.user_id) {
      throw new Error('Invalid companion: missing required fields');
    }

    if (companion.level < 1 || companion.level > 20) {
      throw new Error(`Invalid companion level: ${companion.level}`);
    }

    if (companion.xp < 0 || companion.total_xp < 0) {
      throw new Error('Invalid companion XP: cannot be negative');
    }

    if (companion.total_xp < companion.xp) {
      throw new Error('Invalid companion XP: total_xp cannot be less than xp');
    }

    const expectedLevel = calculateLevel(companion.total_xp);
    if (companion.level !== expectedLevel) {
      console.warn(
        `Companion level mismatch: expected ${expectedLevel}, got ${companion.level}`
      );
      // Auto-fix level
      return false;
    }

    return true;
  }

  /**
   * Recalculate companion level based on total XP
   * Used for fixing inconsistencies
   * 
   * @param companion - Companion to fix
   * @returns Updated companion
   */
  static async recalculateLevel(companion: Companion): Promise<Companion> {
    const correctLevel = calculateLevel(companion.total_xp);
    const correctAvatar = getAvatarForLevel(correctLevel);
    const progress = getLevelProgress(correctLevel, companion.total_xp);

    if (companion.level !== correctLevel || companion.current_avatar !== correctAvatar) {
      console.log(
        `Recalculating companion ${companion.id}: ` +
        `level ${companion.level} → ${correctLevel}, ` +
        `avatar ${companion.current_avatar} → ${correctAvatar}`
      );

      return await this.updateCompanion(companion.id, {
        level: correctLevel,
        xp: progress.current_xp,
        current_avatar: correctAvatar,
      });
    }

    return companion;
  }

  /**
   * Get companion statistics summary
   * 
   * @param companionId - Companion ID
   * @returns Statistics object
   */
  static async getCompanionStats(companionId: string): Promise<{
    total_messages: number;
    total_interactions: number;
    questions_asked: number;
    messages_sent: number;
    level_ups: number;
  }> {
    return await db.getInteractionStats(companionId);
  }
}

/**
 * Helper function to format companion for API responses
 * Removes sensitive data and adds computed fields
 */
export function formatCompanionForAPI(companion: Companion) {
  const progress = getLevelProgress(companion.level, companion.total_xp);
  
  return {
    ...companion,
    progress: {
      current_xp: progress.current_xp,
      xp_to_next_level: progress.xp_to_next_level,
      progress_percentage: progress.progress_percentage,
    },
    is_milestone_level: isMilestoneLevel(companion.level),
    avatar_stage: companion.current_avatar,
  };
}

/**
 * Helper function to determine XP action based on simplicity level
 * Used when awarding XP for questions
 */
export function getXPActionForSimplicityLevel(
  simplicityLevel: '5yo' | 'normal' | 'advanced'
): string {
  const actionMap = {
    '5yo': 'question_5yo',
    'normal': 'question_normal',
    'advanced': 'question_advanced',
  };

  return actionMap[simplicityLevel];
}