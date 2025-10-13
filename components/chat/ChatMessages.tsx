/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { AdaptiveFollowUp } from './AdaptiveFollowUp';
import { FollowUpQuestion } from '@/lib/question-predictor';
import { extractMessageText } from '@/lib/utils';

interface ChatMessagesProps {
  messages: any[];
  isLoading: boolean;
  followUpQuestions: FollowUpQuestion[];
  loadingFollowUp: boolean;
  onFollowUpClick: (question: string) => void;
  onAnalogyRating: (messageId: string, rating: 'up' | 'down') => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  isLoading,
  followUpQuestions,
  loadingFollowUp,
  onFollowUpClick,
  onAnalogyRating,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <>
      {messages
        .filter((message) => message.role !== 'system')
        .map((message) => {
          const content = extractMessageText(message);

          return (
            <MessageBubble
              key={message.id}
              role={message.role as 'user' | 'assistant'}
              content={content}
              messageId={message.id}
              onRate={message.role === 'assistant' ? onAnalogyRating : undefined}
            />
          );
        })}

      {/* Loading Animation */}
      {isLoading && (
        <div className="flex gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          <div className="flex-1 max-w-[80%] px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
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