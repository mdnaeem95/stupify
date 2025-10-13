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

      {/* Loading Animation */}
      {isLoading && (
        <div className="flex gap-2 md:gap-3 mb-4">
          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
          </div>
          <div className="flex-1 max-w-[80%] px-3 md:px-4 py-2 md:py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-bounce"
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