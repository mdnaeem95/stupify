/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Loader2 } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { detectConfusion, getRetryInstructions } from '@/lib/confusion-detector';
import { Paywall } from '@/components/usage/Paywall';

// Custom Hooks
import { useConversation } from '../../hooks/useConversation';
import { useUsageTracking } from '../../hooks/useUsageTracking';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useFollowUpQuestions } from '../../hooks/useFollowUpQuestions';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useQuestionTracking } from '@/hooks/useGamification';
import { useGamificationNotifications } from '@/hooks/useGamification';

// Components
import { ChatHeader } from './ChatHeader';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { LevelSuggestion } from './LevelSuggestion';
import { RecordingIndicator } from '../voice/RecordingIndicator';
import { AchievementUnlockModal } from '@/components/gamification/AchievementUnlockModal';
import { MilestoneCelebration } from '@/components/gamification/MilestoneCelebration';

// Utils
import { extractMessageText } from '@/lib/utils';

export function ChatInterface() {
  // Local state
  const [input, setInput] = useState('');
  const [simplicityLevel, setSimplicityLevel] = useState<SimplicityLevel>('normal');
  const [, setIsRetrying] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserQuestionRef = useRef<string>('');

  // Custom hooks
  const conversation = useConversation();
  const usage = useUsageTracking();
  const profile = useUserProfile(simplicityLevel);
  const followUp = useFollowUpQuestions(simplicityLevel);
  const { isMobile, isIOS } = useMobileDetection();
  const { height: keyboardHeight, isVisible: isKeyboardVisible } = useKeyboardHeight();
  const { triggerHaptic } = useHapticFeedback();
  const gamification = useGamificationNotifications();
  const { trackQuestion } = useQuestionTracking();
  

  // ✨ ADD: Voice input hook
  const voice = useVoiceInput({
    onTranscript: (text) => {
      // Add transcript to input
      setInput((prev) => {
        const newValue = prev ? `${prev} ${text}` : text;
        return newValue.trim();
      });
    },
    onError: (error) => {
      console.error('Voice input error:', error);
    },
    autoStop: true,
    maxDuration: 60000,
    useWebSpeech: true,
  });
  
  // ✨ ADD: Voice button handler
  const handleVoiceClick = () => {
    if (voice.isRecording) {
      voice.stopRecording();
    } else {
      voice.startRecording();
    }
  };

  // AI SDK v5 useChat
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: (options: any) => ({
        simplicityLevel,
        // Add confusion handling metadata if needed
        confusionRetry: options.confusionRetry || false,
        retryInstructions: options.retryInstructions || null,
      }),
    }),
    onFinish: async ({ message }) => {
      if (conversation.conversationIdRef.current && message.role === 'assistant') {
        const content = extractMessageText(message);
        await conversation.save('assistant', content, simplicityLevel);

        // Generate follow-up questions
        const userQuestion = lastUserQuestionRef.current;
        if (userQuestion && content) {
          await followUp.generate(userQuestion, content);
        }
      }
    },
  });

  const isLoading = status === 'streaming';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for layout events
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      conversation.reset();
      setInput('');
    };

    const handleLoadConversation = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId: string }>;
      const convId = customEvent.detail?.conversationId;
      if (convId) {
        conversation.load(convId, setMessages);
      }
    };

    window.addEventListener('newChat', handleNewChat);
    window.addEventListener('loadConversation', handleLoadConversation as EventListener);

    return () => {
      window.removeEventListener('newChat', handleNewChat);
      window.removeEventListener('loadConversation', handleLoadConversation as EventListener);
    };
  }, [conversation, setMessages]);

  // Handle follow-up question click
  const handleFollowUpClick = (question: string) => {
    followUp.clear();
    setInput(question);
    handleSubmit(new Event('submit') as any);
  };

  // Handle analogy rating
  const handleAnalogyRating = async (messageId: string, rating: 'up' | 'down') => {
    try {
      const response = await fetch('/api/analogies/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          rating,
          conversationId: conversation.conversationIdRef.current,
        }),
      });

      if (!response.ok) throw new Error('Failed to save rating');
      console.log(`✅ Analogy rated: ${rating}`);
    } catch (error) {
      console.error('Failed to save analogy rating:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    if (isMobile) triggerHaptic('light');

    const userMessage = input.trim();
    lastUserQuestionRef.current = userMessage;
    await profile.trackQuestion(userMessage, simplicityLevel);

    // Check usage limit
    const canAsk = await usage.checkCanAsk();
    if (!canAsk) return;

    // Detect confusion
    const confusionSignal = detectConfusion(userMessage, lastUserQuestionRef.current);

    // Prepare send options
    const sendOptions: any = {
      text: userMessage, // Always send the clean user message
    };

    if (confusionSignal.isConfused && confusionSignal.confidence > 0.7) {
      console.log('😕 Confusion detected, auto-retrying');

      const { newLevel, instructions } = getRetryInstructions(confusionSignal, simplicityLevel);

      if (newLevel !== simplicityLevel) {
        setSimplicityLevel(newLevel);
      }

      // Send instructions separately to the API, not in the message
      sendOptions.confusionRetry = true;
      sendOptions.retryInstructions = instructions;
      setIsRetrying(true);
    } else {
      setIsRetrying(false);
    }

    // Create conversation if needed
    let activeConvId = conversation.conversationId;
    if (!activeConvId) {
      activeConvId = await conversation.createNew(userMessage);
      if (!activeConvId) return;
    }

    // Save user message (the clean version, not with instructions)
    await conversation.save('user', userMessage, simplicityLevel);

    // Increment usage
    await usage.increment();

    // Send message to AI with options
    sendMessage(sendOptions);
    setInput('');

    setTimeout(() => {
      gamification.checkNotifications();
    }, 1000);

    await trackQuestion();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Paywall Modal */}
      {usage.showPaywall && usage.usage && <Paywall limit={usage.usage.limit} />}

      {/* Header */}
      <ChatHeader simplicityLevel={simplicityLevel} onLevelChange={setSimplicityLevel} isMobile={isMobile} />

      {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            // Add padding when keyboard is visible on mobile
            paddingBottom: isMobile && isKeyboardVisible ? `${keyboardHeight}px` : '0px',
          }}
        >
        <div className="max-w-4xl mx-auto px-6 py-8">
          {conversation.isLoadingConversation ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <ChatEmptyState simplicityLevel={simplicityLevel} />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              followUpQuestions={followUp.followUpQuestions}
              loadingFollowUp={followUp.loadingFollowUp}
              onFollowUpClick={handleFollowUpClick}
              onAnalogyRating={handleAnalogyRating}
              messagesEndRef={messagesEndRef}
              conversationId={conversation.conversationId}
              simplicityLevel={simplicityLevel}
              isMobile={isMobile}
              triggerHaptic={triggerHaptic}
            />
          )}
        </div>
      </div>

      {/* Level Suggestion */}
      {profile.showLevelSuggestion && profile.suggestedLevel && (
        <LevelSuggestion
          suggestedLevel={profile.suggestedLevel}
          onAccept={() => {
            setSimplicityLevel(profile.suggestedLevel!);
            profile.setShowLevelSuggestion(false);
          }}
          onDismiss={() => profile.setShowLevelSuggestion(false)}
        />
      )}

      {/* Input Area */}
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isSaving={conversation.isSaving}
        isLoadingConversation={conversation.isLoadingConversation}
        conversationId={conversation.conversationId}
        isMobile={isMobile}
        isIOS={isIOS}
        isKeyboardVisible={isKeyboardVisible}
        keyboardHeight={keyboardHeight}
        triggerHaptic={triggerHaptic}
        voiceState={voice}
        onVoiceClick={handleVoiceClick}
      />

      <RecordingIndicator
        isVisible={voice.isRecording}
        duration={voice.duration}
        volume={voice.volume}
        interimTranscript={voice.interimTranscript}
        method={voice.method}
        onStop={() => voice.stopRecording()}
        onCancel={() => voice.cancelRecording()}
      />

      {/* NEW: Gamification modals */}
      <AchievementUnlockModal
        achievement={gamification.pendingAchievement}
        isOpen={gamification.showAchievementModal}
        onClose={gamification.closeAchievementModal}
      />

      <MilestoneCelebration
        milestone={gamification.currentMilestone || 0}
        isOpen={gamification.showMilestoneModal}
        onClose={gamification.closeMilestoneModal}
      />
    </div>
  );
}