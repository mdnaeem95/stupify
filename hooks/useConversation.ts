/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback } from 'react';
import { 
  createConversation, 
  saveMessage, 
  loadConversation, 
  generateConversationTitle, 
  updateConversationTitle,
  canCreateConversation // NEW: Import limit checker
} from '@/lib/chat/conversations';
import { SimplicityLevel } from '@/lib/prompts/prompts';
import { convertToUIMessages, dispatchCustomEvent } from '@/lib/utils';

export function useConversation() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const isFirstMessageRef = useRef(true);

  // UNCHANGED: Update both state and ref
  const updateConversationId = useCallback((newId: string | null) => {
    console.log('🔄 Updating conversation ID', { from: conversationId, to: newId });
    setConversationId(newId);
    conversationIdRef.current = newId;
  }, [conversationId]);

  // UPDATED: Create new conversation (now checks limits)
  const createNew = useCallback(async (initialMessage: string) => {
    console.log('🆕 Creating new conversation', { initialMessage });

    // NEW: Check if user can create a conversation
    const check = await canCreateConversation();

    if (!check.canCreate) {
      console.error('❌ Cannot create conversation:', check.reason);
      
      // Show user-friendly message based on tier
      if (check.limit !== null && check.currentCount !== undefined) {
        const tier = check.tier || 'free';
        const upgradeMessage = tier === 'free' 
          ? `\n\nUpgrade to save more conversations:\n• Starter: 50 conversations ($4.99/month)\n• Premium: Unlimited conversations ($9.99/month)`
          : `\n\nUpgrade to Premium for unlimited conversations ($9.99/month)`;
        
        alert(
          `You've reached your ${check.limit} conversation limit.${upgradeMessage}`
        );
      }
      
      return null;
    }

    console.log('✅ Conversation limit check passed', {
      currentCount: check.currentCount,
      limit: check.limit,
      tier: check.tier,
      remaining: check.limit ? check.limit - (check.currentCount || 0) : 'unlimited'
    });

    setIsSaving(true);
    const newConvId = await createConversation('New Chat');

    if (newConvId) {
      updateConversationId(newConvId);
      dispatchCustomEvent('refreshSidebar');

      // Update title after a short delay
      setTimeout(async () => {
        const title = generateConversationTitle(initialMessage);
        await updateConversationTitle(newConvId, title);
        dispatchCustomEvent('refreshSidebar');
      }, 1000);

      console.log('✅ Conversation created successfully', { 
        conversationId: newConvId,
        tier: check.tier,
        remaining: check.limit ? check.limit - (check.currentCount || 0) - 1 : 'unlimited'
      });
    } else {
      console.error('❌ Failed to create conversation!');
      setIsSaving(false);
      return null;
    }

    setIsSaving(false);
    return newConvId;
  }, [updateConversationId]);

  // UNCHANGED: Load existing conversation
  const load = useCallback(async (convId: string, setMessages: (messages: any[]) => void) => {
    if (convId === conversationId) {
      console.log('⏭️ Already on this conversation, skipping');
      return;
    }

    setIsLoadingConversation(true);

    try {
      console.log('🔍 Fetching messages from database...');
      const savedMessages = await loadConversation(convId);
      console.log('✅ Messages fetched', { messageCount: savedMessages.length });

      const uiMessages = convertToUIMessages(savedMessages);
      setMessages(uiMessages);
      updateConversationId(convId);
      isFirstMessageRef.current = false;

      console.log('✅ Conversation loaded successfully');
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  }, [conversationId, updateConversationId]);

  // UNCHANGED: Save message to database
  const save = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    level: SimplicityLevel
  ) => {
    if (!conversationIdRef.current) {
      console.error('❌ No conversation ID available for saving!');
      return false;
    }

    const saved = await saveMessage(conversationIdRef.current, role, content, level);
    
    if (saved) {
      console.log(`✅ ${role} message saved successfully`);
    } else {
      console.error(`❌ Failed to save ${role} message!`);
    }

    return saved;
  }, []);

  // UNCHANGED: Start new chat
  const reset = useCallback(() => {
    console.log('🆕 Starting new chat');
    updateConversationId(null);
    isFirstMessageRef.current = true;
  }, [updateConversationId]);

  return {
    conversationId,
    conversationIdRef,
    isLoadingConversation,
    isSaving,
    isFirstMessage: isFirstMessageRef.current,
    createNew,
    load,
    save,
    reset,
    updateConversationId,
  };
}