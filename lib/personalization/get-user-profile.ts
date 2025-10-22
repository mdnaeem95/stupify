import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from './user-profiler';

/**
 * Get user profile with knowledge graph
 * Use this in API routes
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();

    // Get knowledge graph
    const { data: knowledge } = await supabase
      .from('user_knowledge_graph')
      .select('topic, questions_asked, understanding_level')
      .eq('user_id', userId)
      .order('questions_asked', { ascending: false })
      .limit(10);

    // Get total conversations
    const { count: totalConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const knownTopics = knowledge?.map(k => k.topic) || [];

    return {
      userId,
      preferredLevel: null, // Will be set based on recent usage
      knownTopics,
      vocabularyLevel: 5,
      totalQuestions: totalConversations || 0,
      averageSessionLength: 0,
      lastActiveAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}