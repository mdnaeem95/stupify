// ============================================================================
// STUPIFY AI COMPANION FEATURE - XP CALCULATOR
// Created: October 22, 2025
// Version: 1.0
// Description: Handles XP calculations and level progression
// ============================================================================

import { LEVEL_XP_REQUIREMENTS, MAX_LEVEL, type LevelProgress } from './types';

/**
 * Calculate what level a companion should be based on total XP
 * @param totalXP - Total XP earned (never decreases)
 * @returns The current level
 */
export function calculateLevel(totalXP: number): number {
  // Edge cases
  if (totalXP < 0) return 1;
  if (totalXP >= LEVEL_XP_REQUIREMENTS[MAX_LEVEL]) return MAX_LEVEL;

  // Find highest level where XP requirement is met
  let level = 1;
  for (let i = MAX_LEVEL; i >= 1; i--) {
    if (totalXP >= LEVEL_XP_REQUIREMENTS[i]) {
      level = i;
      break;
    }
  }

  return level;
}

/**
 * Calculate XP required for a specific level
 * @param level - Target level
 * @returns XP required to reach that level
 */
export function getXPForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > MAX_LEVEL) return LEVEL_XP_REQUIREMENTS[MAX_LEVEL];
  return LEVEL_XP_REQUIREMENTS[level];
}

/**
 * Calculate XP needed to reach next level
 * @param currentLevel - Current level
 * @param currentTotalXP - Current total XP
 * @returns XP needed for next level, or 0 if at max level
 */
export function getXPToNextLevel(currentLevel: number, currentTotalXP: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const remaining = nextLevelXP - currentTotalXP;
  
  return Math.max(0, remaining);
}

/**
 * Calculate current XP within the current level
 * Example: If you need 100 XP for level 2 and 250 for level 3,
 * and you have 175 total XP, your "current XP" is 75 (175 - 100)
 * @param level - Current level
 * @param totalXP - Total XP earned
 * @returns XP earned in current level
 */
export function getCurrentLevelXP(level: number, totalXP: number): number {
  const currentLevelRequirement = getXPForLevel(level);
  return Math.max(0, totalXP - currentLevelRequirement);
}

/**
 * Calculate XP range for current level
 * @param level - Current level
 * @returns Object with start and end XP for the level
 */
export function getLevelXPRange(level: number): { start: number; end: number } {
  if (level >= MAX_LEVEL) {
    return {
      start: getXPForLevel(MAX_LEVEL),
      end: Infinity,
    };
  }

  return {
    start: getXPForLevel(level),
    end: getXPForLevel(level + 1),
  };
}

/**
 * Calculate progress percentage within current level
 * @param level - Current level
 * @param totalXP - Total XP earned
 * @returns Percentage (0-100) of progress to next level
 */
export function getLevelProgressPercentage(level: number, totalXP: number): number {
  if (level >= MAX_LEVEL) return 100;

  const range = getLevelXPRange(level);
  const currentXP = getCurrentLevelXP(level, totalXP);
  const xpNeeded = range.end - range.start;

  if (xpNeeded === 0) return 100;

  const percentage = (currentXP / xpNeeded) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Get comprehensive level progress information
 * @param currentLevel - Current level
 * @param totalXP - Total XP earned
 * @returns Complete progress information
 */
export function getLevelProgress(currentLevel: number, totalXP: number): LevelProgress {
  const range = getLevelXPRange(currentLevel);
  const currentXP = getCurrentLevelXP(currentLevel, totalXP);
  const xpToNext = getXPToNextLevel(currentLevel, totalXP);
  const progressPercentage = getLevelProgressPercentage(currentLevel, totalXP);

  return {
    current_level: currentLevel,
    current_xp: currentXP,
    xp_for_current_level: range.start,
    xp_for_next_level: currentLevel < MAX_LEVEL ? range.end : range.start,
    xp_to_next_level: xpToNext,
    progress_percentage: progressPercentage,
  };
}

/**
 * Check if adding XP would cause a level up
 * @param currentTotalXP - Current total XP
 * @param xpToAdd - XP being added
 * @returns Object with level up info
 */
export function checkLevelUp(
  currentTotalXP: number,
  xpToAdd: number
): {
  willLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  levelsGained: number;
} {
  const oldLevel = calculateLevel(currentTotalXP);
  const newTotalXP = currentTotalXP + xpToAdd;
  const newLevel = calculateLevel(newTotalXP);
  const levelsGained = newLevel - oldLevel;

  return {
    willLevelUp: levelsGained > 0,
    oldLevel,
    newLevel,
    levelsGained,
  };
}

/**
 * Calculate XP needed to reach a target level from current XP
 * @param currentTotalXP - Current total XP
 * @param targetLevel - Desired level
 * @returns XP needed, or 0 if already at or above target
 */
export function getXPNeededForLevel(currentTotalXP: number, targetLevel: number): number {
  if (targetLevel < 1 || targetLevel > MAX_LEVEL) return 0;
  
  const targetXP = getXPForLevel(targetLevel);
  const needed = targetXP - currentTotalXP;
  
  return Math.max(0, needed);
}

/**
 * Get all levels that will be passed when adding XP
 * Useful for showing multiple level-up celebrations
 * @param currentTotalXP - Current total XP
 * @param xpToAdd - XP being added
 * @returns Array of levels gained
 */
export function getLevelsGained(currentTotalXP: number, xpToAdd: number): number[] {
  const oldLevel = calculateLevel(currentTotalXP);
  const newLevel = calculateLevel(currentTotalXP + xpToAdd);
  
  if (newLevel <= oldLevel) return [];
  
  const levels: number[] = [];
  for (let i = oldLevel + 1; i <= newLevel; i++) {
    levels.push(i);
  }
  
  return levels;
}

/**
 * Validate if XP value is reasonable (prevent exploits)
 * @param xpValue - XP value to validate
 * @returns true if valid, false if suspicious
 */
export function isValidXPValue(xpValue: number): boolean {
  // XP should be positive
  if (xpValue < 0) return false;
  
  // Single action shouldn't give more than 100 XP (max is achievement unlock at 50)
  if (xpValue > 100) return false;
  
  return true;
}

/**
 * Calculate estimated time to reach next level
 * Based on average XP per question
 * @param currentTotalXP - Current total XP
 * @param averageXPPerQuestion - Average XP earned per question (default 10)
 * @returns Estimated questions needed
 */
export function getEstimatedQuestionsToNextLevel(
  currentTotalXP: number,
  averageXPPerQuestion: number = 10
): number {
  const currentLevel = calculateLevel(currentTotalXP);
  if (currentLevel >= MAX_LEVEL) return 0;
  
  const xpNeeded = getXPToNextLevel(currentLevel, currentTotalXP);
  const questionsNeeded = Math.ceil(xpNeeded / averageXPPerQuestion);
  
  return questionsNeeded;
}

/**
 * Get milestone levels (special levels with rewards)
 * @returns Array of milestone level numbers
 */
export function getMilestoneLevels(): number[] {
  return [5, 10]; // Phase 1: Only levels 5 and 10 are milestones
}

/**
 * Check if a level is a milestone
 * @param level - Level to check
 * @returns true if milestone level
 */
export function isMilestoneLevel(level: number): boolean {
  return getMilestoneLevels().includes(level);
}

/**
 * Get a fun message for reaching a level
 * @param level - Level reached
 * @returns Celebratory message
 */
export function getLevelUpMessage(level: number): string {
  const messages: Record<number, string> = {
    2: "You're getting the hang of this! 🌟",
    3: "Three's a charm! Keep going! 🎯",
    4: "You're on fire! 🔥",
    5: "Halfway to mastery! Amazing work! 🏆",
    6: "You're becoming unstoppable! 💪",
    7: "Seven levels of awesome! 🌈",
    8: "Elite learner status! 🎓",
    9: "Almost at the top! One more push! 🚀",
    10: "LEGENDARY! You've mastered the basics! 👑",
  };

  return messages[level] || "Level up! You're amazing! 🎉";
}

/**
 * Calculate companion avatar stage based on level
 * @param level - Current level
 * @returns Avatar stage
 */
export function getAvatarForLevel(level: number): 'baby' | 'teen' | 'adult' {
  if (level <= 3) return 'baby';
  if (level <= 7) return 'teen';
  return 'adult';
}