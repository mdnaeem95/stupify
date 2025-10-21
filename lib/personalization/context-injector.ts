/**
 * Context Injector - Fetches user's learning context for personalized prompts
 * Retrieves knowledge graph, preferences, memories, and related topics
 * 
 * @module lib/personalization/context-injector
 */

import { createClient } from '@/lib/supabase/server';

export interface PersonalizationContext {
  knownTopics: Array<{
    topic: string;
    level: string;
    questionsAsked: number;
  }>;
  learningStyle?: {
    style: string;
    vocabularyLevel: number;
    prefersTechnical: boolean;
    prefersStepByStep: boolean;
  };
  recentStruggles: string[];
  relatedTopics: string[];
  crossConversationMemories: Array<{
    type: string;
    content: string;
    topics: string[];
  }>;
  stats: {
    totalQuestions: number;
    confusionRate: number;
    helpfulRate: number;
  };
}

/**
 * Fetch user's known topics from knowledge graph
 */
async function fetchKnownTopics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  currentTopics: string[]
): Promise<PersonalizationContext['knownTopics']> {
  // Get topics user already knows + current topics
  const topicsToFetch = new Set([...currentTopics]);
  
  // Also fetch user's top 10 most studied topics
  const { data: topTopics } = await supabase
    .from('user_knowledge_graph')
    .select('topic')
    .eq('user_id', userId)
    .order('questions_asked', { ascending: false })
    .limit(10);

  if (topTopics) {
    topTopics.forEach(t => topicsToFetch.add(t.topic));
  }

  // Fetch details for all relevant topics
  const { data } = await supabase
    .from('user_knowledge_graph')
    .select('topic, understanding_level, questions_asked')
    .eq('user_id', userId)
    .in('topic', Array.from(topicsToFetch));

  if (!data) return [];

  return data.map(t => ({
    topic: t.topic,
    level: t.understanding_level,
    questionsAsked: t.questions_asked,
  }));
}

/**
 * Fetch user's learning preferences
 */
async function fetchLearningPreferences(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<PersonalizationContext['learningStyle'] | undefined> {
  const { data } = await supabase
    .from('learning_preferences')
    .select('learning_style, vocabulary_level, prefers_technical_terms, prefers_step_by_step')
    .eq('user_id', userId)
    .single();

  if (!data) return undefined;

  return {
    style: data.learning_style || 'mixed',
    vocabularyLevel: data.vocabulary_level || 5,
    prefersTechnical: data.prefers_technical_terms || false,
    prefersStepByStep: data.prefers_step_by_step || true,
  };
}

/**
 * Fetch topics where user recently struggled (high confusion rate)
 */
async function fetchRecentStruggles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string[]> {
  const { data } = await supabase
    .from('user_knowledge_graph')
    .select('topic, confusion_count, questions_asked')
    .eq('user_id', userId)
    .gte('confusion_count', 1)
    .order('last_asked_at', { ascending: false })
    .limit(5);

  if (!data) return [];

  // Return topics where confusion rate > 30%
  return data
    .filter(t => t.confusion_count / t.questions_asked > 0.3)
    .map(t => t.topic);
}

/**
 * Fetch related topics via topic connections
 */
async function fetchRelatedTopics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  currentTopics: string[]
): Promise<string[]> {
  if (currentTopics.length === 0) return [];

  const relatedSet = new Set<string>();

  for (const topic of currentTopics) {
    // Find topics connected to this one
    const { data } = await supabase
      .from('topic_connections')
      .select('topic_a, topic_b, connection_strength')
      .eq('user_id', userId)
      .or(`topic_a.eq.${topic},topic_b.eq.${topic}`)
      .order('connection_strength', { ascending: false })
      .limit(3);

    if (data) {
      data.forEach(conn => {
        const relatedTopic = conn.topic_a === topic ? conn.topic_b : conn.topic_a;
        relatedSet.add(relatedTopic);
      });
    }
  }

  return Array.from(relatedSet);
}

/**
 * Fetch cross-conversation memories
 */
async function fetchMemories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  currentTopics: string[]
): Promise<PersonalizationContext['crossConversationMemories']> {
  // Fetch memories that overlap with current topics
  const { data } = await supabase
    .from('cross_conversation_memory')
    .select('memory_type, content, topics')
    .eq('user_id', userId)
    .filter('topics', 'ov', currentTopics)
    .order('importance_score', { ascending: false })
    .limit(3);

  if (!data) return [];

  return data.map(m => ({
    type: m.memory_type,
    content: m.content,
    topics: m.topics || [],
  }));
}

/**
 * Fetch user statistics
 */
async function fetchStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<PersonalizationContext['stats']> {
  const { data } = await supabase
    .from('learning_preferences')
    .select('total_questions, total_confusion_events, total_helpful_ratings')
    .eq('user_id', userId)
    .single();

  if (!data) {
    return { totalQuestions: 0, confusionRate: 0, helpfulRate: 0 };
  }

  const confusionRate = data.total_questions > 0
    ? data.total_confusion_events / data.total_questions
    : 0;

  const helpfulRate = data.total_questions > 0
    ? data.total_helpful_ratings / data.total_questions
    : 0;

  return {
    totalQuestions: data.total_questions,
    confusionRate: Math.round(confusionRate * 100) / 100,
    helpfulRate: Math.round(helpfulRate * 100) / 100,
  };
}

/**
 * Main function - fetch all personalization context
 */
export async function getPersonalizationContext(
  userId: string,
  currentTopics: string[]
): Promise<PersonalizationContext> {
  const supabase = await createClient();

  try {
    // Fetch all context in parallel for speed
    const [
      knownTopics,
      learningStyle,
      recentStruggles,
      relatedTopics,
      crossConversationMemories,
      stats,
    ] = await Promise.all([
      fetchKnownTopics(supabase, userId, currentTopics),
      fetchLearningPreferences(supabase, userId),
      fetchRecentStruggles(supabase, userId),
      fetchRelatedTopics(supabase, userId, currentTopics),
      fetchMemories(supabase, userId, currentTopics),
      fetchStats(supabase, userId),
    ]);

    return {
      knownTopics,
      learningStyle,
      recentStruggles,
      relatedTopics,
      crossConversationMemories,
      stats,
    };
  } catch (error) {
    console.error('Failed to fetch personalization context:', error);
    
    // Return empty context on error (graceful degradation)
    return {
      knownTopics: [],
      recentStruggles: [],
      relatedTopics: [],
      crossConversationMemories: [],
      stats: { totalQuestions: 0, confusionRate: 0, helpfulRate: 0 },
    };
  }
}

/**
 * Check if user is new (has no learning history)
 */
export async function isNewUser(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_knowledge_graph')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  return !data || data.length === 0;
}