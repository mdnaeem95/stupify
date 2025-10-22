import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SimplicityLevel } from '@/lib/prompts/prompts';
import {
  extractTopics,
  getPersonalizedGreeting,
  suggestLevelAdjustment,
  type UserProfile,
} from '@/lib/personalization/user-profiler';

export function useUserProfile(currentLevel: SimplicityLevel) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [questionsThisSession, setQuestionsThisSession] = useState(0);
  const [showLevelSuggestion, setShowLevelSuggestion] = useState(false);
  const [suggestedLevel, setSuggestedLevel] = useState<SimplicityLevel | null>(null);

  // Load user profile from database
  const loadProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get known topics
      const { data: knowledgeData } = await supabase
        .from('user_knowledge_graph')
        .select('topic, questions_asked, understanding_level')
        .eq('user_id', user.id)
        .order('questions_asked', { ascending: false })
        .limit(10);

      // Get total questions
      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id);

      const totalQuestions = convos?.length || 0;
      const knownTopics = knowledgeData?.map(k => k.topic) || [];

      setUserProfile({
        userId: user.id,
        preferredLevel: currentLevel,
        knownTopics,
        vocabularyLevel: 5,
        totalQuestions,
        averageSessionLength: 0,
        lastActiveAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, [currentLevel]);

  // Track a question and update knowledge graph
  const trackQuestion = useCallback(async (question: string, level: SimplicityLevel) => {
    if (!userProfile) return;

    const topics = extractTopics(question);
    const supabase = createClient();

    // Update or insert topics
    for (const topic of topics) {
      await supabase.rpc('upsert_user_knowledge', {
        p_user_id: userProfile.userId,
        p_topic: topic,
      });
    }

    // Update session count
    setQuestionsThisSession(prev => prev + 1);

    // Check if we should suggest level change
    if (questionsThisSession >= 5) {
      const avgUnderstanding = 7; // TODO: Calculate from knowledge graph
      const suggestion = suggestLevelAdjustment(level, avgUnderstanding, questionsThisSession);

      if (suggestion.shouldAdjust) {
        setSuggestedLevel(suggestion.newLevel);
        setShowLevelSuggestion(true);
      }
    }
  }, [userProfile, questionsThisSession]);

  // Get personalized greeting
  const getGreeting = useCallback(() => {
    if (!userProfile) return null;
    return getPersonalizedGreeting(userProfile);
  }, [userProfile]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    userProfile,
    questionsThisSession,
    showLevelSuggestion,
    suggestedLevel,
    setShowLevelSuggestion,
    trackQuestion,
    getGreeting,
  };
}