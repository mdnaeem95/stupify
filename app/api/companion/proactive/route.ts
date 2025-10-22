// ============================================================================
// PROACTIVE MESSAGE API ROUTE
// Created: October 22, 2025
// Version: 1.0
// Route: GET /api/companion/proactive
// Description: Fetch next proactive message from queue for user
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNextProactiveMessage } from '@/lib/companion/proactive-message-manager';

/**
 * GET /api/companion/proactive
 * Fetch next proactive message from queue
 * 
 * Response:
 * - 200: { success: true, message: QueuedMessage, messageId: string }
 * - 204: { success: true, message: null } (no messages in queue)
 * - 401: { success: false, error: 'Unauthorized' }
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

    // Get next message from queue
    const queuedMessage = await getNextProactiveMessage(user.id);

    if (!queuedMessage) {
      return NextResponse.json(
        { success: true, message: null },
        { status: 200 }
      );
    }

    // Format message for response
    return NextResponse.json({
      success: true,
      message: {
        id: queuedMessage.id,
        content: queuedMessage.context.companionName 
          ? `${queuedMessage.context.companionName} says: "${queuedMessage.context.currentTopic || 'Hey!'}"`
          : 'Hello there!',
        trigger: queuedMessage.trigger,
        priority: queuedMessage.priority,
        createdAt: queuedMessage.createdAt,
        context: queuedMessage.context,
      },
      messageId: queuedMessage.id,
    });
  } catch (error) {
    console.error('[PROACTIVE API] Error fetching message:', error);
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