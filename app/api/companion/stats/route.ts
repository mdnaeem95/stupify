import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCompanion, updateCompanionStats } from '@/lib/companion/supabase';
import { calculateStatChange, applyStatChanges } from '@/lib/companion/stats-manager';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, complexity } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    // Get user's companion
    const companion = await getCompanion(user.id);
    
    if (!companion) {
      return NextResponse.json(
        { error: 'Companion not found' },
        { status: 404 }
      );
    }

    // Calculate stat changes
    const statChanges = calculateStatChange(action, complexity);

    // Apply changes to current stats
    const currentStats = {
      happiness: companion.happiness,
      energy: companion.energy,
      knowledge: companion.knowledge,
    };

    const newStats = applyStatChanges(currentStats, statChanges);

    // Update companion stats in database
    const updatedCompanion = await updateCompanionStats(companion.id, newStats);

    return NextResponse.json({
      success: true,
      stats: {
        happiness: updatedCompanion.happiness,
        energy: updatedCompanion.energy,
        knowledge: updatedCompanion.knowledge,
      },
      changes: statChanges,
    });

  } catch (error) {
    console.error('Error updating companion stats:', error);
    return NextResponse.json(
      { error: 'Failed to update companion stats' },
      { status: 500 }
    );
  }
}