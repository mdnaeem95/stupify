'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { autoResizeTextarea } from '@/lib/utils';
import { VoiceButton } from '../voice/VoiceButton';
import { VoiceUpgradeModal } from '../voice/VoiceUpgradeModal';
import type { UseVoiceInputReturn } from '@/hooks/useVoiceInput';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isSaving: boolean;
  isLoadingConversation: boolean;
  conversationId: string | null;
  isMobile?: boolean;
  isIOS?: boolean;
  isKeyboardVisible?: boolean;
  keyboardHeight?: number;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
  voiceState?: UseVoiceInputReturn;
  onVoiceClick?: () => void;
  userTier?: 'free' | 'starter' | 'premium'; // NEW
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  isSaving,
  isLoadingConversation,
  conversationId,
  isMobile,
  isKeyboardVisible,
  triggerHaptic,
  voiceState,
  onVoiceClick,
  userTier = 'free', // NEW
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // NEW

  // Auto-resize textarea
  useEffect(() => {
    autoResizeTextarea(textareaRef.current);
  }, [input]);

  const isDisabled = isLoading || isSaving || isLoadingConversation || voiceState?.isRecording;

  return (
    <>
      <div 
        className={`
          bg-white/80 backdrop-blur-xl
          ${isMobile ? 'fixed bottom-0 left-0 right-0 z-30' : 'relative'}
        `}
        style={{
          ...(isMobile && isKeyboardVisible ? {
            bottom: '0px',
            paddingBottom: 'env(safe-area-inset-bottom)',
          } : {}),
        }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={onSubmit} className="flex gap-3 items-center">

            {/* Voice Button */}
            {voiceState && onVoiceClick && (
              <div className='flex-shrink-0'>
                <VoiceButton
                  isRecording={voiceState.isRecording}
                  isProcessing={voiceState.isProcessing}
                  isSupported={voiceState.isSupported}
                  error={voiceState.error}
                  duration={voiceState.duration}
                  onClick={onVoiceClick}
                  disabled={isDisabled}
                  size={isMobile ? 'lg' : 'md'}
                  userTier={userTier} // NEW
                  onUpgradeClick={() => setShowUpgradeModal(true)} // NEW
                />
              </div>
            )}

            {/* Text Input Container */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                placeholder={
                  userTier === 'free'
                    ? "Ask me anything..."
                    : voiceState?.isSupported 
                      ? "Ask me anything... or use voice input" 
                      : "Ask me anything..."
                }
                rows={1}
                disabled={isDisabled}
                className="w-full overflow-hidden resize-none rounded-2xl bg-gray-50 px-5 py-3.5 text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all scrollbar-hide font-medium"
                style={{ 
                  minHeight: isMobile ? '48px' : '44px',
                  maxHeight: '200px', 
                  fontSize: isMobile ? '16px' : '15px' 
                }}
              />
            </div>

            {/* Send Button */}
            <div className='flex-shrink-0'>
              <Button
                type="submit"
                disabled={isDisabled || !input.trim()}
                onClick={() => isMobile && triggerHaptic && triggerHaptic('medium')}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  height: isMobile ? '48px' : '44px',
                  width: isMobile ? '48px' : '44px',
                }}
              >
                {isLoading || isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Send className="w-5 h-5" strokeWidth={2.5} />
                )}
              </Button>
            </div>
          </form>

          {/* Status Text */}
          <p className="text-xs text-gray-500 text-center mt-3">
            {conversationId
              ? 'Conversation saved automatically'
              : 'Your conversation will be saved automatically'}
          </p>
        </div>
      </div>

      {/* Upgrade Modal */}
      <VoiceUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userTier={userTier}
      />
    </>
  );
}