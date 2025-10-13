'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bot, User, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareModal } from '@/components/shareable/ShareModal';
import { AnalogyRating } from './AnalogyRatings';
import { SimplicityLevel } from '@/lib/prompts-v2';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  conversationId?: string;
  simplicityLevel?: SimplicityLevel;
  previousUserMessage?: string; // The question that prompted this response
  onRate?: (messageId: string, rating: 'up' | 'down') => void; // KEEP existing rating callback
}

export function MessageBubble({ 
  role, 
  content,
  messageId,
  conversationId,
  simplicityLevel = 'normal',
  previousUserMessage,
  onRate, // KEEP existing onRate prop
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedExplanationId, setSavedExplanationId] = useState<string | null>(null);

  const handleShareClick = async () => {
    if (!previousUserMessage || !messageId) return;
    
    // Save the explanation first
    setIsSaving(true);
    try {
      const response = await fetch('/api/share/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: previousUserMessage,
          answer: content,
          simplicityLevel,
          conversationId,
          messageId,
        }),
      });

      if (response.ok) {
        const { id } = await response.json();
        setSavedExplanationId(id);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Failed to save explanation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={cn(
        'flex gap-3 mb-4 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-500' : 'bg-purple-500'
        )}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'flex-1 max-w-[80%]',
        )}>
          <div className={cn(
            'px-4 py-3 rounded-2xl',
            isUser 
              ? 'bg-blue-500 text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-900 rounded-tl-none'
          )}>
            <div className="whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>

          {/* Action Buttons - Only for assistant messages */}
          {!isUser && messageId && (
            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Share Button - NEW */}
              {previousUserMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareClick}
                  disabled={isSaving}
                  className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Share'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AnalogyRating - KEEP existing functionality exactly as it was */}
      {role === 'assistant' && messageId && onRate && (
        <AnalogyRating
          messageId={messageId}
          onRate={onRate}
        />
      )}

      {/* Share Modal - NEW */}
      {showShareModal && previousUserMessage && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          question={previousUserMessage}
          answer={content}
          level={simplicityLevel}
          explanationId={savedExplanationId || undefined}
        />
      )}
    </>
  );
}