/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback } from 'react';
import { createConversation, saveMessage, loadConversation, generateConversationTitle, updateConversationTitle } from '@/lib/conversations';
import { SimplicityLevel } from '@/lib/prompts';
import { convertToUIMessages, dispatchCustomEvent } from '@/lib/utils';

export function useConversation() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const isFirstMessageRef = useRef(true);

  // Update both state and ref
  const updateConversationId = useCallback((newId: string | null) => {
    console.log('🔄 Updating conversation ID', { from: conversationId, to: newId });
    setConversationId(newId);
    conversationIdRef.current = newId;
  }, [conversationId]);

  // Create new conversation
  const createNew = useCallback(async (initialMessage: string) => {
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
    } else {
      console.error('❌ Failed to create conversation!');
      setIsSaving(false);
      return null;
    }

    setIsSaving(false);
    return newConvId;
  }, [updateConversationId]);

  // Load existing conversation
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

  // Save message to database
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

  // Start new chat
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