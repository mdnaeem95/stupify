/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { AdaptiveFollowUp } from './AdaptiveFollowUp';
import { FollowUpQuestion } from '@/lib/question-predictor';
import { extractMessageText } from '@/lib/utils';
import { SimplicityLevel } from '@/lib/prompts';

interface ChatMessagesProps {
  messages: any[];
  isLoading: boolean;
  followUpQuestions: FollowUpQuestion[];
  loadingFollowUp: boolean;
  onFollowUpClick: (question: string) => void;
  onAnalogyRating: (messageId: string, rating: 'up' | 'down') => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  conversationId?: string | null;
  simplicityLevel: SimplicityLevel;
  isMobile?: boolean;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
}

export function ChatMessages({
  messages,
  isLoading,
  followUpQuestions,
  loadingFollowUp,
  onFollowUpClick,
  onAnalogyRating,
  messagesEndRef,
  conversationId,
  simplicityLevel,
  isMobile,
  triggerHaptic
}: ChatMessagesProps) {
  return (
    <>
      {messages
        .filter((message) => message.role !== 'system')
        .map((message, index) => {
          const content = extractMessageText(message);

          // Find the previous user message for assistant responses (for share feature)
          let previousUserMessage: string | undefined;
          if (message.role === 'assistant') {
            // Look backwards to find the most recent user message
            for (let i = index - 1; i >= 0; i--) {
              if (messages[i].role === 'user') {
                previousUserMessage = extractMessageText(messages[i]);
                break;
              }
            }
          }

          return (
            <MessageBubble
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={content}
              messageId={message.id}
              onRate={message.role === 'assistant' ? onAnalogyRating : undefined}
              conversationId={conversationId || undefined}
              simplicityLevel={simplicityLevel}
              previousUserMessage={previousUserMessage}
              isMobile={isMobile}
              triggerHaptic={triggerHaptic}
            />
          );
        })}

      {/* Loading Animation - Redesigned */}
      {isLoading && (
        <div className="flex gap-3 mb-6">
          {/* Avatar with gradient glow */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full blur-md opacity-30" />
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Loader2 className="w-5 h-5 text-white animate-spin" strokeWidth={2.5} />
            </div>
          </div>

          {/* Loading bubble */}
          <div className="flex-1 max-w-[80%] px-5 py-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 rounded-tl-sm border border-indigo-100">
            <div className="flex gap-1.5">
              <span
                className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Adaptive Follow-Up */}
      {messages.length > 0 && !isLoading && (
        <AdaptiveFollowUp
          questions={followUpQuestions}
          onQuestionClick={onFollowUpClick}
          isLoading={loadingFollowUp}
        />
      )}

      <div ref={messagesEndRef} />
    </>
  );
}