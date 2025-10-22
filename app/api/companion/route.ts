// ============================================================================
// STUPIFY AI COMPANION FEATURE - MAIN API ROUTE
// Created: October 22, 2025
// Version: 1.0
// Route: GET/PATCH /api/companion
// Description: Fetch and update user's companion
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CompanionDB, CompanionManager, formatCompanionForAPI } from '@/lib/companion/server';
import { Companion, UpdateCompanionPayload } from '@/lib/companion/types';

/**
 * GET /api/companion
 * Fetch the authenticated user's companion
 * 
 * Response:
 * - 200: { success: true, companion: Companion, progress: LevelProgress }
 * - 401: { success: false, error: 'Unauthorized' }
 * - 404: { success: false, error: 'Companion not found' }
 * - 500: { success: false, error: 'Internal server error' }
 */
export async function GET() {
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

    // Get or create companion
    const companion = await CompanionDB.getOrCreateCompanion(user.id);

    if (!companion) {
      return NextResponse.json(
        { success: false, error: 'Companion not found' },
        { status: 404 }
      );
    }

    // Validate and fix companion if needed
    try {
      CompanionManager.validateCompanion(companion);
    } catch (validationError) {
      console.warn('Companion validation failed, recalculating:', validationError);
      // Auto-fix companion
      const fixedCompanion = await CompanionManager.recalculateLevel(companion);
      return NextResponse.json({
        success: true,
        companion: formatCompanionForAPI(fixedCompanion),
      });
    }

    // Format companion for API response
    const formattedCompanion = formatCompanionForAPI(companion);

    return NextResponse.json({
      success: true,
      companion: formattedCompanion,
    });
  } catch (error) {
    console.error('Error fetching companion:', error);
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
 * PATCH /api/companion
 * Update the authenticated user's companion
 * 
 * Body:
 * {
 *   name?: string;              // New companion name
 *   archetype?: CompanionArchetype;  // Change personality
 *   personality_traits?: Partial<PersonalityTraits>;  // Adjust traits
 * }
 * 
 * Response:
 * - 200: { success: true, companion: Companion }
 * - 400: { success: false, error: 'Invalid request body' }
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
    let body: UpdateCompanionPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate update payload
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Validate allowed fields
    const allowedFields = ['name', 'archetype', 'personality_traits'];
    const invalidFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid fields: ${invalidFields.join(', ')}`,
          allowed_fields: allowedFields
        },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Name must be a string' },
          { status: 400 }
        );
      }

      const trimmedName = body.name.trim();
      if (trimmedName.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Name cannot be empty' },
          { status: 400 }
        );
      }

      if (trimmedName.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Name must be 50 characters or less' },
          { status: 400 }
        );
      }

      body.name = trimmedName;
    }

    // Validate archetype if provided
    if (body.archetype !== undefined) {
      const validArchetypes = ['mentor', 'friend', 'explorer'];
      if (!validArchetypes.includes(body.archetype)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid archetype. Must be one of: ${validArchetypes.join(', ')}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate personality traits if provided
    if (body.personality_traits !== undefined) {
      const validTraits = ['enthusiasm', 'curiosity', 'supportiveness', 'humor'];
      const traitKeys = Object.keys(body.personality_traits);

      for (const key of traitKeys) {
        if (!validTraits.includes(key)) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Invalid personality trait: ${key}`,
              valid_traits: validTraits
            },
            { status: 400 }
          );
        }

        const value = body.personality_traits[key as keyof typeof body.personality_traits];
        if (typeof value !== 'number' || value < 0 || value > 10) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Personality trait ${key} must be a number between 0 and 10` 
            },
            { status: 400 }
          );
        }
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

    const updateData: Partial<Companion> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.archetype !== undefined) {
      updateData.archetype = body.archetype;
    }

    if (body.personality_traits !== undefined) {
      // Merge partial traits with existing traits
      updateData.personality_traits = {
        ...companion.personality_traits,
        ...body.personality_traits,
      };
    }

    // Update companion
    const updatedCompanion = await CompanionManager.updateCompanion(
      companion.id,
      updateData
    );

    // Log customization interaction
    await CompanionManager.logInteraction(
      companion.id,
      'customized',
      0,
      { updates: Object.keys(body) }
    );

    // Format companion for API response
    const formattedCompanion = formatCompanionForAPI(updatedCompanion);

    return NextResponse.json({
      success: true,
      companion: formattedCompanion,
      message: 'Companion updated successfully',
    });
  } catch (error) {
    console.error('Error updating companion:', error);
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