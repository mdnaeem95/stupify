import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserAchievements } from '@/lib/gamification/achievement-checker';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const achievements = await getUserAchievements(user.id);

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

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch achievements' }, 
      { status: 500 }
    );
  }
}