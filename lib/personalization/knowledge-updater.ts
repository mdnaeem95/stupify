/**
 * Knowledge Updater - Updates user's knowledge graph after each question
 * Tracks topic mastery, learning preferences, and topic connections
 * 
 * @module lib/personalization/knowledge-updater
 */

import { createClient } from '@/lib/supabase/server';

type UnderstandingLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface KnowledgeUpdate {
  userId: string;
  topics: string[];
  conversationId: string;
  question: string;
  wasConfused?: boolean;
  analogyHelpful?: boolean;
}

/**
 * Determine understanding level based on question count
 */
function inferUnderstandingLevel(questionsAsked: number): UnderstandingLevel {
  if (questionsAsked <= 2) return 'beginner';
  if (questionsAsked <= 5) return 'intermediate';
  if (questionsAsked <= 10) return 'advanced';
  return 'expert';
}

/**
 * Update knowledge graph for a single topic
 */
async function updateTopicKnowledge(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topic: string,
  conversationId: string,
  question: string,
  wasConfused: boolean = false,
  analogyHelpful: boolean = false
) {
  // Upsert topic in knowledge graph
  const { data: existing } = await supabase
    .from('user_knowledge_graph')
    .select('questions_asked, correct_analogies, confusion_count')
    .eq('user_id', userId)
    .eq('topic', topic)
    .single();

  const questionsAsked = (existing?.questions_asked || 0) + 1;
  const correctAnalogies = (existing?.correct_analogies || 0) + (analogyHelpful ? 1 : 0);
  const confusionCount = (existing?.confusion_count || 0) + (wasConfused ? 1 : 0);
  const understandingLevel = inferUnderstandingLevel(questionsAsked);

  await supabase
    .from('user_knowledge_graph')
    .upsert({
      user_id: userId,
      topic,
      understanding_level: understandingLevel,
      questions_asked: questionsAsked,
      correct_analogies: correctAnalogies,
      confusion_count: confusionCount,
      last_question: question,
      last_asked_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,topic'
    });
}

/**
 * Create topic connections when multiple topics appear together
 */
async function updateTopicConnections(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  topics: string[],
  conversationId: string
) {
  if (topics.length < 2) return;

  // Create connections between all topic pairs
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const [topicA, topicB] = [topics[i], topics[j]].sort();

      // Check if connection exists
      const { data: existing } = await supabase
        .from('topic_connections')
        .select('connection_strength')
        .eq('user_id', userId)
        .eq('topic_a', topicA)
        .eq('topic_b', topicB)
        .single();

      const newStrength = (existing?.connection_strength || 0) + 1;

      await supabase
        .from('topic_connections')
        .upsert({
          user_id: userId,
          topic_a: topicA,
          topic_b: topicB,
          connection_strength: newStrength,
          discovered_in_conversation_id: conversationId,
        }, {
          onConflict: 'user_id,topic_a,topic_b'
        });
    }
  }
}

/**
 * Update learning preferences based on interaction patterns
 */
async function updateLearningPreferences(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  wasConfused: boolean = false,
  analogyHelpful: boolean = false
) {
  // Get or create preferences
  const { data: prefs } = await supabase
    .from('learning_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  const totalQuestions = (prefs?.total_questions || 0) + 1;
  const totalConfusion = (prefs?.total_confusion_events || 0) + (wasConfused ? 1 : 0);
  const totalHelpful = (prefs?.total_helpful_ratings || 0) + (analogyHelpful ? 1 : 0);

  await supabase
    .from('learning_preferences')
    .upsert({
      user_id: userId,
      total_questions: totalQuestions,
      total_confusion_events: totalConfusion,
      total_helpful_ratings: totalHelpful,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });
}

/**
 * Main update function - call this after each user question
 */
export async function updateKnowledgeGraph({
  userId,
  topics,
  conversationId,
  question,
  wasConfused = false,
  analogyHelpful = false,
}: KnowledgeUpdate): Promise<void> {
  const supabase = await createClient();

  try {
    // Update each topic in parallel
    await Promise.all(
      topics.map(topic =>
        updateTopicKnowledge(
          supabase,
          userId,
          topic,
          conversationId,
          question,
          wasConfused,
          analogyHelpful
        )
      )
    );

    // Update topic connections
    await updateTopicConnections(supabase, userId, topics, conversationId);

    // Update learning preferences
    await updateLearningPreferences(supabase, userId, wasConfused, analogyHelpful);

  } catch (error) {
    console.error('Failed to update knowledge graph:', error);
    // Don't throw - knowledge graph update is non-critical
  }
}

/**
 * Get user's topic mastery level (for UI display)
 */
export async function getTopicMastery(
  userId: string,
  topic: string
): Promise<{ level: UnderstandingLevel; questionsAsked: number } | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_knowledge_graph')
    .select('understanding_level, questions_asked')
    .eq('user_id', userId)
    .eq('topic', topic)
    .single();

  if (!data) return null;

  return {
    level: data.understanding_level as UnderstandingLevel,
    questionsAsked: data.questions_asked,
  };
}

/**
 * Get all topics user has explored (for dashboard)
 */
export async function getUserTopics(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_knowledge_graph')
    .select('topic, understanding_level, questions_asked, last_asked_at')
    .eq('user_id', userId)
    .order('questions_asked', { ascending: false });

  return data || [];
}