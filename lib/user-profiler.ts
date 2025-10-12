/* eslint-disable  @typescript-eslint/no-explicit-any */
import { SimplicityLevel } from './prompts-v2';

/**
 * USER PERSONALIZATION ENGINE
 * Tracks user knowledge and adapts responses
 */

export interface UserProfile {
  userId: string;
  preferredLevel: SimplicityLevel | null;
  knownTopics: string[];
  vocabularyLevel: number; // 1-10
  totalQuestions: number;
  averageSessionLength: number;
  lastActiveAt: string;
}

export interface TopicKnowledge {
  topic: string;
  questionsAsked: number;
  lastAskedAt: string;
  understandingLevel: number; // 1-10
}

/**
 * Detect preferred complexity level from usage patterns
 */
export function detectPreferredLevel(history: {
  level: SimplicityLevel;
  timestamp: string;
}[]): SimplicityLevel | null {
  if (history.length < 3) return null;

  // Count usage in last 7 days
  const recent = history.filter(h => {
    const daysSince = (Date.now() - new Date(h.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });

  if (recent.length === 0) return null;

  // Find most used level
  const counts: Record<SimplicityLevel, number> = {
    '5yo': 0,
    'normal': 0,
    'advanced': 0
  };

  recent.forEach(h => counts[h.level]++);

  const max = Math.max(counts['5yo'], counts.normal, counts.advanced);
  
  if (counts['5yo'] === max) return '5yo';
  if (counts.advanced === max) return 'advanced';
  return 'normal';
}

/**
 * Extract topics from user questions
 */
export function extractTopics(question: string): string[] {
  const stopWords = new Set([
    'what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'does', 
    'do', 'can', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
    'to', 'for', 'of', 'with', 'by', 'from', 'as', 'that', 'this', 'it'
  ]);

  const words = question
    .toLowerCase()
    .replace(/[?.!,]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Return unique words as topics
  return [...new Set(words)].slice(0, 5);
}

/**
 * Calculate understanding level from confusion signals
 */
export function calculateUnderstanding(
  questionsAsked: number,
  confusionCount: number,
  positiveRatings: number,
  totalRatings: number
): number {
  // More questions = better understanding
  const questionScore = Math.min(questionsAsked / 5, 3);
  
  // Fewer confusions = better understanding
  const confusionScore = Math.max(3 - confusionCount, 0);
  
  // Higher rating percentage = better understanding
  const ratingScore = totalRatings > 0 
    ? (positiveRatings / totalRatings) * 4 
    : 2;

  const total = questionScore + confusionScore + ratingScore;
  return Math.min(Math.round(total), 10);
}

/**
 * Get personalized greeting based on profile
 */
export function getPersonalizedGreeting(profile: UserProfile): string {
  const { knownTopics, totalQuestions, preferredLevel } = profile;

  if (totalQuestions === 0) {
    return "Hey! I'm Blinky 👋 Ask me anything and I'll explain it in a way that actually makes sense";
  }

  const levelText = preferredLevel === '5yo' 
    ? 'super simple' 
    : preferredLevel === 'advanced' 
    ? 'in depth' 
    : 'clearly';

  if (knownTopics.length > 0) {
    const randomTopic = knownTopics[Math.floor(Math.random() * knownTopics.length)];
    return `Welcome back! Ready to explore more about ${randomTopic}, or dive into something new? I'll explain it ${levelText} 🎯`;
  }

  return `Welcome back! What are you curious about today? I'll explain it ${levelText} ✨`;
}

/**
 * Get personalized analogy based on known topics
 */
export function getPersonalizedAnalogyPrompt(
  profile: UserProfile,
  currentTopic: string
): string {
  const { knownTopics } = profile;
  
  if (knownTopics.length === 0) {
    return '';
  }

  // Find related known topics
  const relatedTopics = knownTopics
    .filter(t => t !== currentTopic)
    .slice(0, 3);

  if (relatedTopics.length === 0) {
    return '';
  }

  return `\n\nPersonalization Note: The user already knows about: ${relatedTopics.join(', ')}. When possible, use these topics in your analogies to build on their existing knowledge.`;
}

/**
 * Suggest next complexity level based on performance
 */
export function suggestLevelAdjustment(
  currentLevel: SimplicityLevel,
  understandingScore: number, // 1-10
  questionsInSession: number
): {
  shouldAdjust: boolean;
  newLevel: SimplicityLevel | null;
  reason: string;
} {
  // Don't adjust too early
  if (questionsInSession < 5) {
    return { shouldAdjust: false, newLevel: null, reason: '' };
  }

  // High understanding - suggest upgrade
  if (understandingScore >= 8 && currentLevel !== 'advanced') {
    const newLevel = currentLevel === '5yo' ? 'normal' : 'advanced';
    return {
      shouldAdjust: true,
      newLevel,
      reason: "You're doing great! Want to try more detailed explanations?"
    };
  }

  // Low understanding - suggest downgrade
  if (understandingScore <= 3 && currentLevel !== '5yo') {
    const newLevel = currentLevel === 'advanced' ? 'normal' : '5yo';
    return {
      shouldAdjust: true,
      newLevel,
      reason: "Would you like me to simplify my explanations?"
    };
  }

  return { shouldAdjust: false, newLevel: null, reason: '' };
}

/**
 * Track user activity for profile updates
 */
export interface ActivityEvent {
  type: 'question' | 'confusion' | 'rating' | 'level_change';
  timestamp: string;
  metadata: Record<string, any>;
}

export function updateProfileFromActivity(
  profile: UserProfile,
  events: ActivityEvent[]
): Partial<UserProfile> {
  const updates: Partial<UserProfile> = {};

  // Count questions
  const questionEvents = events.filter(e => e.type === 'question');
  if (questionEvents.length > 0) {
    updates.totalQuestions = profile.totalQuestions + questionEvents.length;
    updates.lastActiveAt = new Date().toISOString();
  }

  // Extract new topics
  const newTopics = questionEvents
    .flatMap(e => extractTopics(e.metadata.question || ''))
    .filter(t => !profile.knownTopics.includes(t));
  
  if (newTopics.length > 0) {
    updates.knownTopics = [...new Set([...profile.knownTopics, ...newTopics])];
  }

  // Track level changes
  const levelEvents = events.filter(e => e.type === 'level_change');
  if (levelEvents.length > 0) {
    const lastLevel = levelEvents[levelEvents.length - 1].metadata.level;
    updates.preferredLevel = lastLevel;
  }

  return updates;
}