import { SimplicityLevel } from '../prompts/prompts-v2';

export interface ConfusionSignal {
  isConfused: boolean;
  confidence: number;
  signals: string[];
  suggestedAction: 'retry' | 'simplify' | 'different_analogy';
}

const CONFUSION_PATTERNS = [
  // Strong confusion signals
  { pattern: /^(huh|what|wut)\??$/i, weight: 0.9, action: 'retry' as const },
  { pattern: /i don'?t (get|understand|follow)/i, weight: 0.9, action: 'retry' as const },
  { pattern: /makes no sense/i, weight: 0.9, action: 'retry' as const },
  { pattern: /still confused/i, weight: 0.9, action: 'retry' as const },
  { pattern: /that'?s confusing/i, weight: 0.8, action: 'retry' as const },
  { pattern: /lost me/i, weight: 0.8, action: 'retry' as const },
  
  // Simplification requests
  { pattern: /simpler|easier|dumb(er)? (it )?down/i, weight: 0.9, action: 'simplify' as const },
  { pattern: /like (i'?m|im) (\d+|five|a kid)/i, weight: 0.8, action: 'simplify' as const },
  { pattern: /too (complicated|complex|hard|difficult)/i, weight: 0.8, action: 'simplify' as const },
  
  // Different analogy requests
  { pattern: /different (way|example|analogy)/i, weight: 0.8, action: 'different_analogy' as const },
  { pattern: /another (way|example|analogy)/i, weight: 0.8, action: 'different_analogy' as const },
  
  // Clarification requests - IMPROVED to avoid false positives
  { pattern: /can you (explain|clarify|rephrase) (that|this|it)/i, weight: 0.7, action: 'retry' as const },
];

// Questions that should NEVER trigger confusion detection
const NORMAL_QUESTION_PATTERNS = [
  /^how are you/i,
  /^how'?s it going/i,
  /^how do (i|you)/i,
  /^how does (it|this|that)/i,
  /^how would (i|you)/i,
  /^how can (i|you)/i,
  /^what is/i,
  /^what are/i,
  /^why (is|are|do|does)/i,
  /^when (is|are|do|does)/i,
  /^where (is|are|do|does)/i,
  /^who (is|are)/i,
  /^tell me (about|how|what|why)/i,
  /^explain (how|what|why)/i,
];

export function detectConfusion(
  userMessage: string,
  previousQuestion?: string
): ConfusionSignal {
  const message = userMessage.trim();
  
  // Check if this is just a normal question first
  for (const pattern of NORMAL_QUESTION_PATTERNS) {
    if (pattern.test(message)) {
      return {
        isConfused: false,
        confidence: 0,
        signals: [],
        suggestedAction: 'retry'
      };
    }
  }
  
  const signals: string[] = [];
  let totalWeight = 0;
  let suggestedAction: 'retry' | 'simplify' | 'different_analogy' = 'retry';

  // Check for confusion patterns
  for (const { pattern, weight, action } of CONFUSION_PATTERNS) {
    if (pattern.test(message)) {
      signals.push(pattern.toString());
      totalWeight += weight;
      if (weight > totalWeight - weight) {
        suggestedAction = action;
      }
    }
  }

  // Check for repeated similar questions
  if (previousQuestion && message.length > 10) {
    const similarity = calculateSimilarity(message, previousQuestion);
    if (similarity > 0.7) {
      signals.push('repeated_question');
      totalWeight += 0.8;
      suggestedAction = 'simplify';
    }
  }

  const confidence = Math.min(totalWeight, 1.0);
  const isConfused = confidence >= 0.5;

  return {
    isConfused,
    confidence,
    signals,
    suggestedAction: isConfused ? suggestedAction : 'retry'
  };
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

export function getRetryInstructions(
  signal: ConfusionSignal,
  currentLevel: SimplicityLevel
): {
  newLevel: SimplicityLevel;
  instructions: string;
} {
  let newLevel = currentLevel;
  let instructions = '';

  switch (signal.suggestedAction) {
    case 'simplify':
      if (currentLevel === 'advanced') newLevel = 'normal';
      else if (currentLevel === 'normal') newLevel = '5yo';
      else newLevel = '5yo';
      instructions = `The user is confused and needs a simpler explanation. Use a completely different analogy from everyday life. Break it into smaller steps. Start with: "Let me try explaining this differently..."`;
      break;

    case 'different_analogy':
      instructions = `The user wants a different analogy. Keep the same complexity level but use a COMPLETELY different analogy from a different domain. Start with: "Here's another way to think about it..."`;
      break;

    case 'retry':
    default:
      if (currentLevel === 'advanced') newLevel = 'normal';
      else if (currentLevel === 'normal') newLevel = '5yo';
      instructions = `The user didn't understand. Rephrase using a different analogy. Be warmer and more encouraging. Start with: "Let me put it another way..."`;
      break;
  }

  return { newLevel, instructions };
}