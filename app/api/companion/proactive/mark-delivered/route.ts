// ============================================================================
// MARK DELIVERED API ROUTE
// Created: October 22, 2025
// Version: 1.0
// Route: POST /api/companion/proactive/mark-delivered
// Description: Mark a proactive message as delivered
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markMessageDelivered } from '@/lib/companion/proactive-message-manager';

/**
 * POST /api/companion/proactive/mark-delivered
 * Mark message as delivered
 * 
 * Body:
 * {
 *   messageId: string;
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
    let body: { messageId: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (!body.messageId) {
      return NextResponse.json(
        { success: false, error: 'messageId is required' },
        { status: 400 }
      );
    }

    // Mark as delivered
    const success = await markMessageDelivered(body.messageId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Message not found or already delivered' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as delivered',
    });
  } catch (error) {
    console.error('[MARK DELIVERED API] Error:', error);
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