// ============================================================================
// STUPIFY AI COMPANION FEATURE - INTERACT API ROUTE
// Created: October 22, 2025
// Updated: October 22, 2025 (Phase 2 - GPT Integration)
// Version: 2.0
// Route: POST/GET/PATCH /api/companion/interact
// Description: Generate companion messages and retrieve message history
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CompanionMessageType, GenerateMessagePayload, type Companion } from '@/lib/companion/types';
import { CompanionDB, CompanionManager } from '@/lib/companion/server';
import { generateMessage, generateGreeting, generateEncouragement, generateMilestone } from '@/lib/companion/gpt-message-generator';
import { type MessageContext, type MessageTrigger, getTimeOfDay } from '@/lib/companion/personality-prompts';
import { type PersonalityTraits } from '@/lib/companion/archetypes';

/**
 * POST /api/companion/interact
 * Generate a companion message using GPT-4o-mini
 * 
 * Body:
 * {
 *   message_type: CompanionMessageType;  // Type of message to generate
 *   context?: Record<string, any>;       // Additional context
 *   was_proactive?: boolean;             // Whether message is proactive
 * }
 * 
 * Response:
 * - 200: { success: true, message: CompanionMessage, generated_by: 'gpt' | 'template', latency: number }
 * - 400: { success: false, error: 'Invalid request' }
 * - 401: { success: false, error: 'Unauthorized' }
 * - 404: { success: false, error: 'Companion not found' }
 * - 500: { success: false, error: 'Internal server error' }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    let body: GenerateMessagePayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate message type
    const validMessageTypes: CompanionMessageType[] = [
      'greeting',
      'encouragement',
      'milestone',
      'reminder',
      'celebration',
      'curiosity',
      'suggestion',
    ];

    if (!body.message_type || !validMessageTypes.includes(body.message_type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid message_type. Must be one of: ${validMessageTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Get user's companion
    const companion = await CompanionDB.getOrCreateCompanion(user.id);

    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found' },
        { status: 404 }
      );
    }

    console.log(`[COMPANION] 🎭 Generating ${body.message_type} message for ${companion.name}`);
    console.log(`[COMPANION] Archetype: ${companion.archetype}, Level: ${companion.level}`);

    // Get user profile for additional context
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || undefined;

    // Parse personality traits (stored as JSONB)
    const traits: PersonalityTraits = typeof companion.personality_traits === 'string'
      ? JSON.parse(companion.personality_traits)
      : companion.personality_traits;

    // Generate message using GPT-4o-mini based on type
    let messageContent: string;
    let generatedBy: 'gpt' | 'template' = 'gpt';
    let gptLatency = 0;

    try {
      switch (body.message_type) {
        case 'greeting': {
          const result = await generateGreeting(
            companion.archetype,
            traits,
            companion.name,
            userName,
            companion.level
          );
          messageContent = result;
          gptLatency = Date.now() - startTime;
          break;
        }

        case 'encouragement': {
          // Build context from body
          const currentTopic = body.context?.current_topic;
          const recentTopics = body.context?.recent_topics || [];
          
          const result = await generateEncouragement(
            companion.archetype,
            traits,
            companion.name,
            {
              currentTopic,
              userLevel: companion.level,
              totalQuestions: companion.total_interactions,
              currentStreak: body.context?.current_streak || 0,
              recentTopics,
            }
          );
          messageContent = result;
          gptLatency = Date.now() - startTime;
          break;
        }

        case 'milestone':
        case 'celebration': {
          const result = await generateMilestone(
            companion.archetype,
            traits,
            companion.name,
            {
              type: body.message_type === 'milestone' ? 'level_up' : 'achievement',
              newLevel: body.context?.new_level || companion.level,
              achievementName: body.context?.achievement_name,
              totalQuestions: companion.total_interactions,
              unlockedFeatures: body.context?.unlocked_features,
            }
          );
          messageContent = result;
          gptLatency = Date.now() - startTime;
          break;
        }

        case 'curiosity':
        case 'suggestion':
        case 'reminder': {
          // For other types, use generic message generation
          const trigger: MessageTrigger = mapMessageTypeToTrigger(body.message_type);
          
          const messageContext: MessageContext = {
            userId: user.id,
            companionName: companion.name,
            userName,
            level: companion.level,
            totalXP: companion.total_xp,
            totalQuestions: companion.total_interactions,
            currentStreak: body.context?.current_streak || 0,
            trigger,
            favoriteTopics: body.context?.favorite_topics || [],
            recentTopics: body.context?.recent_topics || [],
            currentTopic: body.context?.current_topic,
            timeOfDay: getTimeOfDay(),
            lastInteractionAt: companion.last_interaction_at 
              ? new Date(companion.last_interaction_at) 
              : undefined,
            reason: body.context?.reason,
          };
          
          const result = await generateMessage({
            archetype: companion.archetype,
            traits,
            context: messageContext,
          });
          
          messageContent = result.message;
          generatedBy = result.model === 'template-fallback' ? 'template' : 'gpt';
          gptLatency = result.latency;
          break;
        }

        default:
          throw new Error(`Unhandled message type: ${body.message_type}`);
      }

      console.log(`[COMPANION] ✅ Generated via ${generatedBy} in ${gptLatency}ms`);
      console.log(`[COMPANION] Message: "${messageContent.substring(0, 50)}..."`);

    } catch (gptError) {
      console.error('[COMPANION] ❌ GPT generation failed:', gptError);
      
      // Fallback to simple template if GPT fails completely
      generatedBy = 'template';
      messageContent = getFallbackMessage(companion, body.message_type);
      console.log('[COMPANION] 🔄 Using fallback template message');
    }

    // Save message to database
    const savedMessage = await CompanionManager.createMessage(
      companion.id,
      body.message_type,
      messageContent,
      {
        ...body.context,
        generated_by: generatedBy,
        gpt_latency_ms: gptLatency,
      },
      body.was_proactive || false
    );

    const totalLatency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: savedMessage,
      generated_by: generatedBy,
      latency: totalLatency,
      gpt_latency: gptLatency,
    });

  } catch (error) {
    console.error('[COMPANION] ❌ Error generating companion message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/companion/interact
 * Get recent companion messages
 * 
 * Query params:
 * - limit?: number (default: 10, max: 50)
 * 
 * Response:
 * - 200: { success: true, messages: CompanionMessage[], unread_count: number }
 * - 401: { success: false, error: 'Unauthorized' }
 * - 404: { success: false, error: 'Companion not found' }
 * - 500: { success: false, error: 'Internal server error' }
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    let limit = 10;

    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1) {
        limit = 10;
      }
      if (limit > 50) {
        limit = 50; // Max 50 messages
      }
    }

    // Get user's companion
    const companion = await CompanionDB.getCompanion(user.id);

    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found' },
        { status: 404 }
      );
    }

    // Get recent messages
    const messages = await CompanionManager.getRecentMessages(
      companion.id,
      limit
    );

    // Get unread count
    const unreadCount = await CompanionManager.getUnreadMessageCount(
      companion.id
    );

    return NextResponse.json({
      success: true,
      messages,
      unread_count: unreadCount,
      total_returned: messages.length,
    });
  } catch (error) {
    console.error('Error fetching companion messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companion/interact
 * Mark messages as read
 * 
 * Body:
 * {
 *   message_ids?: string[];  // Specific message IDs to mark as read
 *   mark_all?: boolean;      // Mark all messages as read
 * }
 * 
 * Response:
 * - 200: { success: true, message: string }
 * - 400: { success: false, error: 'Invalid request' }
 * - 401: { success: false, error: 'Unauthorized' }
 * - 404: { success: false, error: 'Companion not found' }
 * - 500: { success: false, error: 'Internal server error' }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate body
    if (!body.message_ids && !body.mark_all) {
      return NextResponse.json(
        { success: false, error: 'Either message_ids or mark_all must be provided' },
        { status: 400 }
      );
    }

    // Get user's companion
    const companion = await CompanionDB.getCompanion(user.id);

    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found' },
        { status: 404 }
      );
    }

    // Mark messages as read
    if (body.mark_all) {
      await CompanionDB.markAllMessagesAsRead(companion.id);
      return NextResponse.json({
        success: true,
        message: 'All messages marked as read',
      });
    }

    if (body.message_ids && Array.isArray(body.message_ids)) {
      // Mark specific messages as read
      await Promise.all(
        body.message_ids.map((id: string) =>
          CompanionManager.markMessageAsRead(id)
        )
      );

      return NextResponse.json({
        success: true,
        message: `${body.message_ids.length} message(s) marked as read`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map CompanionMessageType to MessageTrigger
 */
function mapMessageTypeToTrigger(messageType: CompanionMessageType): MessageTrigger {
  const mapping: Record<CompanionMessageType, MessageTrigger> = {
    greeting: 'greeting',
    encouragement: 'encouragement',
    milestone: 'milestone',
    reminder: 'streak_reminder',
    celebration: 'celebration',
    curiosity: 'curiosity',
    suggestion: 'topic_suggestion',
  };
  
  return mapping[messageType] || 'encouragement';
}

/**
 * Get ultra-safe fallback message (last resort)
 */
function getFallbackMessage(companion: Companion, messageType: CompanionMessageType): string {
  const fallbacks: Record<CompanionMessageType, string> = {
    greeting: `Hey there! I'm ${companion.name}, ready to learn with you!`,
    encouragement: `Great question! Keep that curiosity going!`,
    milestone: `Congrats on reaching level ${companion.level}!`,
    reminder: `Your learning streak is looking good!`,
    celebration: `Amazing achievement! You earned this!`,
    curiosity: `What are you curious about today?`,
    suggestion: `Want to explore something new?`,
  };
  
  return fallbacks[messageType] || `Hey! Keep up the great learning!`;
}