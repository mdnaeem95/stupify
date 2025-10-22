// ============================================================================
// STUPIFY AI COMPANION FEATURE - XP AWARD API ROUTE
// Created: October 22, 2025
// Version: 1.0
// Route: POST /api/companion/xp
// Description: Award XP to user's companion and handle level ups
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AwardXPPayload } from '@/lib/companion/types';
import { CompanionDB, CompanionManager, formatCompanionForAPI, getXPActionForSimplicityLevel } from '@/lib/companion/server';

/**
 * POST /api/companion/xp
 * Award XP to the authenticated user's companion
 * 
 * Body:
 * {
 *   action: string;              // XP action (e.g., 'question_normal', 'streak_maintained')
 *   amount?: number;             // Optional XP override
 *   metadata?: Record<string, any>;  // Additional context
 * }
 * 
 * Response:
 * - 200: { 
 *     success: true, 
 *     xp_gained: number,
 *     new_xp: number,
 *     new_total_xp: number,
 *     leveled_up: boolean,
 *     new_level?: number,
 *     companion: Companion
 *   }
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
    let body: AwardXPPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate action
    if (!body.action || typeof body.action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Action is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate amount if provided
    if (body.amount !== undefined) {
      if (typeof body.amount !== 'number' || body.amount < 0) {
        return NextResponse.json(
          { success: false, error: 'Amount must be a positive number' },
          { status: 400 }
        );
      }

      if (body.amount > 100) {
        return NextResponse.json(
          { success: false, error: 'Amount cannot exceed 100 XP' },
          { status: 400 }
        );
      }
    }

    // Get user's companion
    const companion = await CompanionDB.getOrCreateCompanion(user.id);

    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found' },
        { status: 404 }
      );
    }

    // Award XP
    const result = await CompanionManager.awardXP(
      companion,
      body.action,
      body.amount,
      body.metadata
    );

    // Format companion for API response
    const formattedCompanion = formatCompanionForAPI(result.companion);

    return NextResponse.json({
      success: result.success,
      xp_gained: result.xp_gained,
      new_xp: result.new_xp,
      new_total_xp: result.new_total_xp,
      leveled_up: result.leveled_up,
      new_level: result.new_level,
      companion: formattedCompanion,
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
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
 * Helper endpoint: POST /api/companion/xp/question
 * Convenience endpoint for awarding XP after asking a question
 * 
 * Body:
 * {
 *   simplicity_level: '5yo' | 'normal' | 'advanced';
 *   metadata?: Record<string, any>;
 * }
 */
export async function PUT(request: NextRequest) {
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

    // Validate simplicity level
    const validLevels = ['5yo', 'normal', 'advanced'];
    if (!body.simplicity_level || !validLevels.includes(body.simplicity_level)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid simplicity_level. Must be one of: ${validLevels.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Get appropriate action for simplicity level
    const action = getXPActionForSimplicityLevel(body.simplicity_level);

    // Get user's companion
    const companion = await CompanionDB.getOrCreateCompanion(user.id);

    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found' },
        { status: 404 }
      );
    }

    // Award XP
    const result = await CompanionManager.awardXP(
      companion,
      action,
      undefined,
      {
        ...body.metadata,
        simplicity_level: body.simplicity_level,
      }
    );

    // Format companion for API response
    const formattedCompanion = formatCompanionForAPI(result.companion);

    return NextResponse.json({
      success: result.success,
      xp_gained: result.xp_gained,
      new_xp: result.new_xp,
      new_total_xp: result.new_total_xp,
      leveled_up: result.leveled_up,
      new_level: result.new_level,
      companion: formattedCompanion,
    });
  } catch (error) {
    console.error('Error awarding question XP:', error);
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