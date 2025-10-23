/**
 * Companion Stats Manager
 * Handles calculation and updates for companion stats (happiness, energy, knowledge)
 */

export interface StatChange {
  happiness?: number;
  energy?: number;
  knowledge?: number;
}

export interface CompanionStats {
  happiness: number;
  energy: number;
  knowledge: number;
}

/**
 * Calculate stat changes based on user action
 * @param action - Type of action user performed
 * @param complexity - Question complexity ('5yo', 'normal', 'advanced')
 * @returns Object with stat changes
 */
export function calculateStatChange(
  action: 'question_asked' | 'game_played' | 'check_in' | 'interaction',
  complexity?: '5yo' | 'normal' | 'advanced'
): StatChange {
  switch (action) {
    case 'question_asked':
      // Energy increases when user asks questions (they're engaged)
      // Knowledge increases based on complexity
      return {
        energy: 5,
        knowledge: complexity === 'advanced' ? 5 : complexity === 'normal' ? 3 : 2,
        happiness: 2,
      };

    case 'game_played':
      // Games boost happiness and energy
      return {
        happiness: 10,
        energy: 8,
        knowledge: 3,
      };

    case 'check_in':
      // Check-ins restore all stats significantly
      return {
        happiness: 15,
        energy: 20,
        knowledge: 5,
      };

    case 'interaction':
      // User clicked companion bubble
      return {
        happiness: 5,
        energy: 0,
        knowledge: 0,
      };

    default:
      return {};
  }
}

/**
 * Apply stat changes to current stats, ensuring they stay within 0-100 range
 * @param currentStats - Current stat values
 * @param changes - Stat changes to apply
 * @returns Updated stats
 */
export function applyStatChanges(
  currentStats: CompanionStats,
  changes: StatChange
): CompanionStats {
  const newStats = {
    happiness: currentStats.happiness + (changes.happiness || 0),
    energy: currentStats.energy + (changes.energy || 0),
    knowledge: currentStats.knowledge + (changes.knowledge || 0),
  };

  // Clamp values between 0 and 100
  return {
    happiness: Math.max(0, Math.min(100, newStats.happiness)),
    energy: Math.max(0, Math.min(100, newStats.energy)),
    knowledge: Math.max(0, Math.min(100, newStats.knowledge)),
  };
}

/**
 * Calculate daily stat decay (for future use - currently not enabled)
 * @param currentStats - Current stat values
 * @param daysSinceLastInteraction - Number of days since last interaction
 * @returns Decay amounts
 */
export function getStatDecayAmount(
  currentStats: CompanionStats,
  daysSinceLastInteraction: number
): StatChange {
  // Currently no decay - can be enabled later via feature flag
  // Keeping this function for future use
  
  // Example decay logic (disabled):
  // const decayPerDay = {
  //   happiness: 2,
  //   energy: 3,
  //   knowledge: 1,
  // };
  
  // return {
  //   happiness: -1 * decayPerDay.happiness * daysSinceLastInteraction,
  //   energy: -1 * decayPerDay.energy * daysSinceLastInteraction,
  //   knowledge: -1 * decayPerDay.knowledge * daysSinceLastInteraction,
  // };

  return {
    happiness: 0,
    energy: 0,
    knowledge: 0,
  };
}

/**
 * Restore stats to healthy levels (used for check-ins)
 * @param currentStats - Current stat values
 * @returns Restored stats
 */
export function restoreStats(currentStats: CompanionStats): CompanionStats {
  // Restore energy to 100, boost others
  return {
    happiness: Math.min(100, currentStats.happiness + 15),
    energy: 100, // Full energy restore
    knowledge: Math.min(100, currentStats.knowledge + 5),
  };
}

/**
 * Get stat warning level (for UI indicators)
 * @param stat - Stat value (0-100)
 * @returns Warning level: 'critical' | 'low' | 'normal' | 'high'
 */
export function getStatWarningLevel(
  stat: number
): 'critical' | 'low' | 'normal' | 'high' {
  if (stat < 30) return 'critical';
  if (stat < 50) return 'low';
  if (stat >= 80) return 'high';
  return 'normal';
}

/**
 * Get all stat warning levels
 * @param stats - Current stats
 * @returns Object with warning level for each stat
 */
export function getAllStatWarnings(stats: CompanionStats): {
  happiness: 'critical' | 'low' | 'normal' | 'high';
  energy: 'critical' | 'low' | 'normal' | 'high';
  knowledge: 'critical' | 'low' | 'normal' | 'high';
} {
  return {
    happiness: getStatWarningLevel(stats.happiness),
    energy: getStatWarningLevel(stats.energy),
    knowledge: getStatWarningLevel(stats.knowledge),
  };
}

/**
 * Check if any stat needs attention
 * @param stats - Current stats
 * @returns true if any stat is below 30
 */
export function needsAttention(stats: CompanionStats): boolean {
  return stats.happiness < 30 || stats.energy < 30 || stats.knowledge < 30;
}