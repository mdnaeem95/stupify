import { createClient } from '@/lib/supabase/server';
import { SimplicityLevel } from '../prompts-v2';

// 📊 Learning Stats Tracker
// Tracks daily user activity for stats dashboard

export interface DailyStats {
  date: string;
  questionsAsked: number;
  topicsExplored: string[];
  avgSimplifyLevel: number;
  followUpsUsed: number;
  voiceInputsUsed: number;
  explanationsShared: number;
}

export interface WeeklyStats {
  totalQuestions: number;
  avgQuestionsPerDay: number;
  topTopics: { topic: string; count: number }[];
  mostUsedLevel: SimplicityLevel;
  streakDays: number;
}

/**
 * Update daily stats after user asks a question
 */
export async function updateDailyStats(
  userId: string,
  topic?: string,
  simplicityLevel?: SimplicityLevel,
  isFollowUp: boolean = false,
  isVoiceInput: boolean = false
): Promise<void> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get existing stats for today
    const { data: existing } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing record
      const currentTopics = (existing.topics_explored as string[]) || [];
      const updatedTopics = topic && !currentTopics.includes(topic) 
        ? [...currentTopics, topic] 
        : currentTopics;

      const { error } = await supabase
        .from('learning_stats')
        .update({
          questions_asked: existing.questions_asked + 1,
          topics_explored: updatedTopics,
          follow_ups_used: existing.follow_ups_used + (isFollowUp ? 1 : 0),
          voice_inputs_used: existing.voice_inputs_used + (isVoiceInput ? 1 : 0),
        })
        .eq('user_id', userId)
        .eq('date', today);

      if (error) {
        console.error('❌ Failed to update daily stats:', error);
      }
    } else {
      // Create new record for today
      const { error } = await supabase
        .from('learning_stats')
        .insert({
          user_id: userId,
          date: today,
          questions_asked: 1,
          topics_explored: topic ? [topic] : [],
          follow_ups_used: isFollowUp ? 1 : 0,
          voice_inputs_used: isVoiceInput ? 1 : 0,
          explanations_shared: 0,
        });

      if (error) {
        console.error('❌ Failed to create daily stats:', error);
      }
    }

    console.log('✅ Daily stats updated');
  } catch (error) {
    console.error('❌ Error updating daily stats:', error);
  }
}

/**
 * Increment shared explanations count
 */
export async function incrementShareCount(userId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      await supabase
        .from('learning_stats')
        .update({
          explanations_shared: existing.explanations_shared + 1,
        })
        .eq('user_id', userId)
        .eq('date', today);
    } else {
      // Create record if doesn't exist
      await supabase
        .from('learning_stats')
        .insert({
          user_id: userId,
          date: today,
          questions_asked: 0,
          explanations_shared: 1,
        });
    }

    console.log('✅ Share count incremented');
  } catch (error) {
    console.error('❌ Error incrementing share count:', error);
  }
}

/**
 * Get daily stats for a specific date
 */
export async function getDailyStats(userId: string, date: string): Promise<DailyStats | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error || !data) return null;

    return {
      date: data.date,
      questionsAsked: data.questions_asked,
      topicsExplored: (data.topics_explored as string[]) || [],
      avgSimplifyLevel: data.avg_simplify_level || 0,
      followUpsUsed: data.follow_ups_used || 0,
      voiceInputsUsed: data.voice_inputs_used || 0,
      explanationsShared: data.explanations_shared || 0,
    };
  } catch (error) {
    console.error('❌ Error fetching daily stats:', error);
    return null;
  }
}

/**
 * Get weekly stats (last 7 days)
 */
export async function getWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  try {
    const supabase = await createClient();
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const { data: stats } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!stats || stats.length === 0) return null;

    // Calculate aggregates
    const totalQuestions = stats.reduce((sum, day) => sum + day.questions_asked, 0);
    const avgQuestionsPerDay = totalQuestions / 7;

    // Count topics
    const topicCounts: { [key: string]: number } = {};
    stats.forEach((day) => {
      const topics = (day.topics_explored as string[]) || [];
      topics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const topTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count active days (for streak)
    const streakDays = stats.filter((day) => day.questions_asked > 0).length;

    return {
      totalQuestions,
      avgQuestionsPerDay,
      topTopics,
      mostUsedLevel: "5yo" as SimplicityLevel, // TODO: Calculate from messages
      streakDays,
    };
  } catch (error) {
    console.error('❌ Error fetching weekly stats:', error);
    return null;
  }
}

/**
 * Get all-time stats
 */
export async function getAllTimeStats(userId: string): Promise<{
  totalQuestions: number;
  totalTopics: number;
  totalDays: number;
  longestStreak: number;
  achievementsUnlocked: number;
}> {
  try {
    const supabase = await createClient();

    // Get all learning stats
    const { data: allStats } = await supabase
      .from('learning_stats')
      .select('*')
      .eq('user_id', userId);

    // Get streak info
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('longest_streak')
      .eq('user_id', userId)
      .single();

    // Get achievements count
    const { count: achievementsCount } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate aggregates
    const totalQuestions = allStats?.reduce((sum, day) => sum + day.questions_asked, 0) || 0;
    const allTopics = new Set<string>();
    allStats?.forEach((day) => {
      const topics = (day.topics_explored as string[]) || [];
      topics.forEach((topic) => allTopics.add(topic));
    });

    return {
      totalQuestions,
      totalTopics: allTopics.size,
      totalDays: allStats?.length || 0,
      longestStreak: streakData?.longest_streak || 0,
      achievementsUnlocked: achievementsCount || 0,
    };
  } catch (error) {
    console.error('❌ Error fetching all-time stats:', error);
    return {
      totalQuestions: 0,
      totalTopics: 0,
      totalDays: 0,
      longestStreak: 0,
      achievementsUnlocked: 0,
    };
  }
}

/**
 * Get favorite topics (top 10 most explored)
 */
export async function getFavoriteTopics(userId: string): Promise<{ topic: string; count: number }[]> {
  try {
    const supabase = await createClient();

    const { data: stats } = await supabase
      .from('learning_stats')
      .select('topics_explored')
      .eq('user_id', userId);

    if (!stats) return [];

    const topicCounts: { [key: string]: number } = {};
    stats.forEach((day) => {
      const topics = (day.topics_explored as string[]) || [];
      topics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  } catch (error) {
    console.error('❌ Error fetching favorite topics:', error);
    return [];
  }
}