import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { autoResizeTextarea } from '@/lib/utils';

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
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    autoResizeTextarea(textareaRef.current);
  }, [input]);

  const isDisabled = isLoading || isSaving || isLoadingConversation;

  return (
    <div 
      className={`
        bg-white border-t border-gray-200 shadow-lg
        ${isMobile ? 'fixed bottom-0 left-0 right-0 z-50' : 'relative'}
      `}
      style={{
        // Adjust for keyboard on mobile
        ...(isMobile && isKeyboardVisible ? {
          bottom: '0px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        } : {}),
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-4">
        <form onSubmit={onSubmit} className="flex gap-3 items-end">
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
              placeholder="Ask me anything..."
              rows={1}
              disabled={isDisabled}
              className="w-full overflow-hidden resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-all scrollbar-hide"
              style={{ minHeight: '44px', maxHeight: '200px', fontSize: isMobile ? '16px' : '14px' }}
            />
          </div>
          <Button
            type="submit"
            disabled={isDisabled || !input.trim()}
            onClick={() => isMobile && triggerHaptic && triggerHaptic('medium')}
            className="mb-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-6 shadow-md hover:shadow-lg transition-all h-12 flex-shrink-0 min-h-[44px] min-w-[44px]"
          >
            {isLoading || isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-2">
          {conversationId
            ? '✓ Conversation saved automatically'
            : 'Your conversation will be saved automatically'}
        </p>
      </div>
    </div>
  );
}