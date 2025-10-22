// ============================================================================
// STUPIFY AI COMPANION FEATURE - COMPANION MESSAGE
// Created: October 22, 2025
// Version: 1.0
// Description: Display companion messages in chat
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { ARCHETYPE_EMOJIS, MESSAGE_TYPE_DESCRIPTIONS } from '@/lib/companion/types';
import type { CompanionMessage as CompanionMessageType, CompanionArchetype } from '@/lib/companion/types';
import { formatDistanceToNow } from 'date-fns';

interface CompanionMessageProps {
  message: CompanionMessageType;
  archetype: CompanionArchetype;
  companionName: string;
  showTimestamp?: boolean;
  onMarkAsRead?: (messageId: string) => void;
  className?: string;
}

/**
 * CompanionMessage - Display a message from the companion
 * 
 * Features:
 * - Styled message bubble
 * - Shows companion emoji
 * - Different styles for proactive vs reactive messages
 * - Timestamp
 * - Unread indicator
 * - Animated entrance
 */
export function CompanionMessage({
  message,
  archetype,
  companionName,
  showTimestamp = true,
  onMarkAsRead,
  className = '',
}: CompanionMessageProps) {
  const emoji = ARCHETYPE_EMOJIS[archetype];

  // Get message type styling
  const getMessageStyle = () => {
    switch (message.message_type) {
      case 'milestone':
        return 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200';
      case 'celebration':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
      case 'encouragement':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'reminder':
        return 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200';
      case 'curiosity':
        return 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200';
      case 'suggestion':
        return 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
    }
  };

  // Handle marking as read
  const handleClick = () => {
    if (!message.was_read && onMarkAsRead) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative ${className}`}
      onClick={handleClick}
    >
      {/* Message container */}
      <div className="flex items-start gap-3">
        {/* Companion avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex-shrink-0"
        >
          <div
            className={`
              flex h-10 w-10 items-center justify-center rounded-full
              bg-gradient-to-br from-purple-500 to-blue-500
              shadow-md
            `}
          >
            <span className="text-xl">{emoji}</span>
          </div>
        </motion.div>

        {/* Message bubble */}
        <div className="flex-1 space-y-1">
          {/* Companion name and message type */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{companionName}</span>
            <span className="text-xs text-gray-500">
              {MESSAGE_TYPE_DESCRIPTIONS[message.message_type]}
            </span>
            {!message.was_read && (
              <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>

          {/* Message content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`
              rounded-2xl rounded-tl-none border p-4 shadow-sm
              ${getMessageStyle()}
            `}
          >
            <p className="text-sm leading-relaxed text-gray-800">
              {message.content}
            </p>
          </motion.div>

          {/* Timestamp */}
          {showTimestamp && (
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * CompanionMessageList - Display a list of companion messages
 */
export function CompanionMessageList({
  messages,
  archetype,
  companionName,
  onMarkAsRead,
  emptyState,
}: {
  messages: CompanionMessageType[];
  archetype: CompanionArchetype;
  companionName: string;
  onMarkAsRead?: (messageId: string) => void;
  emptyState?: React.ReactNode;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyState || (
          <>
            <div className="text-4xl mb-4">{ARCHETYPE_EMOJIS[archetype]}</div>
            <p className="text-gray-600">No messages yet!</p>
            <p className="text-sm text-gray-500">
              Keep learning and your companion will check in with you.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <CompanionMessage
          key={message.id}
          message={message}
          archetype={archetype}
          companionName={companionName}
          onMarkAsRead={onMarkAsRead}
          className={index !== messages.length - 1 ? 'pb-2 border-b border-gray-100' : ''}
        />
      ))}
    </div>
  );
}

/**
 * CompactCompanionMessage - Minimal message for notifications
 */
export function CompactCompanionMessage({
  message,
  archetype,
  companionName,
  onClick,
}: {
  message: CompanionMessageType;
  archetype: CompanionArchetype;
  companionName: string;
  onClick?: () => void;
}) {
  const emoji = ARCHETYPE_EMOJIS[archetype];

  return (
    <motion.button
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      onClick={onClick}
      className="
        flex w-full items-start gap-3 rounded-lg bg-white p-4
        shadow-lg hover:shadow-xl transition-shadow
        text-left
      "
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className="
            flex h-10 w-10 items-center justify-center rounded-full
            bg-gradient-to-br from-purple-500 to-blue-500
          "
        >
          <span className="text-xl">{emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{companionName}</span>
          {!message.was_read && (
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">
          {message.content}
        </p>
        <span className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </motion.button>
  );
}

/**
 * InlineLevelUpMessage - Special message for level ups in chat
 */
export function InlineLevelUpMessage({
  companionName,
  newLevel,
  archetype,
}: {
  companionName: string;
  newLevel: number;
  archetype: CompanionArchetype;
}) {
  const emoji = ARCHETYPE_EMOJIS[archetype];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="my-4 flex items-center justify-center"
    >
      <div
        className="
          flex items-center gap-3 rounded-full
          bg-gradient-to-r from-purple-500 to-blue-500
          px-6 py-3 shadow-lg
        "
      >
        <span className="text-2xl">{emoji}</span>
        <div className="text-white">
          <div className="text-sm font-semibold">{companionName} leveled up!</div>
          <div className="text-xs opacity-90">Now Level {newLevel}</div>
        </div>
        <span className="text-2xl">🎉</span>
      </div>
    </motion.div>
  );
}