/**
 * EVOLUTION CONFIGURATION - Phase 2, Days 15-17
 * 
 * Defines the visual evolution stages for companions.
 * Companions evolve through 3 stages: Baby → Teen → Adult
 * 
 * Evolution is based on companion level:
 * - Baby: Levels 1-3
 * - Teen: Levels 4-7
 * - Adult: Levels 8+
 */

import { type CompanionArchetype } from './archetypes';

// ============================================================================
// TYPES
// ============================================================================

export type EvolutionStage = 'baby' | 'teen' | 'adult';

export interface StageConfig {
  stage: EvolutionStage;
  minLevel: number;
  maxLevel: number | null; // null = no max (adult stage)
  name: string;
  description: string;
  traits: string[];
  size: 'small' | 'medium' | 'large';
  animationDuration: number; // milliseconds for evolution animation
}

export interface EvolutionConfig {
  stages: Record<EvolutionStage, StageConfig>;
  evolutionMessages: Record<EvolutionStage, string[]>;
  unlockMessages: Record<EvolutionStage, string[]>;
}

// ============================================================================
// STAGE CONFIGURATIONS
// ============================================================================

export const EVOLUTION_STAGES: Record<EvolutionStage, StageConfig> = {
  baby: {
    stage: 'baby',
    minLevel: 1,
    maxLevel: 3,
    name: 'Baby',
    description: 'Just starting their journey',
    traits: ['Curious', 'Playful', 'Learning'],
    size: 'small',
    animationDuration: 2000,
  },
  teen: {
    stage: 'teen',
    minLevel: 4,
    maxLevel: 7,
    name: 'Teen',
    description: 'Growing and exploring',
    traits: ['Energetic', 'Confident', 'Adventurous'],
    size: 'medium',
    animationDuration: 2500,
  },
  adult: {
    stage: 'adult',
    minLevel: 8,
    maxLevel: null,
    name: 'Adult',
    description: 'Fully evolved and wise',
    traits: ['Wise', 'Powerful', 'Experienced'],
    size: 'large',
    animationDuration: 3000,
  },
};

// ============================================================================
// EVOLUTION MESSAGES
// ============================================================================

/**
 * Messages shown when companion is about to evolve
 */
export const EVOLUTION_MESSAGES: Record<EvolutionStage, string[]> = {
  baby: [
    "I'm just getting started on this learning adventure!",
    "Everything is so new and exciting!",
    "I can't wait to learn more with you!",
  ],
  teen: [
    "Wow! I'm growing up and getting smarter!",
    "I feel so much more confident now!",
    "Let's tackle bigger challenges together!",
  ],
  adult: [
    "I've reached my full potential!",
    "Look how far we've come together!",
    "I'm ready to help you master anything!",
  ],
};

/**
 * Messages shown when companion reaches new stage
 */
export const UNLOCK_MESSAGES: Record<EvolutionStage, string[]> = {
  baby: [
    "Hello! I'm here to learn with you!",
    "This is the beginning of something special!",
    "Let's start this adventure together!",
  ],
  teen: [
    "🎉 I evolved into a Teen! I'm ready for more complex topics!",
    "⭐ Level up! I can help you with advanced questions now!",
    "✨ Evolution complete! Let's explore deeper concepts!",
  ],
  adult: [
    "🌟 I've reached Adult stage! I'm at my full potential!",
    "🏆 Maximum evolution achieved! I can tackle any topic now!",
    "💫 Final form unlocked! Let's master everything together!",
  ],
};

// ============================================================================
// ARCHETYPE-SPECIFIC EVOLUTION TRAITS
// ============================================================================

/**
 * How each archetype's personality changes per stage
 */
export const ARCHETYPE_STAGE_TRAITS: Record<
  CompanionArchetype,
  Record<EvolutionStage, {
    personality: string;
    emoji: string;
    specialAbility: string;
  }>
> = {
  mentor: {
    baby: {
      personality: 'Eager student, asking questions',
      emoji: '🦉',
      specialAbility: 'Learning alongside you',
    },
    teen: {
      personality: 'Knowledgeable guide, offering insights',
      emoji: '🦉',
      specialAbility: 'Provides context and connections',
    },
    adult: {
      personality: 'Wise teacher, sharing deep wisdom',
      emoji: '🦉',
      specialAbility: 'Anticipates learning needs',
    },
  },
  friend: {
    baby: {
      personality: 'Cheerful companion, celebrating wins',
      emoji: '🌟',
      specialAbility: 'Encourages every step',
    },
    teen: {
      personality: 'Supportive buddy, cheering you on',
      emoji: '🌟',
      specialAbility: 'Celebrates milestones',
    },
    adult: {
      personality: 'Loyal best friend, always positive',
      emoji: '🌟',
      specialAbility: 'Boosts confidence and motivation',
    },
  },
  explorer: {
    baby: {
      personality: 'Curious adventurer, finding wonders',
      emoji: '🧭',
      specialAbility: 'Points out interesting facts',
    },
    teen: {
      personality: 'Bold explorer, seeking challenges',
      emoji: '🧭',
      specialAbility: 'Suggests new topics to explore',
    },
    adult: {
      personality: 'Master navigator, charting new paths',
      emoji: '🧭',
      specialAbility: 'Connects diverse topics',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get evolution stage for a given level
 */
export function getStageForLevel(level: number): EvolutionStage {
  if (level <= 3) return 'baby';
  if (level <= 7) return 'teen';
  return 'adult';
}

/**
 * Get stage configuration
 */
export function getStageConfig(stage: EvolutionStage): StageConfig {
  return EVOLUTION_STAGES[stage];
}

/**
 * Get stage configuration by level
 */
export function getStageConfigForLevel(level: number): StageConfig {
  const stage = getStageForLevel(level);
  return EVOLUTION_STAGES[stage];
}

/**
 * Check if companion will evolve on next level
 */
export function willEvolveOnNextLevel(currentLevel: number): boolean {
  const currentStage = getStageForLevel(currentLevel);
  const nextStage = getStageForLevel(currentLevel + 1);
  return currentStage !== nextStage;
}

/**
 * Get next evolution stage
 */
export function getNextStage(currentStage: EvolutionStage): EvolutionStage | null {
  if (currentStage === 'baby') return 'teen';
  if (currentStage === 'teen') return 'adult';
  return null; // Adult is max stage
}

/**
 * Get previous evolution stage
 */
export function getPreviousStage(currentStage: EvolutionStage): EvolutionStage | null {
  if (currentStage === 'teen') return 'baby';
  if (currentStage === 'adult') return 'teen';
  return null; // Baby is min stage
}

/**
 * Get progress within current stage (0-1)
 */
export function getStageProgress(level: number): number {
  const stage = getStageForLevel(level);
  const config = EVOLUTION_STAGES[stage];
  
  if (!config.maxLevel) {
    // Adult stage has no max, so always at 100%
    return 1;
  }
  
  const levelInStage = level - config.minLevel;
  const totalLevelsInStage = config.maxLevel - config.minLevel + 1;
  
  return levelInStage / totalLevelsInStage;
}

/**
 * Get levels until next evolution
 */
export function getLevelsUntilEvolution(currentLevel: number): number | null {
  const currentStage = getStageForLevel(currentLevel);
  const config = EVOLUTION_STAGES[currentStage];
  
  if (!config.maxLevel) {
    // Adult stage - no more evolutions
    return null;
  }
  
  return config.maxLevel - currentLevel + 1;
}

/**
 * Get random evolution message for stage
 */
export function getEvolutionMessage(stage: EvolutionStage): string {
  const messages = EVOLUTION_MESSAGES[stage];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get random unlock message for stage
 */
export function getUnlockMessage(stage: EvolutionStage): string {
  const messages = UNLOCK_MESSAGES[stage];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get archetype-specific stage traits
 */
export function getArchetypeStageTraits(
  archetype: CompanionArchetype,
  stage: EvolutionStage
) {
  return ARCHETYPE_STAGE_TRAITS[archetype][stage];
}

/**
 * Get all stages in order
 */
export function getAllStages(): EvolutionStage[] {
  return ['baby', 'teen', 'adult'];
}

/**
 * Check if stage is available (unlocked)
 */
export function isStageUnlocked(stage: EvolutionStage, currentLevel: number): boolean {
  const stageConfig = EVOLUTION_STAGES[stage];
  return currentLevel >= stageConfig.minLevel;
}

/**
 * Get size multiplier for stage (for scaling visuals)
 */
export function getSizeMultiplier(stage: EvolutionStage): number {
  const sizes = {
    baby: 0.7,
    teen: 0.85,
    adult: 1.0,
  };
  return sizes[stage];
}

/**
 * Get CSS classes for stage size
 */
export function getStageSizeClasses(stage: EvolutionStage): string {
  const classes = {
    baby: 'w-16 h-16 md:w-20 md:h-20',
    teen: 'w-20 h-20 md:w-24 md:h-24',
    adult: 'w-24 h-24 md:w-28 md:h-28',
  };
  return classes[stage];
}

/**
 * Get evolution requirements summary
 */
export function getEvolutionRequirements(stage: EvolutionStage): string {  
  if (stage === 'baby') {
    return 'Starting stage';
  }
  
  if (stage === 'teen') {
    return 'Reach level 4 to evolve';
  }
  
  if (stage === 'adult') {
    return 'Reach level 8 to evolve';
  }
  
  return 'Unknown requirements';
}

/**
 * Get all evolution milestones
 */
export function getEvolutionMilestones(): Array<{
  stage: EvolutionStage;
  level: number;
  name: string;
}> {
  return [
    { stage: 'baby', level: 1, name: 'Birth' },
    { stage: 'teen', level: 4, name: 'First Evolution' },
    { stage: 'adult', level: 8, name: 'Final Evolution' },
  ];
}