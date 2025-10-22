// ============================================================================
// STUPIFY AI COMPANION FEATURE - INTERACT API ROUTE
// Created: October 22, 2025
// Version: 1.0
// Route: POST/GET /api/companion/interact
// Description: Generate companion messages and retrieve message history
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CompanionMessageType, GenerateMessagePayload } from '@/lib/companion/types';
import { CompanionDB, CompanionManager } from '@/lib/companion/server';

/**
 * POST /api/companion/interact
 * Generate a companion message
 * 
 * Body:
 * {
 *   message_type: CompanionMessageType;  // Type of message to generate
 *   context?: Record<string, any>;       // Additional context
 *   was_proactive?: boolean;             // Whether message is proactive
 * }
 * 
 * Response:
 * - 200: { success: true, message: CompanionMessage }
 * - 400: { success: false, error: 'Invalid request' }
 * - 401: { success: false, error: 'Unauthorized' }
 * - 404: { success: false, error: 'Companion not found' }
 * - 500: { success: false, error: 'Internal server error' }
 */
export async function POST(request: NextRequest) {
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

    // Generate message based on type
    let result;

    switch (body.message_type) {
      case 'greeting':
        result = await CompanionManager.generateGreetingMessage(companion);
        break;

      case 'encouragement':
        // Check proactive threshold from context
        const proactiveThreshold = body.context?.proactive_threshold || 0;
        result = await CompanionManager.generateEncouragementMessage(
          companion,
          body.context,
          proactiveThreshold
        );

        // If null, we shouldn't send proactive message
        if (!result) {
          return NextResponse.json({
            success: true,
            message: null,
            reason: 'Proactive message threshold reached',
          });
        }
        break;

      default:
        // For other message types, use generic createMessage
        result = {
          success: true,
          message: await CompanionManager.createMessage(
            companion.id,
            body.message_type,
            undefined,
            body.context,
            body.was_proactive || false
          ),
        };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating companion message:', error);
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