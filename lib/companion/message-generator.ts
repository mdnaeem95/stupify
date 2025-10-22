/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - MESSAGE GENERATOR
// Created: October 22, 2025
// Version: 1.0 (Phase 1 - Canned Messages)
// Description: Generates companion messages based on archetypes and context
// Note: Phase 2 will upgrade this to GPT-4o-mini generated messages
// ============================================================================

import type { CompanionArchetype, CompanionMessageType } from './types';

/**
 * Message template structure
 */
interface MessageTemplate {
  templates: string[];
  emoji?: string;
}

/**
 * Archetype-specific message templates
 */
const ARCHETYPE_MESSAGES: Record<
  CompanionArchetype,
  Record<CompanionMessageType, MessageTemplate>
> = {
  mentor: {
    greeting: {
      templates: [
        "Hello, my student! Ready to expand your mind today? 📚",
        "Greetings! What shall we learn together today? 🧠",
        "Welcome back! Your curiosity is your greatest strength. Let's explore something new! 🌟",
        "Good to see you! Every question you ask makes you wiser. What's on your mind? 💡",
      ],
      emoji: '🧙‍♂️',
    },
    encouragement: {
      templates: [
        "Excellent question! You're thinking like a true scholar. 🎓",
        "Your curiosity is impressive! Keep asking these thoughtful questions. ✨",
        "Well done! This is exactly the kind of inquiry that leads to deep understanding. 📖",
        "I'm proud of your progress! Each question brings you closer to mastery. 🌟",
        "Brilliant! You're developing critical thinking skills. 🧠",
      ],
      emoji: '👏',
    },
    milestone: {
      templates: [
        "Congratulations! You've reached level {level}. Your dedication to learning is inspiring! 🏆",
        "Level {level} achieved! You're well on your path to wisdom. Keep going! 📚",
        "Outstanding achievement! Level {level} reflects your commitment to growth. 🌟",
        "You've leveled up to {level}! Each milestone proves your potential. 💫",
      ],
      emoji: '🎓',
    },
    reminder: {
      templates: [
        "Don't forget - consistency is key to mastery! Keep your streak alive! 🔥",
        "A wise person learns something new every day. Will you continue your streak? ⚡",
        "Your daily practice is building greatness. Don't break the momentum! 💪",
      ],
      emoji: '⏰',
    },
    celebration: {
      templates: [
        "Remarkable achievement! Your hard work is paying off! 🎉",
        "This is a momentous occasion! You should be proud! 🏆",
        "Extraordinary! You're exceeding all expectations! ⭐",
      ],
      emoji: '🎊',
    },
    curiosity: {
      templates: [
        "I'm curious - what topic fascinates you most lately? 🤔",
        "What area of knowledge would you like to explore deeper? 📚",
        "I've noticed your interest in {topic}. Shall we dive deeper? 🔍",
      ],
      emoji: '💭',
    },
    suggestion: {
      templates: [
        "Based on your recent questions, you might enjoy learning about {topic}. 💡",
        "Have you considered exploring {topic}? It relates perfectly to what you've been studying. 🎯",
        "I think you're ready for a challenge. Try asking about {topic}! 🚀",
      ],
      emoji: '💡',
    },
  },

  friend: {
    greeting: {
      templates: [
        "Hey there! Ready to learn something awesome today? 🤗",
        "What's up! Let's discover something cool together! 🎉",
        "Welcome back, friend! What are we curious about today? 🌟",
        "Heyyy! Miss you! What do you want to learn about? 💫",
      ],
      emoji: '👋',
    },
    encouragement: {
      templates: [
        "Nice question! You're crushing it! 🙌",
        "Love it! You're getting smarter every day! ⭐",
        "That's such a cool thing to ask about! Keep being curious! 🚀",
        "You're on fire today! Love your energy! 🔥",
        "Awesome! Learning with you is the best! 💙",
      ],
      emoji: '✨',
    },
    milestone: {
      templates: [
        "OMG! Level {level}! You're AMAZING! 🎉🎊",
        "YES! Level {level}! We did it! So proud of you! 🏆",
        "WOW! Level {level}! You're unstoppable! 🚀",
        "Level {level}!!! This calls for a celebration! 🎈",
      ],
      emoji: '🎉',
    },
    reminder: {
      templates: [
        "Hey! Don't let your streak die! I believe in you! 💪",
        "Quick reminder - your streak is too good to lose! Let's keep it going! 🔥",
        "Miss you! Come back and keep that streak alive! ⚡",
      ],
      emoji: '⏰',
    },
    celebration: {
      templates: [
        "THIS IS HUGE! You're absolutely crushing it! 🎉",
        "I'm SO proud of you! This is incredible! 🏆",
        "You did it! Let's goooo! 🚀",
      ],
      emoji: '🎊',
    },
    curiosity: {
      templates: [
        "So... what are you into lately? I'm curious! 😊",
        "What's been on your mind? Let's talk about it! 💬",
        "I noticed you love {topic}. Want to explore more? 🤔",
      ],
      emoji: '💭',
    },
    suggestion: {
      templates: [
        "Ooh, I think you'd love learning about {topic}! 🌟",
        "Hey, since you liked that, check out {topic} next! 🎯",
        "Random idea - what if we explored {topic}? Could be fun! 💡",
      ],
      emoji: '💡',
    },
  },

  explorer: {
    greeting: {
      templates: [
        "Adventure awaits! What shall we discover today? 🚀",
        "Hello, fellow explorer! Ready to venture into the unknown? 🗺️",
        "Welcome back! The universe is full of mysteries. Let's uncover one! 🌌",
        "Greetings, adventurer! What frontier shall we explore? ⛰️",
      ],
      emoji: '🧭',
    },
    encouragement: {
      templates: [
        "Fascinating question! The best discoveries come from curiosity! 🔍",
        "Great exploration! You're charting new territory! 🗺️",
        "This is exciting! Every question opens a new path! 🌟",
        "Brilliant! You're thinking like a true explorer! 🚀",
        "Amazing discovery! Let's see where this leads! 💫",
      ],
      emoji: '⭐',
    },
    milestone: {
      templates: [
        "Level {level} conquered! What an expedition! The journey continues! 🏔️",
        "New level unlocked: {level}! You're mapping uncharted territory! 🗺️",
        "Level {level} discovered! Each level is a new world to explore! 🌍",
        "Achievement unlocked: Level {level}! The adventure intensifies! 🚀",
      ],
      emoji: '🏆',
    },
    reminder: {
      templates: [
        "The path of exploration requires dedication! Keep your streak alive! 🔥",
        "Great explorers never stop! Continue your journey today! ⚡",
        "Your expedition isn't over! Come back and discover more! 🗺️",
      ],
      emoji: '⏰',
    },
    celebration: {
      templates: [
        "Historic achievement! You're blazing trails! 🎉",
        "Legendary! This discovery will be remembered! 🏆",
        "Incredible expedition! You've reached new heights! ⛰️",
      ],
      emoji: '🎊',
    },
    curiosity: {
      templates: [
        "What mysteries intrigue you most? Let's investigate! 🔍",
        "What uncharted territory should we explore next? 🗺️",
        "I sense you're drawn to {topic}. Shall we venture deeper? 🌌",
      ],
      emoji: '💭',
    },
    suggestion: {
      templates: [
        "Based on your journey, {topic} might be your next frontier! 🚀",
        "I've mapped a connection to {topic}. Want to explore it? 🗺️",
        "Your path leads toward {topic}. Ready for the adventure? 🌟",
      ],
      emoji: '💡',
    },
  },
};

/**
 * Get a random template from an array
 */
function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Replace placeholders in template
 */
function replacePlaceholders(
  template: string,
  context?: Record<string, any>
): string {
  if (!context) return template;

  let result = template;
  Object.entries(context).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });

  return result;
}

/**
 * Generate a companion message
 * @param archetype - Companion personality type
 * @param messageType - Type of message to generate
 * @param context - Additional context for message generation
 * @returns Generated message content
 */
export function generateMessage(
  archetype: CompanionArchetype,
  messageType: CompanionMessageType,
  context?: Record<string, any>
): string {
  const templates = ARCHETYPE_MESSAGES[archetype][messageType];
  
  if (!templates || templates.templates.length === 0) {
    return `Hello! I'm your ${archetype} companion! 👋`;
  }

  const template = getRandomTemplate(templates.templates);
  return replacePlaceholders(template, context);
}

/**
 * Generate a greeting message
 */
export function generateGreeting(archetype: CompanionArchetype): string {
  return generateMessage(archetype, 'greeting');
}

/**
 * Generate an encouragement message
 */
export function generateEncouragement(
  archetype: CompanionArchetype,
  context?: Record<string, any>
): string {
  return generateMessage(archetype, 'encouragement', context);
}

/**
 * Generate a milestone message (level up)
 */
export function generateMilestone(
  archetype: CompanionArchetype,
  level: number
): string {
  return generateMessage(archetype, 'milestone', { level });
}

/**
 * Generate a reminder message (streak)
 */
export function generateReminder(archetype: CompanionArchetype): string {
  return generateMessage(archetype, 'reminder');
}

/**
 * Generate a celebration message (achievement)
 */
export function generateCelebration(
  archetype: CompanionArchetype,
  context?: Record<string, any>
): string {
  return generateMessage(archetype, 'celebration', context);
}

/**
 * Generate a curiosity message
 */
export function generateCuriosity(
  archetype: CompanionArchetype,
  context?: Record<string, any>
): string {
  return generateMessage(archetype, 'curiosity', context);
}

/**
 * Generate a suggestion message
 */
export function generateSuggestion(
  archetype: CompanionArchetype,
  topic: string
): string {
  return generateMessage(archetype, 'suggestion', { topic });
}

/**
 * Determine if a proactive message should be sent
 * Phase 1: Simple rules (max 2 per session)
 * @param messagesSentInSession - Number of messages already sent
 * @returns true if should send proactive message
 */
export function shouldSendProactiveMessage(messagesSentInSession: number): boolean {
  // Max 2 proactive messages per session
  if (messagesSentInSession >= 2) return false;

  // 30% chance to send proactive message
  return Math.random() < 0.3;
}

/**
 * Select a random message type for proactive messaging
 * @returns Message type to send
 */
export function selectProactiveMessageType(): CompanionMessageType {
  const types: CompanionMessageType[] = ['encouragement', 'curiosity'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Get emoji for message type
 */
export function getEmojiForMessageType(
  messageType: CompanionMessageType,
  archetype: CompanionArchetype
): string {
  return ARCHETYPE_MESSAGES[archetype][messageType]?.emoji || '💬';
}

/**
 * Generate a personalized topic suggestion based on recent questions
 * Phase 1: Simple topic extraction
 * Phase 2: Will use GPT and knowledge graph
 */
export function generateTopicSuggestion(recentTopics: string[]): string {
  if (recentTopics.length === 0) {
    return 'artificial intelligence';
  }

  // For now, just return a random recent topic
  return recentTopics[Math.floor(Math.random() * recentTopics.length)];
}