/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';

// 🏆 Achievement Checker
// Tracks user actions and unlocks achievements

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'learning' | 'social' | 'exploration';
  requirement: {
    type: string;
    value: number | boolean;
  };
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementProgress {
  total: number;
  unlocked: number;
  recent: Achievement[];
}

/**
 * Get all achievements with user's unlock status
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_achievement_progress', {
      p_user_id: userId,
    });

    if (error) {
      console.error('❌ Error fetching achievements:', error);
      return [];
    }

    return data.map((a: any) => ({
      id: a.achievement_id,
      code: a.code,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      requirement: {}, // Requirement not needed in frontend
      unlocked: a.unlocked,
      unlockedAt: a.unlocked_at,
    }));
  } catch (error) {
    console.error('❌ Error in getUserAchievements:', error);
    return [];
  }
}

/**
 * Get achievement progress summary
 */
export async function getAchievementProgress(userId: string): Promise<AchievementProgress> {
  try {
    const achievements = await getUserAchievements(userId);
    const unlocked = achievements.filter((a) => a.unlocked);
    const recent = unlocked
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      })
      .slice(0, 3);

    return {
      total: achievements.length,
      unlocked: unlocked.length,
      recent,
    };
  } catch (error) {
    console.error('❌ Error in getAchievementProgress:', error);
    return { total: 0, unlocked: 0, recent: [] };
  }
}

/**
 * Check and unlock learning achievements after user action
 */
export async function checkLearningAchievements(
  userId: string,
  totalQuestions: number,
  followUpsUsed: number,
  uniqueTopics: number
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  try {
    const supabase = await createClient();

    // Get all learning achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', 'learning');

    if (!achievements) return [];

    // Check each achievement
    for (const achievement of achievements) {
      const req = achievement.requirement as { type: string; value: number };

      let shouldUnlock = false;

      switch (req.type) {
        case 'questions_total':
          shouldUnlock = totalQuestions >= req.value;
          break;
        case 'follow_ups':
          shouldUnlock = followUpsUsed >= req.value;
          break;
        case 'unique_topics':
          shouldUnlock = uniqueTopics >= req.value;
          break;
      }

      if (shouldUnlock) {
        // Try to unlock (will fail silently if already unlocked)
        const { data, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          })
          .select()
          .single();

        // If successfully inserted (not duplicate), add to new achievements
        if (!error && data) {
          newAchievements.push({
            id: achievement.id,
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            requirement: achievement.requirement,
            unlocked: true,
            unlockedAt: data.unlocked_at,
          });
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('❌ Error checking learning achievements:', error);
    return [];
  }
}

/**
 * Check and unlock social achievements
 */
export async function checkSocialAchievements(
  userId: string,
  sharesCount: number,
  analogyLikes: number
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  try {
    const supabase = await createClient();

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', 'social');

    if (!achievements) return [];

    for (const achievement of achievements) {
      const req = achievement.requirement as { type: string; value: number };

      let shouldUnlock = false;

      switch (req.type) {
        case 'shares':
          shouldUnlock = sharesCount >= req.value;
          break;
        case 'analogy_likes':
          shouldUnlock = analogyLikes >= req.value;
          break;
      }

      if (shouldUnlock) {
        const { data, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          })
          .select()
          .single();

        if (!error && data) {
          newAchievements.push({
            id: achievement.id,
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            requirement: achievement.requirement,
            unlocked: true,
            unlockedAt: data.unlocked_at,
          });
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('❌ Error checking social achievements:', error);
    return [];
  }
}

/**
 * Check and unlock exploration achievements
 */
export async function checkExplorationAchievements(
  userId: string,
  voiceUsed: boolean,
  followUpsUsed: number,
  allLevelsUsed: boolean
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  try {
    const supabase = await createClient();

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', 'exploration');

    if (!achievements) return [];

    for (const achievement of achievements) {
      const req = achievement.requirement as { type: string; value: number | boolean };

      let shouldUnlock = false;

      switch (req.type) {
        case 'voice_used':
          shouldUnlock = voiceUsed;
          break;
        case 'follow_ups':
          shouldUnlock = followUpsUsed >= (req.value as number);
          break;
        case 'all_levels':
          shouldUnlock = allLevelsUsed;
          break;
      }

      if (shouldUnlock) {
        const { data, error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          })
          .select()
          .single();

        if (!error && data) {
          newAchievements.push({
            id: achievement.id,
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            requirement: achievement.requirement,
            unlocked: true,
            unlockedAt: data.unlocked_at,
          });
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('❌ Error checking exploration achievements:', error);
    return [];
  }
}

/**
 * Get user's learning stats aggregated
 */
export async function getUserLearningStats(userId: string): Promise<{
  totalQuestions: number;
  uniqueTopics: number;
  followUpsUsed: number;
  sharesCount: number;
  analogyLikes: number;
  voiceUsed: boolean;
  allLevelsUsed: boolean;
}> {
  try {
    const supabase = await createClient();

    // Get total questions from messages
    const { count: questionsCount } = await supabase
      .from('messages')
      .select('id, conversations!inner(user_id)', { count: 'exact', head: true })
      .eq('role', 'user')
      .eq('conversations.user_id', userId);

    // Get follow-ups used from learning_stats
    const { data: stats } = await supabase
      .from('learning_stats')
      .select('follow_ups_used, topics_explored')
      .eq('user_id', userId);

    let followUpsTotal = 0;
    const allTopics = new Set<string>();

    if (stats) {
      stats.forEach((day) => {
        followUpsTotal += day.follow_ups_used || 0;
        const topics = day.topics_explored as string[];
        topics?.forEach((t) => allTopics.add(t));
      });
    }

    // Get shares count
    const { count: sharesCount } = await supabase
      .from('saved_explanations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get analogy likes
    const { count: likesCount } = await supabase
      .from('analogy_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('rating', 'up');

    // Check if voice used (from learning_stats)
    const { data: voiceData } = await supabase
      .from('learning_stats')
      .select('voice_inputs_used')
      .eq('user_id', userId)
      .gt('voice_inputs_used', 0)
      .limit(1);

    // Check if all levels used
    const { data: levelsData } = await supabase
      .from('messages')
      .select('simplicity_level, conversations!inner()')
      .eq('role', 'assistant')
      .eq('conversations.user_id', userId)
      .not('simplicity_level', 'is', null);

    const uniqueLevels = new Set(levelsData?.map((m) => m.simplicity_level) || []);

    return {
      totalQuestions: questionsCount || 0,
      uniqueTopics: allTopics.size,
      followUpsUsed: followUpsTotal,
      sharesCount: sharesCount || 0,
      analogyLikes: likesCount || 0,
      voiceUsed: (voiceData?.length || 0) > 0,
      allLevelsUsed: uniqueLevels.size >= 5,
    };
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return {
      totalQuestions: 0,
      uniqueTopics: 0,
      followUpsUsed: 0,
      sharesCount: 0,
      analogyLikes: 0,
      voiceUsed: false,
      allLevelsUsed: false,
    };
  }
}

/**
 * Check all achievement types at once
 */
export async function checkAllAchievements(userId: string): Promise<Achievement[]> {
  const stats = await getUserLearningStats(userId);

  const [learning, social, exploration] = await Promise.all([
    checkLearningAchievements(userId, stats.totalQuestions, stats.followUpsUsed, stats.uniqueTopics),
    checkSocialAchievements(userId, stats.sharesCount, stats.analogyLikes),
    checkExplorationAchievements(userId, stats.voiceUsed, stats.followUpsUsed, stats.allLevelsUsed),
  ]);

  return [...learning, ...social, ...exploration];
}