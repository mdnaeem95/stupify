// components/chat/MessageBubble.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, User, Share2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareModal } from '@/components/shareable/ShareModal';
import { ShareUpgradeModal } from '@/components/shareable/ShareUpgradeModal';
import { AnalogyRating } from './AnalogyRatings';
import { SimplicityLevel } from '@/lib/prompts-v2';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  conversationId?: string;
  simplicityLevel?: SimplicityLevel;
  previousUserMessage?: string;
  onRate?: (messageId: string, rating: 'up' | 'down') => void;
  isMobile?: boolean;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
  userTier?: 'free' | 'starter' | 'premium'; // NEW
}

export function MessageBubble({ 
  role, 
  content,
  messageId,
  conversationId,
  simplicityLevel = 'normal',
  previousUserMessage,
  onRate,
  isMobile,
  triggerHaptic,
  userTier = 'free', // NEW
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // NEW
  const [isSaving, setIsSaving] = useState(false);
  const [savedExplanationId, setSavedExplanationId] = useState<string | null>(null);

  // Check if sharing is locked
  const isShareLocked = userTier === 'free'; // NEW

  const handleShareClick = async () => {
    if (!previousUserMessage || !messageId) return;
    
    // Show upgrade modal for free users
    if (isShareLocked) {
      setShowUpgradeModal(true);
      if (isMobile && triggerHaptic) triggerHaptic('medium');
      return;
    }
    
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
        'flex gap-3 mb-6 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center relative',
          isUser 
            ? 'bg-gray-100' 
            : ''
        )}>
          {isUser ? (
            <User className="w-5 h-5 text-gray-700" strokeWidth={2} />
          ) : (
            <>
              {/* Ambient glow for AI avatar */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full blur-md opacity-30" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </>
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'flex-1 max-w-[85%] md:max-w-[80%]',
        )}>
          <div className={cn(
            'px-5 py-3.5 rounded-2xl',
            isUser 
              ? 'bg-gray-100 text-gray-900 rounded-tr-sm border border-gray-200' 
              : 'bg-gradient-to-br from-indigo-50 to-violet-50 text-gray-900 rounded-tl-sm border border-indigo-100'
          )}>
            <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </div>
          </div>

          {/* Action Buttons - Only for assistant messages */}
          {!isUser && messageId && (
            <div className={`
              mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 
              ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
              transition-opacity
            `}>
              {/* Share Button */}
              {previousUserMessage && (
                <div className="relative group/share">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleShareClick();
                      if (isMobile && triggerHaptic) triggerHaptic('light');
                    }}
                    disabled={isSaving}
                    className={cn(
                      'transition-colors font-medium min-h-[44px] min-w-[44px]',
                      isMobile ? 'w-full justify-center' : '',
                      isShareLocked 
                        ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-50' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    )}
                  >
                    {isShareLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" strokeWidth={2} />
                        Share (Upgrade)
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" strokeWidth={2} />
                        {isSaving ? 'Saving...' : 'Share'}
                      </>
                    )}
                  </Button>
                  
                  {/* Tooltip for locked state - desktop only */}
                  {isShareLocked && !isMobile && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover/share:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                      🔒 Upgrade to share
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AnalogyRating */}
      {role === 'assistant' && messageId && onRate && (
        <div className={isMobile ? 'w-full' : ''}>
          <AnalogyRating
            messageId={messageId}
            onRate={(rating) => {
              onRate(messageId, rating as 'up' | 'down');
              if (isMobile && triggerHaptic) triggerHaptic('light');
            }}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Share Modal - for paid users */}
      {showShareModal && previousUserMessage && !isShareLocked && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          question={previousUserMessage}
          answer={content}
          level={simplicityLevel}
          explanationId={savedExplanationId || undefined}
        />
      )}

      {/* Share Upgrade Modal - for free users */}
      <ShareUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}