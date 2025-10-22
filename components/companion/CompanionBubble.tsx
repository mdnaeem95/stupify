/* eslint-disable  @typescript-eslint/no-explicit-any */
// ============================================================================
// STUPIFY AI COMPANION FEATURE - COMPANION BUBBLE
// Created: October 22, 2025
// Version: 1.0
// Description: Floating companion bubble in bottom-right corner
// ============================================================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { ARCHETYPE_EMOJIS } from '@/lib/companion/types';
import type { Companion } from '@/lib/companion/types';

interface CompanionBubbleProps {
  companion: Companion;
  unreadCount?: number;
  onClick?: () => void;
  onClose?: () => void;
  isExpanded?: boolean;
}

/**
 * CompanionBubble - Floating companion UI element
 * 
 * Features:
 * - Shows companion avatar/emoji
 * - Displays level badge
 * - Shows unread message count
 * - Animated entrance
 * - Pulse animation for unread messages
 * - Click to expand
 * - Respects mobile safe areas
 */
export function CompanionBubble({
  companion,
  unreadCount = 0,
  onClick,
  onClose,
  isExpanded = false,
}: CompanionBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get emoji for companion archetype
  const emoji = ARCHETYPE_EMOJIS[companion.archetype];

  // Determine if companion needs attention (unread messages)
  const needsAttention = unreadCount > 0;

  return (
    <AnimatePresence>
      {!isExpanded && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          style={{
            // Respect safe areas on mobile
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          {/* Main bubble button */}
          <motion.button
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex h-16 w-16 items-center justify-center rounded-full
              bg-gradient-to-br from-purple-500 to-blue-500
              shadow-lg transition-all duration-300
              hover:shadow-xl hover:shadow-purple-500/50
              ${needsAttention ? 'animate-pulse' : ''}
            `}
            aria-label={`Open companion - ${companion.name}`}
          >
            {/* Companion emoji/avatar */}
            <span className="text-3xl" role="img" aria-label={companion.archetype}>
              {emoji}
            </span>

            {/* Level badge */}
            <div
              className="
                absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center
                rounded-full bg-yellow-400 text-xs font-bold text-gray-900
                shadow-md ring-2 ring-white
              "
            >
              {companion.level}
            </div>

            {/* Unread count badge */}
            {needsAttention && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="
                  absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center
                  rounded-full bg-red-500 text-xs font-bold text-white
                  shadow-md ring-2 ring-white
                "
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}

            {/* Sparkle effect on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Tooltip on hover (desktop only) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="
                  absolute bottom-0 right-20 hidden whitespace-nowrap
                  rounded-lg bg-gray-900 px-3 py-2 text-sm text-white
                  shadow-lg md:block
                "
              >
                <div className="font-semibold">{companion.name}</div>
                <div className="text-xs text-gray-300">
                  Level {companion.level} • {companion.archetype}
                </div>
                {needsAttention && (
                  <div className="text-xs text-purple-300">
                    {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
                  </div>
                )}
                {/* Tooltip arrow */}
                <div
                  className="
                    absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 translate-x-full
                    border-8 border-transparent border-l-gray-900
                  "
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button (when companion can be dismissed) */}
          {onClose && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={(e: any) => {
                e.stopPropagation();
                onClose();
              }}
              className="
                absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center
                rounded-full bg-gray-800 text-white shadow-md
                hover:bg-gray-700 active:scale-90
              "
              aria-label="Dismiss companion"
            >
              <X className="h-3 w-3" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CompanionBubbleSkeleton - Loading state for companion bubble
 */
export function CompanionBubbleSkeleton() {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div
        className="
          h-16 w-16 animate-pulse rounded-full
          bg-gradient-to-br from-gray-300 to-gray-400
          shadow-lg
        "
      />
    </div>
  );
}

/**
 * CompanionBubbleError - Error state for companion bubble
 */
export function CompanionBubbleError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <button
        onClick={onRetry}
        className="
          flex h-16 w-16 items-center justify-center rounded-full
          bg-gradient-to-br from-red-500 to-red-600
          shadow-lg hover:shadow-xl
          transition-all duration-300
        "
        aria-label="Retry loading companion"
      >
        <span className="text-2xl">⚠️</span>
      </button>
    </div>
  );
}