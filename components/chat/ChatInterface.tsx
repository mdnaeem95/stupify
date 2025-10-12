/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { SimplifySelector } from './SimplifySelector';
import { MessageBubble } from './MessageBubble';
import { Paywall } from '@/components/usage/Paywall';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { createConversation, saveMessage, loadConversation, generateConversationTitle, updateConversationTitle } from '@/lib/conversations';
import { extractTopics, getPersonalizedGreeting, suggestLevelAdjustment, type UserProfile } from '@/lib/user-profiler';
import { getUserUsage, incrementUsage, type UsageData } from '@/lib/usage';
import { FollowUpQuestion } from '@/lib/question-predictor';
import { AdaptiveFollowUp } from './AdaptiveFollowUp';
import { detectConfusion, getRetryInstructions } from '@/lib/confusion-detector';
import { createClient } from '@/lib/supabase/client';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [simplicityLevel, setSimplicityLevel] = useState<SimplicityLevel>('normal');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [, setLastAIResponse] = useState<string>('');
  const [, setIsRetrying] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [questionsThisSession, setQuestionsThisSession] = useState(0);
  const [showLevelSuggestion, setShowLevelSuggestion] = useState(false);
  const [suggestedLevel, setSuggestedLevel] = useState<SimplicityLevel | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMessageRef = useRef(true);
  const conversationIdRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastUserQuestionRef = useRef<string>('');

  // Function to generate follow-up questions
  async function generateFollowUpQuestions(userQuestion: string, aiResponse: string) {
    console.log('🔍 Generating follow-ups:', { userQuestion, aiResponse: aiResponse.slice(0, 100) });
    
    try {
      setLoadingFollowUp(true);
      
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion,
          aiResponse,
          simplicityLevel,
          usePattern: false
        })
      });

      console.log('📡 Follow-up API response:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Follow-up questions received:', data.questions);
        setFollowUpQuestions(data.questions);
      } else {
        console.error('❌ Follow-up API failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ Failed to generate follow-up questions:', error);
      setFollowUpQuestions([]);
    } finally {
      setLoadingFollowUp(false);
    }
  }

  // Function to handle follow-up question click
  function handleFollowUpClick(question: string) {
    setFollowUpQuestions([]); // Clear current questions
    setInput(question); // Set input to the question
    // Automatically submit or let user review
    handleSubmit(new Event('submit') as any); // Auto-submit
    // OR: Let them click send
    // setInput(question); // Just populate input
  }

  // Helper function to extract text from AI SDK v5 messages
  const extractMessageText = (message: any): string => {
    return message?.parts
      ?.filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('') || '';
  };

  // AI SDK v5 useChat with transport
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        simplicityLevel,
      },
    }),
    onFinish: async ({ message }) => {
      if (conversationIdRef.current && message.role === 'assistant') {
        const content = extractMessageText(message);
        setLastAIResponse(content);
        
        const saved = await saveMessage(
          conversationIdRef.current, 
          'assistant', 
          content, 
          simplicityLevel
        );
        
        if (saved) {
          console.log('✅ ChatInterface: Assistant message saved successfully');
        } else {
          console.error('❌ ChatInterface: Failed to save assistant message!');
        }

        // 🚨 YOU NEED TO ADD THIS SECTION:
        const userQuestion = lastUserQuestionRef.current;
        
        console.log('🎯 About to generate follow-ups:', { 
          userQuestion: userQuestion.slice(0, 50), 
          aiResponse: content.slice(0, 50) 
        });
        
        if (userQuestion && content) {
          await generateFollowUpQuestions(userQuestion, content);
        } else {
          console.warn('⚠️ Missing question or response for follow-ups');
        }
        // 🚨 END OF SECTION TO ADD
        
      } else {
        console.warn('⚠️ ChatInterface: Cannot save assistant message', {
          hasConversationId: !!conversationIdRef.current,
          role: message.role
        });
      }
    },
  });

  const isLoading = status === 'streaming';

  // Helper function to update both state and ref
  const updateConversationId = (newId: string | null) => {
    console.log('🔄 ChatInterface: Updating conversation ID', { 
      from: conversationId, 
      to: newId 
    })
    setConversationId(newId);
    conversationIdRef.current = newId;
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get known topics
      const { data: knowledgeData } = await supabase
        .from('user_knowledge_graph')
        .select('topic, questions_asked, understanding_level')
        .eq('user_id', user.id)
        .order('questions_asked', { ascending: false })
        .limit(10);

      // Get total questions and preferred level
      const { data: convos } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id);

      const totalQuestions = convos?.length || 0;
      const knownTopics = knowledgeData?.map(k => k.topic) || [];

      setUserProfile({
        userId: user.id,
        preferredLevel: simplicityLevel,
        knownTopics,
        vocabularyLevel: 5,
        totalQuestions,
        averageSessionLength: 0,
        lastActiveAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  async function trackQuestion(question: string, level: SimplicityLevel) {
    if (!userProfile) return;

    const topics = extractTopics(question);
    const supabase = createClient();

    // Update or insert topics
    for (const topic of topics) {
      await supabase.rpc('upsert_user_knowledge', {
        p_user_id: userProfile.userId,
        p_topic: topic
      });
    }

    // Update session count
    setQuestionsThisSession(prev => prev + 1);

    // Check if we should suggest level change
    if (questionsThisSession >= 5) {
      const avgUnderstanding = 7; // Calculate from knowledge graph
      const suggestion = suggestLevelAdjustment(level, avgUnderstanding, questionsThisSession);
      
      if (suggestion.shouldAdjust) {
        setSuggestedLevel(suggestion.newLevel);
        setShowLevelSuggestion(true);
      }
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load usage on mount
  useEffect(() => {
    loadUsage();
  }, []);

  // Helper to load usage
  const loadUsage = async () => {
    console.log('📊 ChatInterface: Loading usage data')
    const usageData = await getUserUsage();
    console.log('📊 ChatInterface: Usage loaded', usageData)
    setUsage(usageData);
  };

  // Load a specific conversation
  const handleLoadConversation = async (convId: string) => {
    console.log('📂 ChatInterface: handleLoadConversation called', { 
      convId, 
      currentConversationId: conversationId 
    })
    
    if (convId === conversationId) {
      console.log('⏭️ ChatInterface: Already on this conversation, skipping')
      return
    }
    
    setIsLoadingConversation(true);
    
    try {
      console.log('🔍 ChatInterface: Fetching messages from database...')
      const savedMessages = await loadConversation(convId);
      console.log('✅ ChatInterface: Messages fetched', { 
        messageCount: savedMessages.length,
        messages: savedMessages 
      })
      
      const uiMessages = savedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: [{ type: 'text' as const, text: msg.content }],
        createdAt: new Date(msg.created_at),
      }));

      console.log('🔄 ChatInterface: Setting messages and conversation ID', {
        messageCount: uiMessages.length,
        newConversationId: convId
      })
      
      setMessages(uiMessages);
      updateConversationId(convId);
      isFirstMessageRef.current = false;
      
      console.log('✅ ChatInterface: Conversation loaded successfully')
    } catch (error) {
      console.error('❌ ChatInterface: Error loading conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // Listen for events from layout
  useEffect(() => {
    console.log('🎧 ChatInterface: Setting up event listeners')

    const handleNewChatEvent = () => {
      console.log('🆕 ChatInterface: New chat event received')
      handleNewChat()
    }

    const handleLoadConversationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId: string }>
      const convId = customEvent.detail?.conversationId
      
      console.log('📂 ChatInterface: Load conversation event received', { 
        conversationId: convId,
        eventType: event.type,
        hasDetail: !!customEvent.detail 
      })
      
      if (convId) {
        console.log('✅ ChatInterface: Valid conversation ID, calling handleLoadConversation')
        handleLoadConversation(convId)
      } else {
        console.error('❌ ChatInterface: No conversation ID in event', customEvent)
      }
    }

    console.log('🔌 ChatInterface: Adding event listeners to window')
    window.addEventListener('newChat', handleNewChatEvent)
    window.addEventListener('loadConversation', handleLoadConversationEvent as EventListener)
    
    console.log('✅ ChatInterface: Event listeners added')

    return () => {
      console.log('🧹 ChatInterface: Cleaning up event listeners')
      window.removeEventListener('newChat', handleNewChatEvent)
      window.removeEventListener('loadConversation', handleLoadConversationEvent as EventListener)
    }
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    lastUserQuestionRef.current = input.trim();
    await trackQuestion(input.trim(), simplicityLevel);

    // 🚨 DETECT CONFUSION
    const confusionSignal = detectConfusion(
      input.trim(), 
      lastUserQuestionRef.current
    );

    if (confusionSignal.isConfused && confusionSignal.confidence > 0.7) {
      console.log('😕 Confusion detected, auto-retrying');
      
      // Get instructions
      const { newLevel, instructions } = getRetryInstructions(
        confusionSignal,
        simplicityLevel
      );
      
      // Switch level if needed
      if (newLevel !== simplicityLevel) {
        setSimplicityLevel(newLevel);
      }
      
      // Prepend retry context to their message
      const messageWithContext = `[User is confused about previous answer. ${instructions}]\n\nUser says: "${input.trim()}"`;
      
      setIsRetrying(true);
      setInput('');
      lastUserQuestionRef.current = messageWithContext;
      
      // Send message (useChat will handle it)
      // Your existing code here...
    } else {
      setIsRetrying(false);
      // Your existing normal flow
    }

    // CHECK USAGE LIMIT BEFORE SENDING
    const currentUsage = await getUserUsage();
    
    if (!currentUsage.canAsk) {
      console.warn('⚠️ ChatInterface: Usage limit reached, showing paywall')
      setShowPaywall(true);
      return;
    }

    const messageText = input.trim();
    let activeConvId = conversationId;

    // Create conversation on first message
    if (!conversationId) {
      setIsSaving(true);
      const newConvId = await createConversation('New Chat');
      
      if (newConvId) {
        updateConversationId(newConvId);
        activeConvId = newConvId;
        
        window.dispatchEvent(new Event('refreshSidebar'));
        
        setTimeout(async () => {
          const title = generateConversationTitle(messageText);
          await updateConversationTitle(newConvId, title);
          window.dispatchEvent(new Event('refreshSidebar'));
        }, 1000);
      } else {
        console.error('❌ ChatInterface: Failed to create conversation!')
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }
    
    if (activeConvId) {
      await saveMessage(activeConvId, 'user', messageText, simplicityLevel);
    } else {
      console.error('❌ ChatInterface: No conversation ID available for saving!')
    }

    // INCREMENT USAGE COUNT
    const incremented = await incrementUsage();
    if (incremented) {
      loadUsage();
    } else {
      console.error('❌ ChatInterface: Failed to increment usage')
    }

    // Send message to AI
    sendMessage({
      text: messageText,
    });

    setInput('');
    isFirstMessageRef.current = false;
  };

  // Start a new chat
  const handleNewChat = () => {
    console.log('🆕 ChatInterface: Starting new chat')
    setMessages([]);
    updateConversationId(null);
    setInput('');
    isFirstMessageRef.current = true;
  };

  const handleAnalogyRating = async (messageId: string, rating: 'up' | 'down') => {
    try {
      const response = await fetch('/api/analogies/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          rating,
          conversationId: conversationIdRef.current,
        }),
      });

      if (!response.ok) throw new Error('Failed to save rating');
      
      console.log(`✅ Analogy rated: ${rating}`);
      
      // Optional: Track analytics
      // trackEvent('analogy_rated', { rating, messageId });
      
    } catch (error) {
      console.error('Failed to save analogy rating:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Paywall Modal */}
      {showPaywall && usage && (
        <Paywall limit={usage.limit} />
      )}

      {/* Header - SIMPLIFIED */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Stupify
                </h1>
                <p className="text-xs text-gray-500">Finally, an AI that speaks human</p>
              </div>
            </div>
            
            {/* Mode Selector Only */}
            <SimplifySelector selected={simplicityLevel} onSelect={setSimplicityLevel} />
          </div>
        </div>
      </div>

      {/* Messages Area - POLISHED */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {isLoadingConversation ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State - WITH BLINKY MASCOT */
            <div className="text-center space-y-8 py-12">
              {messages.length === 0 && userProfile && (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getPersonalizedGreeting(userProfile)}
                  </h2>
                </div>
              )}

              {/* Blinky Mascot */}
              <div className="mx-auto w-48">
                <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#a855f7',stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                    </linearGradient>
                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#fbbf24',stopOpacity:0.8}} />
                      <stop offset="100%" style={{stopColor:'#f59e0b',stopOpacity:0.6}} />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="80" r="55" fill="url(#glowGradient)" opacity="0.3">
                    <animate attributeName="r" values="55;60;55" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <path d="M 100 30 C 75 30, 60 45, 60 70 C 60 85, 65 95, 70 105 L 70 115 L 130 115 L 130 105 C 135 95, 140 85, 140 70 C 140 45, 125 30, 100 30 Z" 
                        fill="url(#bulbGradient)" stroke="#6366f1" strokeWidth="2"/>
                  <ellipse cx="85" cy="55" rx="15" ry="20" fill="white" opacity="0.4"/>
                  <ellipse cx="90" cy="50" rx="8" ry="10" fill="white" opacity="0.6"/>
                  <rect x="75" y="115" width="50" height="8" fill="#cbd5e1" rx="2"/>
                  <rect x="75" y="125" width="50" height="8" fill="#94a3b8" rx="2"/>
                  <rect x="75" y="135" width="50" height="8" fill="#cbd5e1" rx="2"/>
                  <rect x="80" y="145" width="40" height="12" fill="#64748b" rx="3"/>
                  <g>
                    <circle cx="85" cy="75" r="5" fill="#1e293b"/>
                    <circle cx="87" cy="73" r="2" fill="white"/>
                    <circle cx="115" cy="75" r="5" fill="#1e293b"/>
                    <circle cx="117" cy="73" r="2" fill="white"/>
                    <path d="M 80 90 Q 100 105, 120 90" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <circle cx="70" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
                    <circle cx="130" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
                  </g>
                  <path d="M 60 90 Q 45 85, 35 95" stroke="#6366f1" strokeWidth="6" fill="none" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 60 90" to="15 60 90" dur="0.5s" repeatCount="indefinite" direction="alternate"/>
                  </path>
                  <circle cx="35" cy="95" r="5" fill="#6366f1">
                    <animateTransform attributeName="transform" type="rotate" from="0 60 90" to="15 60 90" dur="0.5s" repeatCount="indefinite" direction="alternate"/>
                  </circle>
                  <g>
                    <path d="M 145 45 L 147 50 L 152 52 L 147 54 L 145 59 L 143 54 L 138 52 L 143 50 Z" fill="#fbbf24">
                      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M 55 50 L 57 55 L 62 57 L 57 59 L 55 64 L 53 59 L 48 57 L 53 55 Z" fill="#fbbf24">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                    </path>
                    <path d="M 100 25 L 102 30 L 107 32 L 102 34 L 100 39 L 98 34 L 93 32 L 98 30 Z" fill="#fbbf24">
                      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                    </path>
                  </g>
                </svg>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Hey! I&apos;m Blinky 👋
                </h2>
                <p className="text-gray-600 text-lg">
                  Ask me anything and I&apos;ll explain it in a way that actually makes sense
                </p>
              </div>

              {/* Mode Info Cards - POLISHED */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
                <div className={`rounded-xl p-4 text-left border-2 transition-all ${
                  simplicityLevel === '5yo' 
                    ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200' 
                    : 'bg-purple-50 border-purple-200 hover:border-purple-300'
                }`}>
                  <div className="text-2xl mb-2">👶</div>
                  <div className="font-semibold text-sm text-purple-900 mb-1 flex items-center gap-2">
                    5 years old mode
                    {simplicityLevel === '5yo' && (
                      <span className="text-[10px] bg-purple-200 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <div className="text-xs text-purple-700">
                    Super simple words, fun analogies
                  </div>
                </div>

                <div className={`rounded-xl p-4 text-left border-2 transition-all ${
                  simplicityLevel === 'normal' 
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200' 
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                }`}>
                  <div className="text-2xl mb-2">🤓</div>
                  <div className="font-semibold text-sm text-blue-900 mb-1 flex items-center gap-2">
                    Normal person mode
                    {simplicityLevel === 'normal' && (
                      <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <div className="text-xs text-blue-700">
                    Clear explanations, no jargon
                  </div>
                </div>

                <div className={`rounded-xl p-4 text-left border-2 transition-all ${
                  simplicityLevel === 'advanced' 
                    ? 'bg-green-50 border-green-400 ring-2 ring-green-200' 
                    : 'bg-green-50 border-green-200 hover:border-green-300'
                }`}>
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-semibold text-sm text-green-900 mb-1 flex items-center gap-2">
                    Advanced mode
                    {simplicityLevel === 'advanced' && (
                      <span className="text-[10px] bg-green-200 px-1.5 py-0.5 rounded">Active</span>
                    )}
                  </div>
                  <div className="text-xs text-green-700">
                    More depth, still crystal clear
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages
                .filter(message => message.role !== 'system')
                .map((message) => {
                  const content = message.parts
                    ?.filter(part => part.type === 'text')
                    .map(part => part.text)
                    .join('') || '';
                  
                  return (
                    <MessageBubble
                      key={message.id}
                      role={message.role as 'user' | 'assistant'}
                      content={content}
                      messageId={message.id}
                      onRate={message.role === 'assistant' ? handleAnalogyRating : undefined} 
                    />
                  );
                })}

              {/* LOADING ANIMATION - Show while AI is responding */}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <div className="flex-1 max-w-[80%] px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ADAPTIVE FOLLOW-UP - Show after AI finishes responding */}
              {messages.length > 0 && !isLoading && (
                <AdaptiveFollowUp
                  questions={followUpQuestions}
                  onQuestionClick={handleFollowUpClick}
                  isLoading={loadingFollowUp}
                />
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {showLevelSuggestion && suggestedLevel && (
        <div className="max-w-4xl mx-auto px-6 mb-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                💡 You&apos;re doing great! Want to try {suggestedLevel === 'advanced' ? 'more detailed' : 'simpler'} explanations?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSimplicityLevel(suggestedLevel);
                  setShowLevelSuggestion(false);
                }}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                Yes, switch
              </button>
              <button
                onClick={() => setShowLevelSuggestion(false)}
                className="px-3 py-1 bg-white text-purple-600 text-sm rounded-lg border border-purple-200 hover:bg-purple-50"
              >
                No thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area - POLISHED */}
      <div className="bg-white border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask me anything..."
                rows={1}
                disabled={isLoading || isSaving || isLoadingConversation}
                className="w-full overflow-hidden resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-all scrollbar-hide"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || isSaving || isLoadingConversation}
              className="mb-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-6 shadow-md hover:shadow-lg transition-all h-12 flex-shrink-0"
            >
              {isLoading || isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-2">
            {conversationId ? '✓ Conversation saved automatically' : 'Your conversation will be saved automatically'}
          </p>
        </div>
      </div>
    </div>
  );
}