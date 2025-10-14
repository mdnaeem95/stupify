import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserStreak, getStreakCalendar } from '@/lib/gamification/streak-tracker';

// GET /api/gamification/streak
// Returns user's streak information
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

    console.log('🔥 Fetching streak for user:', user.id);

    const [streak, calendar] = await Promise.all([
      getUserStreak(user.id),
      getStreakCalendar(user.id),
    ]);

    if (!streak) {
      // Initialize streak if doesn't exist
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        calendar: [],
      });
    }

    const response = {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActivityDate: streak.lastActivityDate,
      streakFreezeAvailable: streak.streakFreezeAvailable,
      calendar: calendar,
    };

    console.log('✅ Streak fetched successfully');

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching streak:', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}