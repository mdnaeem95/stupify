/**
 * Personalized Prompts - Injects user context into AI system prompts
 * Creates customized prompts based on knowledge graph and learning preferences
 * 
 * @module lib/personalization/personalized-prompts
 */

import { PersonalizationContext } from './context-injector';

/**
 * Build personalization section for system prompt
 */
function buildPersonalizationSection(context: PersonalizationContext): string {
  const sections: string[] = [];

  // 1. Known Topics
  if (context.knownTopics.length > 0) {
    const topicList = context.knownTopics
      .map(t => `- ${t.topic} (${t.level}, ${t.questionsAsked} questions)`)
      .join('\n');
    
    sections.push(`**Topics the user has studied:**
${topicList}

When explaining concepts related to these topics, you can reference them and build on their existing knowledge.`);
  }

  // 2. Learning Style
  if (context.learningStyle) {
    const { style, vocabularyLevel, prefersTechnical, prefersStepByStep } = context.learningStyle;
    
    let styleGuidance = '';
    if (style === 'visual') {
      styleGuidance = 'Use visual metaphors, diagrams, and spatial analogies.';
    } else if (style === 'practical') {
      styleGuidance = 'Focus on real-world applications and hands-on examples.';
    } else if (style === 'textual') {
      styleGuidance = 'Use detailed written explanations and definitions.';
    }

    const vocabGuidance = vocabularyLevel >= 7
      ? 'Use precise technical terminology.'
      : vocabularyLevel <= 3
      ? 'Use simple, everyday language.'
      : 'Balance technical terms with clear explanations.';

    sections.push(`**Learning preferences:**
- Style: ${styleGuidance}
- Vocabulary: ${vocabGuidance}
- Technical terms: ${prefersTechnical ? 'Preferred' : 'Avoid when possible'}
- Structure: ${prefersStepByStep ? 'Break into clear steps' : 'Big picture first'}`);
  }

  // 3. Recent Struggles
  if (context.recentStruggles.length > 0) {
    sections.push(`**Recent struggles:**
The user has had difficulty with: ${context.recentStruggles.join(', ')}
Be extra clear when these topics come up.`);
  }

  // 4. Related Topics
  if (context.relatedTopics.length > 0) {
    sections.push(`**Related topics user knows:**
${context.relatedTopics.join(', ')}
You can draw connections to these when relevant.`);
  }

  // 5. Cross-Conversation Memories
  if (context.crossConversationMemories.length > 0) {
    const memories = context.crossConversationMemories
      .map(m => `- ${m.content}`)
      .join('\n');
    
    sections.push(`**From previous conversations:**
${memories}

Reference these naturally when relevant, but don't force it.`);
  }

  // 6. User Stats (for calibration)
  if (context.stats.totalQuestions > 5) {
    const insights: string[] = [];
    
    if (context.stats.confusionRate > 0.3) {
      insights.push('tends to need extra clarification');
    } else if (context.stats.confusionRate < 0.1) {
      insights.push('grasps concepts quickly');
    }

    if (context.stats.helpfulRate > 0.5) {
      insights.push('finds analogies very helpful');
    }

    if (insights.length > 0) {
      sections.push(`**Note:** This user ${insights.join(' and ')}.`);
    }
  }

  return sections.join('\n\n');
}

/**
 * Generate greeting message based on user history
 */
export function generateGreeting(
  isNewUser: boolean,
  context: PersonalizationContext
): string {
  if (isNewUser) {
    return "Hey! I'm Stupify - your AI that speaks human. Ask me anything, and I'll explain it in a way that actually makes sense. What's on your mind?";
  }

  const totalQuestions = context.stats.totalQuestions;
  
  if (totalQuestions < 5) {
    return "Welcome back! What would you like to learn about today?";
  }

  if (totalQuestions < 20) {
    const topTopic = context.knownTopics[0]?.topic;
    if (topTopic) {
      return `Hey again! I see you've been exploring ${topTopic}. Want to dive deeper, or learn something new?`;
    }
  }

  // Experienced user
  const topTopics = context.knownTopics.slice(0, 3).map(t => t.topic);
  if (topTopics.length > 0) {
    return `Welcome back! You've covered ${topTopics.join(', ')} - impressive! What's next?`;
  }

  return "Welcome back! What are we learning today?";
}

/**
 * Main function - create personalized system prompt
 */
export function createPersonalizedPrompt(
  basePrompt: string,
  context: PersonalizationContext,
  complexityLevel: '5yo' | 'normal' | 'advanced'
): string {
  // If user has no history, return base prompt
  if (context.knownTopics.length === 0 && !context.learningStyle) {
    return basePrompt;
  }

  const personalizationSection = buildPersonalizationSection(context);

  // Inject personalization after base prompt
  return `${basePrompt}

---

## PERSONALIZATION CONTEXT

${personalizationSection}

---

Remember: Use this context naturally. Don't explicitly mention "I see you know X" unless it adds value. Instead, seamlessly reference their knowledge when building explanations.`;
}

/**
 * Adjust complexity level based on user history
 */
export function suggestComplexityLevel(
  context: PersonalizationContext,
  currentTopics: string[]
): '5yo' | 'normal' | 'advanced' {
  // Check if user knows current topics
  const knownCurrentTopics = context.knownTopics.filter(kt =>
    currentTopics.includes(kt.topic)
  );

  if (knownCurrentTopics.length === 0 && context.learningStyle) {
    // New topic - use their default preference or normal
    return context.learningStyle?.vocabularyLevel >= 7 ? 'advanced' : 'normal';
  }

  // User has asked about this before
  const avgLevel = knownCurrentTopics.reduce((sum, t) => {
    const levelScore = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    }[t.level] || 2;
    return sum + levelScore;
  }, 0) / knownCurrentTopics.length;

  if (avgLevel >= 3) return 'advanced';
  if (avgLevel >= 2) return 'normal';
  return '5yo';
}

/**
 * Generate suggested follow-up questions based on context
 */
export function generateSuggestedQuestions(
  context: PersonalizationContext,
  currentTopic: string
): string[] {
  const suggestions: string[] = [];

  // Suggest exploring related topics
  const relatedTopic = context.relatedTopics[0];
  if (relatedTopic) {
    suggestions.push(`How does ${currentTopic} relate to ${relatedTopic}?`);
  }

  // Suggest deepening current topic
  const currentKnowledge = context.knownTopics.find(t => t.topic === currentTopic);
  if (currentKnowledge) {
    if (currentKnowledge.level === 'beginner') {
      suggestions.push(`What are some real-world applications of ${currentTopic}?`);
    } else if (currentKnowledge.level === 'intermediate') {
      suggestions.push(`What are the limitations of ${currentTopic}?`);
    } else {
      suggestions.push(`What are the cutting-edge developments in ${currentTopic}?`);
    }
  }

  // Suggest revisiting struggles
  const struggle = context.recentStruggles[0];
  if (struggle && struggle !== currentTopic) {
    suggestions.push(`Can you explain ${struggle} differently?`);
  }

  return suggestions.slice(0, 3);
}