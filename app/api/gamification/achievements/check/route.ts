import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAllAchievements } from '@/lib/gamification/achievement-checker';

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newAchievements = await checkAllAchievements(user.id);

    return NextResponse.json({
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check achievements' }, 
      { status: 500 }
    );
  }
}