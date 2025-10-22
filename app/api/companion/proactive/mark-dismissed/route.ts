// ============================================================================
// MARK DISMISSED API ROUTE
// Created: October 22, 2025
// Version: 1.0
// Route: POST /api/companion/proactive/mark-dismissed
// Description: Mark a proactive message as dismissed by user
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markMessageDismissed } from '@/lib/companion/proactive-message-manager';

/**
 * POST /api/companion/proactive/mark-dismissed
 * Mark message as dismissed by user
 * 
 * Body:
 * {
 *   messageId: string;
 *   sessionId: string;
 * }
 * 
 * Response:
 * - 200: { success: true }
 * - 400: { success: false, error: 'Invalid request' }
 * - 401: { success: false, error: 'Unauthorized' }
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
    let body: { messageId: string; sessionId: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!body.messageId || !body.sessionId) {
      return NextResponse.json(
        { success: false, error: 'messageId and sessionId are required' },
        { status: 400 }
      );
    }

    // Mark as dismissed
    const success = await markMessageDismissed(body.messageId, body.sessionId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as dismissed',
    });
  } catch (error) {
    console.error('[MARK DISMISSED API] Error:', error);
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