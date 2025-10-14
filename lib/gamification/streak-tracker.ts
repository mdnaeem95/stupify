import { createClient } from '@/lib/supabase/server';

// 🎯 Streak Tracker
// Automatically updates user streaks when they ask questions

interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeAvailable: boolean;
}

interface StreakUpdateResult {
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
  milestoneReached: boolean;
  milestoneValue?: number;
}

// Milestone values (for celebrations)
const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 365];

/**
 * Update user's streak when they ask a question
 * Called from /api/chat route after successful message
 */
export async function updateUserStreak(userId: string): Promise<StreakUpdateResult | null> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get or create user streak record
    const { data: streakData, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Initialize streak if doesn't exist
    if (fetchError || !streakData) {
      const { data: newStreak, error: createError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create streak:', createError);
        return null;
      }

      // First ever question = milestone!
      return {
        currentStreak: 1,
        longestStreak: 1,
        isNewRecord: true,
        milestoneReached: false,
      };
    }

    const lastActivity = streakData.last_activity_date;

    // Already updated today? Skip
    if (lastActivity === today) {
      return {
        currentStreak: streakData.current_streak,
        longestStreak: streakData.longest_streak,
        isNewRecord: false,
        milestoneReached: false,
      };
    }

    // Calculate new streak
    const newStreakData = calculateNewStreak(
      lastActivity,
      today,
      streakData.current_streak,
      streakData.longest_streak
    );

    // Update database
    const { error: updateError } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreakData.currentStreak,
        longest_streak: newStreakData.longestStreak,
        last_activity_date: today,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Failed to update streak:', updateError);
      return null;
    }

    // Check if milestone reached
    const milestoneReached = STREAK_MILESTONES.includes(newStreakData.currentStreak);

    console.log('✅ Streak updated:', {
      userId,
      currentStreak: newStreakData.currentStreak,
      longestStreak: newStreakData.longestStreak,
      milestoneReached,
    });

    // Check for new achievements
    await checkStreakAchievements(userId, newStreakData.currentStreak);

    return {
      currentStreak: newStreakData.currentStreak,
      longestStreak: newStreakData.longestStreak,
      isNewRecord: newStreakData.isNewRecord,
      milestoneReached,
      milestoneValue: milestoneReached ? newStreakData.currentStreak : undefined,
    };
  } catch (error) {
    console.error('❌ Streak update error:', error);
    return null;
  }
}

/**
 * Calculate new streak based on last activity
 */
function calculateNewStreak(
  lastActivity: string | null,
  today: string,
  currentStreak: number,
  longestStreak: number
): { currentStreak: number; longestStreak: number; isNewRecord: boolean } {
  if (!lastActivity) {
    // First activity ever
    return {
      currentStreak: 1,
      longestStreak: 1,
      isNewRecord: true,
    };
  }

  const lastDate = new Date(lastActivity);
  const todayDate = new Date(today);
  const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day! Increment streak
    const newStreak = currentStreak + 1;
    const newLongest = Math.max(newStreak, longestStreak);
    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      isNewRecord: newStreak > longestStreak,
    };
  } else if (daysDiff > 1) {
    // Streak broken! Reset to 1
    return {
      currentStreak: 1,
      longestStreak: longestStreak, // Keep the record
      isNewRecord: false,
    };
  }

  // Same day (should not happen due to check above)
  return {
    currentStreak,
    longestStreak,
    isNewRecord: false,
  };
}

/**
 * Check and unlock streak achievements
 */
async function checkStreakAchievements(userId: string, currentStreak: number): Promise<void> {
  const supabase = await createClient();

  // Get all streak achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, code, requirement')
    .eq('category', 'streak');

  if (!achievements) return;

  // Check which ones to unlock
  for (const achievement of achievements) {
    const requirement = achievement.requirement as { type: string; value: number };

    if (requirement.type === 'streak' && currentStreak >= requirement.value) {
      // Try to unlock (will fail silently if already unlocked due to primary key)
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });
    }
  }
}

/**
 * Get user's current streak info
 */
export async function getUserStreak(userId: string): Promise<StreakData | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date,
      streakFreezeAvailable: data.streak_freeze_available,
    };
  } catch (error) {
    console.error('❌ Error fetching streak:', error);
    return null;
  }
}

/**
 * Get streak calendar data (last 30 days)
 */
export async function getStreakCalendar(userId: string): Promise<{ date: string; active: boolean }[]> {
  try {
    const supabase = await createClient();
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Get all days user asked questions in last 30 days
    const { data: stats } = await supabase
      .from('learning_stats')
      .select('date, questions_asked')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!stats) return [];

    // Create calendar array
    const calendar: { date: string; active: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = stats.find((s) => s.date === dateStr);
      calendar.push({
        date: dateStr,
        active: dayData ? dayData.questions_asked > 0 : false,
      });
    }

    return calendar;
  } catch (error) {
    console.error('❌ Error fetching streak calendar:', error);
    return [];
  }
}