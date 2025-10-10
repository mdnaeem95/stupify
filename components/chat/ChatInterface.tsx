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
import { 
  createConversation, 
  saveMessage, 
  loadConversation,
  generateConversationTitle,
  updateConversationTitle 
} from '@/lib/conversations';
import { getUserUsage, incrementUsage, type UsageData } from '@/lib/usage';

export function ChatInterface() {
  const [simplicityLevel, setSimplicityLevel] = useState<SimplicityLevel>('normal');
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMessageRef = useRef(true);
  const conversationIdRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI SDK v5 useChat with transport
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        simplicityLevel,
      },
    }),
    onFinish: async ({ message }) => {
      console.log('🤖 ChatInterface: AI response finished', {
        role: message.role,
        hasConversationId: !!conversationIdRef.current
      })
      
      if (conversationIdRef.current && message.role === 'assistant') {
        const content = message.parts
          ?.filter(part => part.type === 'text')
          .map(part => part.text)
          .join('') || '';
        
        console.log('💾 ChatInterface: Saving assistant message', {
          conversationId: conversationIdRef.current,
          contentLength: content.length,
          simplicityLevel
        })
        
        const saved = await saveMessage(conversationIdRef.current, 'assistant', content, simplicityLevel);
        
        if (saved) {
          console.log('✅ ChatInterface: Assistant message saved successfully')
        } else {
          console.error('❌ ChatInterface: Failed to save assistant message!')
        }
      } else {
        console.warn('⚠️ ChatInterface: Cannot save assistant message', {
          hasConversationId: !!conversationIdRef.current,
          role: message.role
        })
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

    // CHECK USAGE LIMIT BEFORE SENDING
    console.log('📊 ChatInterface: Checking usage limits')
    const currentUsage = await getUserUsage();
    
    if (!currentUsage.canAsk) {
      console.warn('⚠️ ChatInterface: Usage limit reached, showing paywall')
      setShowPaywall(true);
      return;
    }
    
    console.log('✅ ChatInterface: Usage check passed', {
      remaining: currentUsage.remaining,
      canAsk: currentUsage.canAsk
    })

    const messageText = input.trim();
    console.log('📤 ChatInterface: Submitting message', { 
      hasConversation: !!conversationId,
      conversationId,
      messageLength: messageText.length 
    })

    let activeConvId = conversationId;

    // Create conversation on first message
    if (!conversationId) {
      console.log('🆕 ChatInterface: Creating new conversation for first message')
      setIsSaving(true);
      const newConvId = await createConversation('New Chat');
      
      if (newConvId) {
        console.log('✅ ChatInterface: New conversation created', { newConvId })
        updateConversationId(newConvId);
        activeConvId = newConvId;
        
        window.dispatchEvent(new Event('refreshSidebar'));
        
        setTimeout(async () => {
          const title = generateConversationTitle(messageText);
          console.log('📝 ChatInterface: Updating conversation title', { title })
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

    // Save user message to database
    console.log('💾 ChatInterface: Saving user message to database', {
      conversationId: activeConvId,
      messageLength: messageText.length,
      simplicityLevel
    })
    
    if (activeConvId) {
      const saved = await saveMessage(activeConvId, 'user', messageText, simplicityLevel);
      if (saved) {
        console.log('✅ ChatInterface: User message saved successfully')
      } else {
        console.error('❌ ChatInterface: Failed to save user message!')
      }
    } else {
      console.error('❌ ChatInterface: No conversation ID available for saving!')
    }

    // INCREMENT USAGE COUNT
    console.log('📊 ChatInterface: Incrementing usage count')
    const incremented = await incrementUsage();
    if (incremented) {
      console.log('✅ ChatInterface: Usage incremented')
      loadUsage();
    } else {
      console.error('❌ ChatInterface: Failed to increment usage')
    }

    // Send message to AI
    console.log('🤖 ChatInterface: Sending message to AI...')
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
            /* Empty State - POLISHED */
            <div className="text-center space-y-8 py-12">
              {/* Icon */}
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                <Sparkles className="w-12 h-12 text-purple-600" />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Ask me anything
                </h2>
                <p className="text-gray-600 text-lg">
                  I&apos;ll explain it in a way that actually makes sense
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
                    />
                  );
                })}
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
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area - POLISHED */}
      <div className="bg-white border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
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
                className="w-full overflow-hidden resize-none rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || isSaving || isLoadingConversation}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all h-12 flex-shrink-0 mb-1"
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