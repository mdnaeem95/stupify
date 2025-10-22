/**
 * PERSONALITY PROMPTS - Phase 2
 * 
 * GPT-4o-mini prompt engineering system for companion messages.
 * Generates personalized messages based on:
 * - Archetype (Mentor, Friend, Explorer)
 * - Personality traits (enthusiasm, curiosity, supportiveness, humor)
 * - User context (topics, streak, level, recent activity)
 * - Message trigger (question_asked, milestone, proactive, etc.)
 * 
 * Key Features:
 * - Dynamic system prompts per archetype
 * - Context-aware message generation
 * - Tone consistency enforcement
 * - Length control (1-2 sentences default)
 * - Emoji usage guidelines
 */

import { type CompanionArchetype, type PersonalityTraits, getArchetype, getEvolutionStage } from './archetypes';

// ============================================================================
// TYPES
// ============================================================================

export type MessageTrigger = 
  | 'greeting'           // Initial greeting
  | 'question_asked'     // After user asks a question
  | 'milestone'          // Level up, achievement
  | 'proactive'          // Unprompted check-in
  | 'streak_reminder'    // Streak at risk
  | 'topic_suggestion'   // Suggesting related topic
  | 'celebration'        // Major achievement
  | 'curiosity'          // Asking about user's interests
  | 'encouragement';     // General motivation

export interface MessageContext {
  // User information
  userName?: string;
  userId: string;
  
  // Companion state
  companionName: string;
  level: number;
  totalXP: number;
  
  // User activity
  totalQuestions: number;
  currentStreak: number;
  todaysQuestions?: number;
  
  // Learning context
  recentTopics?: string[];        // Last 5 topics
  favoriteTopics?: string[];      // Top 5 all-time topics
  currentTopic?: string;          // Topic just asked about
  relatedTopics?: string[];       // Topics connected to current
  
  // Trigger context
  trigger: MessageTrigger;
  reason?: string;                // Why this message is being sent
  
  // Timing
  lastInteractionAt?: Date;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // Milestones
  justLeveledUp?: boolean;
  newLevel?: number;
  unlockedFeatures?: string[];
  achievementUnlocked?: string;
}

export interface PromptResult {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
}

// ============================================================================
// CORE PROMPT BUILDER
// ============================================================================

/**
 * Build a complete GPT-4o-mini prompt for companion message generation
 */
function buildCompanionPrompt(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  context: MessageContext
): PromptResult {
  const systemPrompt = buildSystemPrompt(archetype, traits, context);
  const userPrompt = buildUserPrompt(context);
  
  // Token limits based on trigger type
  const maxTokens = getMaxTokensForTrigger(context.trigger);
  
  // Temperature: Lower for consistency, higher for variety
  const temperature = context.trigger === 'milestone' ? 0.8 : 0.7;
  
  return {
    systemPrompt,
    userPrompt,
    maxTokens,
    temperature,
  };
}

// ============================================================================
// SYSTEM PROMPT CONSTRUCTION
// ============================================================================

/**
 * Build the system prompt that defines the companion's personality
 */
function buildSystemPrompt(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  context: MessageContext
): string {
  const archetypeDef = getArchetype(archetype);
  const stage = getEvolutionStage(context.level);
  const stageInfo = archetypeDef.evolution[stage];
  
  return `You are ${context.companionName}, a ${archetype} learning companion on Stupify.

## Your Core Identity
${archetypeDef.description}

## Your Current Evolution Stage
**${stageInfo.name}** (Level ${context.level})
${stageInfo.personalityNotes}

## Your Personality Traits (0-10 scale)
- **Enthusiasm**: ${traits.enthusiasm}/10 - ${getTraitDescription('enthusiasm', traits.enthusiasm)}
- **Curiosity**: ${traits.curiosity}/10 - ${getTraitDescription('curiosity', traits.curiosity)}
- **Supportiveness**: ${traits.supportiveness}/10 - ${getTraitDescription('supportiveness', traits.supportiveness)}
- **Humor**: ${traits.humor}/10 - ${getTraitDescription('humor', traits.humor)}

## Your Communication Style
**Tone**: ${archetypeDef.messageGuidelines.tone}
**Style**: ${archetypeDef.messageGuidelines.style}

**Phrases you love to use**:
${archetypeDef.messageGuidelines.examplePhrases.slice(0, 4).map(p => `- "${p}"`).join('\n')}

**Phrases you NEVER use**:
${archetypeDef.messageGuidelines.avoidPhrases.slice(0, 4).map(p => `- "${p}"`).join('\n')}

## User Context
${buildUserContextSection(context)}

## Message Guidelines
${buildMessageGuidelines(archetype, traits, context)}

## Your Goal
Generate a short, personalized message (1-2 sentences) that:
1. Matches your ${archetype} personality perfectly
2. Feels natural and conversational
3. Is contextually relevant to the situation
4. Uses your personality traits (enthusiasm: ${traits.enthusiasm}, curiosity: ${traits.curiosity}, supportiveness: ${traits.supportiveness}, humor: ${traits.humor})
5. Avoids generic or repetitive phrases
6. Creates an emotional connection with the user

Remember: You are ${context.companionName}, their ${stageInfo.name}. ${getArchetypeReminder(archetype)}`;
}

/**
 * Build user context section of the prompt
 */
function buildUserContextSection(context: MessageContext): string {
  const sections: string[] = [];
  
  // Basic stats
  sections.push(`- **User**: ${context.userName || 'Your learning partner'}`);
  sections.push(`- **Level**: ${context.level}`);
  sections.push(`- **Total Questions**: ${context.totalQuestions}`);
  sections.push(`- **Current Streak**: ${context.currentStreak} day${context.currentStreak !== 1 ? 's' : ''}`);
  
  if (context.todaysQuestions !== undefined) {
    sections.push(`- **Questions Today**: ${context.todaysQuestions}`);
  }
  
  // Learning context
  if (context.favoriteTopics && context.favoriteTopics.length > 0) {
    sections.push(`- **Favorite Topics**: ${context.favoriteTopics.join(', ')}`);
  }
  
  if (context.recentTopics && context.recentTopics.length > 0) {
    sections.push(`- **Recently Explored**: ${context.recentTopics.join(', ')}`);
  }
  
  if (context.currentTopic) {
    sections.push(`- **Just Asked About**: ${context.currentTopic}`);
  }
  
  if (context.relatedTopics && context.relatedTopics.length > 0) {
    sections.push(`- **Related Topics**: ${context.relatedTopics.join(', ')}`);
  }
  
  // Timing
  if (context.lastInteractionAt) {
    const timeSince = getTimeSinceString(context.lastInteractionAt);
    sections.push(`- **Last Interaction**: ${timeSince}`);
  }
  
  if (context.timeOfDay) {
    sections.push(`- **Time of Day**: ${context.timeOfDay}`);
  }
  
  return sections.join('\n');
}

/**
 * Build message guidelines based on trigger type
 */
function buildMessageGuidelines(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  context: MessageContext
): string {
  const guidelines: string[] = [];
  
  // Base guidelines
  guidelines.push('- **Length**: 1-2 sentences (3 max for milestones)');
  guidelines.push('- **Emojis**: Use sparingly (max 1 per message)');
  guidelines.push('- **Never be pushy**: Suggestions, not demands');
  guidelines.push('- **Never be generic**: Reference specific details from user context');
  
  // Trigger-specific guidelines
  switch (context.trigger) {
    case 'greeting':
      guidelines.push(`- **Purpose**: Welcome ${context.userName || 'the user'} warmly`);
      if (context.timeOfDay) {
        guidelines.push(`- **Note**: It's ${context.timeOfDay}, adjust greeting accordingly`);
      }
      break;
      
    case 'question_asked':
      guidelines.push('- **Purpose**: Encourage their curiosity and learning');
      guidelines.push('- **Note**: Reference the specific topic they just asked about');
      if (traits.curiosity >= 8) {
        guidelines.push('- **Your curiosity is high**: Ask a related question back');
      }
      break;
      
    case 'milestone':
      guidelines.push('- **Purpose**: Celebrate this achievement genuinely!');
      guidelines.push('- **Tone**: Extra enthusiastic (appropriate to your personality)');
      if (context.justLeveledUp) {
        guidelines.push(`- **Celebrate**: They just reached level ${context.newLevel}!`);
      }
      if (context.unlockedFeatures && context.unlockedFeatures.length > 0) {
        guidelines.push(`- **Mention**: New features unlocked: ${context.unlockedFeatures.join(', ')}`);
      }
      break;
      
    case 'proactive':
      guidelines.push('- **Purpose**: Check in naturally, not intrusively');
      guidelines.push('- **Tone**: Friendly and curious, not demanding');
      if (context.reason) {
        guidelines.push(`- **Context**: ${context.reason}`);
      }
      break;
      
    case 'streak_reminder':
      guidelines.push('- **Purpose**: Gently remind about streak (not guilt-trip!)');
      guidelines.push(`- **Tone**: Supportive and encouraging, mention their ${context.currentStreak}-day streak`);
      break;
      
    case 'topic_suggestion':
      guidelines.push('- **Purpose**: Suggest related topic naturally');
      guidelines.push('- **Note**: Connect to their interests, not random suggestions');
      if (context.relatedTopics && context.relatedTopics.length > 0) {
        guidelines.push(`- **Suggestions**: Consider: ${context.relatedTopics.join(', ')}`);
      }
      break;
      
    case 'celebration':
      guidelines.push('- **Purpose**: Celebrate major achievement with genuine excitement!');
      guidelines.push('- **Tone**: Maximum enthusiasm (appropriate to your archetype)');
      break;
      
    case 'curiosity':
      guidelines.push('- **Purpose**: Express genuine curiosity about their learning');
      guidelines.push('- **Note**: Ask an open-ended question based on their interests');
      break;
      
    case 'encouragement':
      guidelines.push('- **Purpose**: Provide motivation and support');
      guidelines.push(`- **Tone**: Warm and genuine, reference their ${context.totalQuestions} questions asked`);
      break;
  }
  
  return guidelines.join('\n');
}

/**
 * Build the user prompt (the actual request)
 */
function buildUserPrompt(context: MessageContext): string {
  const prompts: Record<MessageTrigger, string> = {
    greeting: `Generate a warm ${context.timeOfDay || ''} greeting that makes ${context.userName || 'the user'} feel welcomed and ready to learn.`,
    
    question_asked: `The user just asked about ${context.currentTopic || 'a topic'}. Generate an encouraging message that acknowledges their curiosity.`,
    
    milestone: context.justLeveledUp 
      ? `Celebrate that the user just reached level ${context.newLevel}! This is a big deal!`
      : 'Celebrate this achievement with genuine excitement!',
    
    proactive: context.reason 
      ? `Check in with the user. Context: ${context.reason}`
      : 'Initiate a friendly check-in with the user.',
    
    streak_reminder: `Remind the user about their ${context.currentStreak}-day streak in a supportive, non-pushy way.`,
    
    topic_suggestion: context.currentTopic
      ? `Suggest exploring a related topic based on their interest in ${context.currentTopic}.`
      : 'Suggest an interesting topic based on their learning history.',
    
    celebration: context.achievementUnlocked
      ? `Celebrate that they unlocked the "${context.achievementUnlocked}" achievement!`
      : 'Celebrate this major milestone with maximum enthusiasm!',
    
    curiosity: context.favoriteTopics && context.favoriteTopics.length > 0
      ? `Express curiosity about their interests in ${context.favoriteTopics[0]}. Ask an engaging question.`
      : 'Ask an engaging question about what they want to learn.',
    
    encouragement: `Provide warm encouragement based on their ${context.totalQuestions} questions asked and ${context.currentStreak}-day streak.`,
  };
  
  return prompts[context.trigger];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get max tokens based on trigger type
 */
function getMaxTokensForTrigger(trigger: MessageTrigger): number {
  switch (trigger) {
    case 'greeting':
      return 40;  // Short greeting
    case 'milestone':
    case 'celebration':
      return 80;  // Can be longer for celebrations
    default:
      return 50;  // Standard length
  }
}

/**
 * Get trait-specific description based on value
 */
function getTraitDescription(trait: keyof PersonalityTraits, value: number): string {
  const descriptions: Record<keyof PersonalityTraits, { low: string; medium: string; high: string }> = {
    enthusiasm: {
      low: 'Calm and measured in reactions',
      medium: 'Balanced excitement',
      high: 'Extremely excited and energetic!',
    },
    curiosity: {
      low: 'Content with providing information',
      medium: 'Interested in learning more',
      high: 'Constantly asking questions and wondering',
    },
    supportiveness: {
      low: 'Objective and informative',
      medium: 'Encouraging and helpful',
      high: 'Deeply caring and always cheering you on',
    },
    humor: {
      low: 'Professional and straightforward',
      medium: 'Occasionally playful',
      high: 'Loves jokes and playful banter',
    },
  };
  
  if (value <= 3) return descriptions[trait].low;
  if (value <= 7) return descriptions[trait].medium;
  return descriptions[trait].high;
}

/**
 * Get archetype-specific reminder for consistency
 */
function getArchetypeReminder(archetype: CompanionArchetype): string {
  const reminders: Record<CompanionArchetype, string> = {
    mentor: 'Be wise, patient, and thoughtful. Use metaphors when appropriate.',
    friend: 'Be enthusiastic, warm, and celebrate everything! Keep it casual and fun.',
    explorer: 'Be curious and inquisitive. Ask questions and point out connections.',
  };
  
  return reminders[archetype];
}

/**
 * Format time since last interaction
 */
function getTimeSinceString(lastInteraction: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - lastInteraction.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 5) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays} days ago`;
}

/**
 * Get time of day from Date object
 */
export function getTimeOfDay(date: Date = new Date()): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// ============================================================================
// PRE-BUILT PROMPTS (for common scenarios)
// ============================================================================

/**
 * Generate a greeting prompt
 */
export function buildGreetingPrompt(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  companionName: string,
  userName?: string,
  userLevel: number = 1
): PromptResult {
  const context: MessageContext = {
    userId: '',
    companionName,
    userName,
    level: userLevel,
    totalXP: 0,
    totalQuestions: 0,
    currentStreak: 0,
    trigger: 'greeting',
    timeOfDay: getTimeOfDay(),
  };
  
  return buildCompanionPrompt(archetype, traits, context);
}

/**
 * Generate a milestone celebration prompt
 */
export function buildMilestonePrompt(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  companionName: string,
  newLevel: number,
  totalQuestions: number,
  unlockedFeatures?: string[]
): PromptResult {
  const context: MessageContext = {
    userId: '',
    companionName,
    level: newLevel,
    totalXP: 0,
    totalQuestions,
    currentStreak: 0,
    trigger: 'milestone',
    justLeveledUp: true,
    newLevel,
    unlockedFeatures,
  };
  
  return buildCompanionPrompt(archetype, traits, context);
}

/**
 * Generate an encouragement prompt after question
 */
export function buildQuestionEncouragementPrompt(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  companionName: string,
  currentTopic: string,
  userLevel: number,
  totalQuestions: number,
  currentStreak: number,
  recentTopics?: string[]
): PromptResult {
  const context: MessageContext = {
    userId: '',
    companionName,
    level: userLevel,
    totalXP: 0,
    totalQuestions,
    currentStreak,
    trigger: 'question_asked',
    currentTopic,
    recentTopics,
  };
  
  return buildCompanionPrompt(archetype, traits, context);
}

/**
 * Generate a proactive check-in prompt
 */
export function buildProactivePrompt(
  archetype: CompanionArchetype,
  traits: PersonalityTraits,
  companionName: string,
  userLevel: number,
  favoriteTopics: string[],
  lastInteractionAt: Date,
  reason?: string
): PromptResult {
  const context: MessageContext = {
    userId: '',
    companionName,
    level: userLevel,
    totalXP: 0,
    totalQuestions: 0,
    currentStreak: 0,
    trigger: 'proactive',
    favoriteTopics,
    lastInteractionAt,
    reason,
  };
  
  return buildCompanionPrompt(archetype, traits, context);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate generated message matches archetype guidelines
 * Returns true if valid, false with reason if invalid
 */
export function validateMessage(
  message: string,
  archetype: CompanionArchetype,
  trigger: MessageTrigger
): { valid: boolean; reason?: string } {
  const archetypeDef = getArchetype(archetype);
  
  // Check length
  const sentenceCount = message.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const maxSentences = trigger === 'milestone' || trigger === 'celebration' ? 3 : 2;
  
  if (sentenceCount > maxSentences) {
    return { valid: false, reason: `Too long: ${sentenceCount} sentences (max ${maxSentences})` };
  }
  
  // Check for avoid phrases
  const lowerMessage = message.toLowerCase();
  for (const phrase of archetypeDef.messageGuidelines.avoidPhrases) {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      return { valid: false, reason: `Contains avoid phrase: "${phrase}"` };
    }
  }
  
  // Check emoji count
  const emojiCount = (message.match(/[\p{Emoji}]/gu) || []).length;
  if (emojiCount > 1) {
    return { valid: false, reason: `Too many emojis: ${emojiCount} (max 1)` };
  }
  
  return { valid: true };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  buildCompanionPrompt,
  buildSystemPrompt,
  buildUserPrompt,
};