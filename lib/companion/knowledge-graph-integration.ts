/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * KNOWLEDGE GRAPH INTEGRATION - Phase 2, Day 12
 * 
 * Connects companion messages to user's learning patterns and topics.
 * Uses existing user_knowledge_graph table for personalization.
 * 
 * Features:
 * - Extract favorite topics from knowledge graph
 * - Detect related topics for suggestions
 * - Track learning patterns
 * - Build context-aware message triggers
 * - Interest-based message generation
 */

import { createClient } from '@/lib/supabase/server';
import { type MessageContext } from './personality-prompts';

// ============================================================================
// TYPES
// ============================================================================

export interface UserKnowledge {
  topic: string;
  understanding_level: 'beginner' | 'intermediate' | 'advanced' | null;
  questions_asked: number;
  confusion_count: number;
  last_asked_at: Date;
  preferred_analogies?: string[];
}

export interface TopicInsight {
  topic: string;
  questionsAsked: number;
  lastAsked: Date;
  understandingLevel: string;
  relatedTopics: string[];
}

export interface LearningPattern {
  favoriteTopics: string[]; // Top 5 most asked topics
  recentTopics: string[]; // Last 10 topics
  strugglingTopics: string[]; // High confusion count
  masteredTopics: string[]; // Advanced level
  totalTopics: number;
  averageQuestionsPerTopic: number;
  learningStyle?: 'visual' | 'practical' | 'theoretical';
}

export interface TopicSuggestion {
  topic: string;
  reason: string;
  confidence: number; // 0-1
  relatedTo: string[]; // Related known topics
}

// ============================================================================
// KNOWLEDGE GRAPH QUERIES
// ============================================================================

/**
 * Get user's favorite topics (most asked)
 */
export async function getFavoriteTopics(
  userId: string,
  limit: number = 5
): Promise<TopicInsight[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_knowledge_graph')
      .select('*')
      .eq('user_id', userId)
      .order('questions_asked', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[KNOWLEDGE] Error fetching favorite topics:', error);
      return [];
    }
    
    return (data || []).map(row => ({
      topic: row.topic,
      questionsAsked: row.questions_asked,
      lastAsked: new Date(row.last_asked_at),
      understandingLevel: row.understanding_level || 'beginner',
      relatedTopics: row.related_topics || [],
    }));
  } catch (error) {
    console.error('[KNOWLEDGE] Error in getFavoriteTopics:', error);
    return [];
  }
}

/**
 * Get recent topics (last 10 asked)
 */
export async function getRecentTopics(
  userId: string,
  limit: number = 10
): Promise<string[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_knowledge_graph')
      .select('topic, last_asked_at')
      .eq('user_id', userId)
      .order('last_asked_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[KNOWLEDGE] Error fetching recent topics:', error);
      return [];
    }
    
    return (data || []).map(row => row.topic);
  } catch (error) {
    console.error('[KNOWLEDGE] Error in getRecentTopics:', error);
    return [];
  }
}

/**
 * Get topics user is struggling with (high confusion count)
 */
export async function getStrugglingTopics(
  userId: string,
  minConfusion: number = 2
): Promise<TopicInsight[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_knowledge_graph')
      .select('*')
      .eq('user_id', userId)
      .gte('confusion_count', minConfusion)
      .order('confusion_count', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('[KNOWLEDGE] Error fetching struggling topics:', error);
      return [];
    }
    
    return (data || []).map(row => ({
      topic: row.topic,
      questionsAsked: row.questions_asked,
      lastAsked: new Date(row.last_asked_at),
      understandingLevel: row.understanding_level || 'beginner',
      relatedTopics: row.related_topics || [],
    }));
  } catch (error) {
    console.error('[KNOWLEDGE] Error in getStrugglingTopics:', error);
    return [];
  }
}

/**
 * Get topics user has mastered (advanced level)
 */
export async function getMasteredTopics(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_knowledge_graph')
      .select('topic')
      .eq('user_id', userId)
      .eq('understanding_level', 'advanced')
      .order('questions_asked', { ascending: false });
    
    if (error) {
      console.error('[KNOWLEDGE] Error fetching mastered topics:', error);
      return [];
    }
    
    return (data || []).map(row => row.topic);
  } catch (error) {
    console.error('[KNOWLEDGE] Error in getMasteredTopics:', error);
    return [];
  }
}

/**
 * Get complete learning pattern for user
 */
export async function getLearningPattern(userId: string): Promise<LearningPattern> {
  try {
    const supabase = await createClient();
    
    // Get all topics
    const { data: allTopics, error: topicsError } = await supabase
      .from('user_knowledge_graph')
      .select('*')
      .eq('user_id', userId);
    
    if (topicsError) {
      console.error('[KNOWLEDGE] Error fetching learning pattern:', topicsError);
      return getEmptyLearningPattern();
    }
    
    if (!allTopics || allTopics.length === 0) {
      return getEmptyLearningPattern();
    }
    
    // Get learning preferences
    const { data: prefs } = await supabase
      .from('learning_preferences')
      .select('learning_style, prefers_visual, prefers_practical, prefers_theoretical')
      .eq('user_id', userId)
      .single();
    
    // Calculate patterns
    const favoriteTopics = allTopics
      .sort((a, b) => b.questions_asked - a.questions_asked)
      .slice(0, 5)
      .map(t => t.topic);
    
    const recentTopics = allTopics
      .sort((a, b) => new Date(b.last_asked_at).getTime() - new Date(a.last_asked_at).getTime())
      .slice(0, 10)
      .map(t => t.topic);
    
    const strugglingTopics = allTopics
      .filter(t => (t.confusion_count || 0) >= 2)
      .sort((a, b) => (b.confusion_count || 0) - (a.confusion_count || 0))
      .slice(0, 5)
      .map(t => t.topic);
    
    const masteredTopics = allTopics
      .filter(t => t.understanding_level === 'advanced')
      .map(t => t.topic);
    
    const totalQuestions = allTopics.reduce((sum, t) => sum + t.questions_asked, 0);
    const averageQuestionsPerTopic = totalQuestions / allTopics.length;
    
    // Determine learning style
    let learningStyle: 'visual' | 'practical' | 'theoretical' | undefined;
    if (prefs) {
      if (prefs.prefers_visual) learningStyle = 'visual';
      else if (prefs.prefers_practical) learningStyle = 'practical';
      else if (prefs.prefers_theoretical) learningStyle = 'theoretical';
      else learningStyle = prefs.learning_style as any;
    }
    
    return {
      favoriteTopics,
      recentTopics,
      strugglingTopics,
      masteredTopics,
      totalTopics: allTopics.length,
      averageQuestionsPerTopic,
      learningStyle,
    };
  } catch (error) {
    console.error('[KNOWLEDGE] Error in getLearningPattern:', error);
    return getEmptyLearningPattern();
  }
}

/**
 * Find related topics based on user's knowledge
 */
export async function findRelatedTopics(
  userId: string,
  currentTopic: string,
  limit: number = 3
): Promise<TopicSuggestion[]> {
  try {
    const supabase = await createClient();
    
    // Get current topic from knowledge graph
    const { data: currentKnowledge } = await supabase
      .from('user_knowledge_graph')
      .select('related_topics')
      .eq('user_id', userId)
      .eq('topic', currentTopic)
      .single();
    
    if (!currentKnowledge || !currentKnowledge.related_topics) {
      return [];
    }
    
    // Get details about related topics
    const relatedTopics = currentKnowledge.related_topics as string[];
    
    const { data: relatedKnowledge } = await supabase
      .from('user_knowledge_graph')
      .select('topic, questions_asked, understanding_level')
      .eq('user_id', userId)
      .in('topic', relatedTopics)
      .limit(limit);
    
    if (!relatedKnowledge) {
      return relatedTopics.slice(0, limit).map(topic => ({
        topic,
        reason: `Related to ${currentTopic}`,
        confidence: 0.5,
        relatedTo: [currentTopic],
      }));
    }
    
    return relatedKnowledge.map(t => ({
      topic: t.topic,
      reason: `Related to ${currentTopic}`,
      confidence: 0.7 + (t.questions_asked * 0.05), // Higher confidence if asked more
      relatedTo: [currentTopic],
    }));
  } catch (error) {
    console.error('[KNOWLEDGE] Error in findRelatedTopics:', error);
    return [];
  }
}

/**
 * Suggest new topics based on user's learning pattern
 */
export async function suggestNewTopics(
  userId: string,
  limit: number = 3
): Promise<TopicSuggestion[]> {
  const pattern = await getLearningPattern(userId);
  
  if (pattern.favoriteTopics.length === 0) {
    return [];
  }
  
  // Simple heuristic: suggest topics related to favorites
  const suggestions: TopicSuggestion[] = [];
  
  for (const favTopic of pattern.favoriteTopics.slice(0, 2)) {
    const related = await findRelatedTopics(userId, favTopic, 2);
    suggestions.push(...related);
  }
  
  // Deduplicate and limit
  const unique = suggestions.filter(
    (s, i, arr) => arr.findIndex(x => x.topic === s.topic) === i
  );
  
  return unique.slice(0, limit);
}

// ============================================================================
// MESSAGE CONTEXT BUILDERS
// ============================================================================

/**
 * Build message context enriched with knowledge graph data
 */
export async function buildEnrichedContext(
  baseContext: Partial<MessageContext>,
  userId: string
): Promise<MessageContext> {
  const pattern = await getLearningPattern(userId);
  
  return {
    ...baseContext,
    userId,
    companionName: baseContext.companionName || 'Companion',
    level: baseContext.level || 1,
    totalXP: baseContext.totalXP || 0,
    totalQuestions: baseContext.totalQuestions || 0,
    currentStreak: baseContext.currentStreak || 0,
    trigger: baseContext.trigger || 'proactive',
    favoriteTopics: pattern.favoriteTopics,
    recentTopics: pattern.recentTopics,
    currentTopic: baseContext.currentTopic,
  } as MessageContext;
}

/**
 * Get topic-based encouragement context
 */
export async function getTopicEncouragementContext(
  userId: string,
  currentTopic?: string
): Promise<Partial<MessageContext>> {
  const pattern = await getLearningPattern(userId);
  
  let reason: string;
  
  if (currentTopic && pattern.strugglingTopics.includes(currentTopic)) {
    reason = 'User struggling with this topic - provide encouragement';
  } else if (currentTopic && pattern.masteredTopics.includes(currentTopic)) {
    reason = 'User mastered this topic - celebrate achievement';
  } else if (currentTopic) {
    reason = 'User learning new topic - provide guidance';
  } else {
    reason = 'General encouragement based on learning pattern';
  }
  
  return {
    favoriteTopics: pattern.favoriteTopics,
    recentTopics: pattern.recentTopics,
    currentTopic,
    reason,
  };
}

/**
 * Get topic suggestion context
 */
export async function getTopicSuggestionContext(
  userId: string
): Promise<Partial<MessageContext>> {
  const suggestions = await suggestNewTopics(userId, 3);
  const pattern = await getLearningPattern(userId);
  
  return {
    favoriteTopics: pattern.favoriteTopics,
    recentTopics: pattern.recentTopics,
    reason: suggestions.length > 0
      ? `Suggest related topics: ${suggestions.map(s => s.topic).join(', ')}`
      : 'Encourage user to explore new topics',
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function getEmptyLearningPattern(): LearningPattern {
  return {
    favoriteTopics: [],
    recentTopics: [],
    strugglingTopics: [],
    masteredTopics: [],
    totalTopics: 0,
    averageQuestionsPerTopic: 0,
  };
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get knowledge graph statistics for user
 */
export async function getKnowledgeGraphStats(userId: string): Promise<{
  totalTopics: number;
  totalQuestions: number;
  advancedTopics: number;
  recentlyActive: number; // Topics asked in last 7 days
  averageConfidence: number;
}> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_knowledge_graph')
      .select('*')
      .eq('user_id', userId);
    
    if (error || !data) {
      return {
        totalTopics: 0,
        totalQuestions: 0,
        advancedTopics: 0,
        recentlyActive: 0,
        averageConfidence: 0,
      };
    }
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      totalTopics: data.length,
      totalQuestions: data.reduce((sum, t) => sum + t.questions_asked, 0),
      advancedTopics: data.filter(t => t.understanding_level === 'advanced').length,
      recentlyActive: data.filter(t => new Date(t.last_asked_at) > sevenDaysAgo).length,
      averageConfidence: data.length > 0
        ? data.reduce((sum, t) => sum + (t.questions_asked / 10), 0) / data.length
        : 0,
    };
  } catch (error) {
    console.error('[KNOWLEDGE] Error in getKnowledgeGraphStats:', error);
    return {
      totalTopics: 0,
      totalQuestions: 0,
      advancedTopics: 0,
      recentlyActive: 0,
      averageConfidence: 0,
    };
  }
}