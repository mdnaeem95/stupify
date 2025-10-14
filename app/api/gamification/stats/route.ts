import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserStreak, getStreakCalendar } from '@/lib/gamification/streak-tracker';
import { getAchievementProgress } from '@/lib/gamification/achievement-checker';
import { getWeeklyStats, getAllTimeStats, getFavoriteTopics } from '@/lib/gamification/learning-stats';

// GET /api/gamification/stats
// Returns comprehensive user stats for dashboard
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

    console.log('📊 Fetching stats for user:', user.id);

    // Fetch all stats in parallel
    const [streak, calendar, achievements, weeklyStats, allTimeStats, favoriteTopics] = await Promise.all([
      getUserStreak(user.id),
      getStreakCalendar(user.id),
      getAchievementProgress(user.id),
      getWeeklyStats(user.id),
      getAllTimeStats(user.id),
      getFavoriteTopics(user.id),
    ]);

    const response = {
      streak: {
        current: streak?.currentStreak || 0,
        longest: streak?.longestStreak || 0,
        calendar: calendar,
      },
      achievements: {
        total: achievements.total,
        unlocked: achievements.unlocked,
        recent: achievements.recent,
      },
      weekly: weeklyStats || {
        totalQuestions: 0,
        avgQuestionsPerDay: 0,
        topTopics: [],
        mostUsedLevel: 5,
        streakDays: 0,
      },
      allTime: allTimeStats,
      favoriteTopics: favoriteTopics,
    };

    console.log('✅ Stats fetched successfully');

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}