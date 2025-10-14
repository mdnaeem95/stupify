import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserAchievements, checkAllAchievements } from '@/lib/gamification/achievement-checker';

// GET /api/gamification/achievements
// Returns all achievements with user's unlock status
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🏆 Fetching achievements for user:', user.id);

    const achievements = await getUserAchievements(user.id);

    // Group by category
    const grouped = {
      streak: achievements.filter((a) => a.category === 'streak'),
      learning: achievements.filter((a) => a.category === 'learning'),
      social: achievements.filter((a) => a.category === 'social'),
      exploration: achievements.filter((a) => a.category === 'exploration'),
    };

    const response = {
      all: achievements,
      byCategory: grouped,
      stats: {
        total: achievements.length,
        unlocked: achievements.filter((a) => a.unlocked).length,
        percentage: Math.round((achievements.filter((a) => a.unlocked).length / achievements.length) * 100),
      },
    };

    console.log('✅ Achievements fetched successfully');

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

// POST /api/gamification/achievements/check
// Manually trigger achievement check (useful after user action)
export async function POST() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Checking achievements for user:', user.id);

    const newAchievements = await checkAllAchievements(user.id);

    if (newAchievements.length > 0) {
      console.log(`🎉 ${newAchievements.length} new achievement(s) unlocked!`);
    }

    return NextResponse.json({
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error('❌ Error checking achievements:', error);
    return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 });
  }
}