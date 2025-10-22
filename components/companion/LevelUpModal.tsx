// ============================================================================
// STUPIFY AI COMPANION FEATURE - LEVEL UP MODAL
// Created: October 22, 2025
// Version: 1.0
// Description: Celebration modal when companion levels up
// ============================================================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { ARCHETYPE_EMOJIS, isMilestoneLevel, getLevelUpMessage } from '@/lib/companion/client';
import type { Companion } from '@/lib/companion/types';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  companion: Companion;
  oldLevel: number;
  newLevel: number;
  xpGained: number;
}

/**
 * LevelUpModal - Celebration modal for level ups
 * 
 * Features:
 * - Animated confetti
 * - Shows level progression
 * - Milestone indicators
 * - Celebratory message
 * - Avatar evolution indicator (if applicable)
 * - Continue button
 */
export function LevelUpModal({ isOpen, onClose, companion, oldLevel, newLevel, xpGained }: LevelUpModalProps) {
  const { width, height } = useWindowSize();
  const emoji = ARCHETYPE_EMOJIS[companion.archetype];
  const isMilestone = isMilestoneLevel(newLevel);
  const levelUpMsg = getLevelUpMessage(newLevel);

  // Check if avatar evolved
  const avatarEvolved = 
    (oldLevel <= 3 && newLevel > 3) || // Baby -> Teen
    (oldLevel <= 7 && newLevel > 7);   // Teen -> Adult

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-0 bg-transparent shadow-none p-0">
        {/* Confetti */}
        <AnimatePresence>
          {isOpen && (
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={isMilestone ? 500 : 200}
              gravity={0.3}
            />
          )}
        </AnimatePresence>

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10" />

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Milestone badge */}
            {isMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute -top-4 -right-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
                  <Trophy className="h-8 w-8 text-yellow-900" />
                </div>
              </motion.div>
            )}

            {/* Main emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-4 text-7xl"
            >
              {emoji}
            </motion.div>

            {/* Level up text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Level Up!
              </h2>
              <p className="text-lg text-gray-600">
                {companion.name} is now <span className="font-semibold text-purple-600">Level {newLevel}</span>!
              </p>
            </motion.div>

            {/* Level progression */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="my-6 flex items-center justify-center gap-4"
            >
              {/* Old level */}
              <div className="flex flex-col items-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-600">
                  {oldLevel}
                </div>
                <span className="text-xs text-gray-500">Previous</span>
              </div>

              {/* Arrow */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ArrowRight className="h-8 w-8 text-purple-500" />
              </motion.div>

              {/* New level */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-2xl font-bold text-white shadow-lg"
                >
                  {newLevel}
                </motion.div>
                <span className="text-xs font-semibold text-purple-600">New Level!</span>
              </div>
            </motion.div>

            {/* Celebratory message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-4"
            >
              <p className="text-sm font-medium text-gray-800">
                {levelUpMsg}
              </p>
            </motion.div>

            {/* Avatar evolution indicator */}
            {avatarEvolved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3"
              >
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-900">
                  Your companion evolved to {companion.current_avatar} stage!
                </span>
              </motion.div>
            )}

            {/* Milestone reward */}
            {isMilestone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border border-yellow-200"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Milestone Reached!</span>
                </div>
                <p className="text-sm text-yellow-800">
                  {newLevel === 5 && 'Halfway to mastery! Keep up the amazing work!'}
                  {newLevel === 10 && "You've completed the first chapter of your learning journey!"}
                </p>
              </motion.div>
            )}

            {/* XP gained */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-6 text-sm text-gray-600"
            >
              +{xpGained} XP earned
            </motion.div>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                size="lg"
              >
                Continue Learning
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * SimpleLevelUpToast - Minimal level up notification (alternative to modal)
 */
export function SimpleLevelUpToast({
  companionName,
  newLevel,
  archetype,
  onClose,
}: {
  companionName: string;
  newLevel: number;
  archetype: string;
  onClose: () => void;
}) {
  const emoji = ARCHETYPE_EMOJIS[archetype as keyof typeof ARCHETYPE_EMOJIS];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed bottom-24 right-6 z-50 max-w-sm"
    >
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{emoji}</div>
          <div className="flex-1 text-white">
            <div className="font-bold">Level Up!</div>
            <div className="text-sm opacity-90">
              {companionName} reached Level {newLevel}!
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}