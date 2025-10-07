'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { SimplifySelector } from './SimplifySelector';
import { MessageBubble } from './MessageBubble';
import { UsageBadge } from '@/components/usage/UsageBadge';
import { Paywall } from '@/components/usage/Paywall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles, Plus } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { UserMenu } from '@/components/layout/UserMenu';
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
  const conversationIdRef = useRef<string | null>(null); // ✅ Ref always has current value

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
        hasConversationId: !!conversationIdRef.current  // ✅ Use ref!
      })
      
      // Save assistant message to database
      // ✅ Use conversationIdRef.current - always has latest value!
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

  // ✅ Helper function to update both state and ref
  const updateConversationId = (newId: string | null) => {
    console.log('🔄 ChatInterface: Updating conversation ID', { 
      from: conversationId, 
      to: newId 
    })
    setConversationId(newId);
    conversationIdRef.current = newId;  // Keep ref in sync!
  };

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
    
    // Skip if already loading this conversation
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
      
      // Convert saved messages to UIMessage format
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
      updateConversationId(convId);  // ✅ Use helper
      isFirstMessageRef.current = false;
      
      console.log('✅ ChatInterface: Conversation loaded successfully')
    } catch (error) {
      console.error('❌ ChatInterface: Error loading conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // ✅ FIXED: Listen for events from layout
  useEffect(() => {
    console.log('🎧 ChatInterface: Setting up event listeners')

    // Handle NEW CHAT event
    const handleNewChatEvent = () => {
      console.log('🆕 ChatInterface: New chat event received')
      handleNewChat()
    }

    // Handle LOAD CONVERSATION event
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

    // Add event listeners
    console.log('🔌 ChatInterface: Adding event listeners to window')
    window.addEventListener('newChat', handleNewChatEvent)
    window.addEventListener('loadConversation', handleLoadConversationEvent as EventListener)
    
    console.log('✅ ChatInterface: Event listeners added')

    // Cleanup
    return () => {
      console.log('🧹 ChatInterface: Cleaning up event listeners')
      window.removeEventListener('newChat', handleNewChatEvent)
      window.removeEventListener('loadConversation', handleLoadConversationEvent as EventListener)
    }
  }, []) // Empty array - only set up once!

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    // ✅ CHECK USAGE LIMIT BEFORE SENDING
    console.log('📊 ChatInterface: Checking usage limits')
    const currentUsage = await getUserUsage();
    
    if (!currentUsage.canAsk) {
      console.warn('⚠️ ChatInterface: Usage limit reached, showing paywall')
      setShowPaywall(true);
      return; // Stop here - don't send message
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
        updateConversationId(newConvId);  // ✅ Use helper - updates both state and ref!
        activeConvId = newConvId; // ✅ IMPORTANT: Use this for saving below
        
        // Trigger sidebar refresh
        window.dispatchEvent(new Event('refreshSidebar'));
        
        // Update title with first message after a short delay
        setTimeout(async () => {
          const title = generateConversationTitle(messageText);
          console.log('📝 ChatInterface: Updating conversation title', { title })
          await updateConversationTitle(newConvId, title);
          // Refresh sidebar again after title update
          window.dispatchEvent(new Event('refreshSidebar'));
        }, 1000);
      } else {
        console.error('❌ ChatInterface: Failed to create conversation!')
        setIsSaving(false);
        return; // Don't continue if conversation creation failed
      }
      setIsSaving(false);
    }

    // Save user message to database FIRST (before sending to AI)
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

    // ✅ INCREMENT USAGE COUNT
    console.log('📊 ChatInterface: Incrementing usage count')
    const incremented = await incrementUsage();
    if (incremented) {
      console.log('✅ ChatInterface: Usage incremented')
      // Reload usage to update UI
      loadUsage();
    } else {
      console.error('❌ ChatInterface: Failed to increment usage')
    }

    // Send message to AI
    console.log('🤖 ChatInterface: Sending message to AI...')
    sendMessage({
      text: messageText,
    });

    // Clear input
    setInput('');
    isFirstMessageRef.current = false;
  };

  // Start a new chat
  const handleNewChat = () => {
    console.log('🆕 ChatInterface: Starting new chat')
    setMessages([]);
    updateConversationId(null);  // ✅ Use helper
    setInput('');
    isFirstMessageRef.current = true;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Paywall Modal */}
      {showPaywall && usage && (
        <Paywall limit={usage.limit} />
      )}

      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Stupify
                </h1>
                <p className="text-sm text-gray-600">Finally, an AI that speaks human</p>
              </div>
            </div>
            
            {/* Right side - Usage + New Chat + User Menu */}
            <div className="flex items-center gap-3">
              {/* Usage Badge */}
              {usage && (
                <UsageBadge 
                  remaining={usage.remaining} 
                  limit={usage.limit} 
                  isPremium={usage.isPremium}
                />
              )}
              
              {messages.length > 0 && (
                <Button
                  onClick={handleNewChat}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
        
        {/* Simplicity Selector */}
        <SimplifySelector selected={simplicityLevel} onSelect={setSimplicityLevel} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {isLoadingConversation ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Welcome to Stupify!</h2>
                <p className="text-gray-600 mb-6">
                  Ask me anything and I&apos;ll explain it in a way that actually makes sense.
                </p>
                <div className="grid gap-3 text-left">
                  <div className="bg-purple-100 border border-purple-300 p-4 rounded-lg">
                    <p className="font-medium text-purple-900">🧠 5 years old mode</p>
                    <p className="text-sm text-purple-800">Super simple words, fun analogies</p>
                  </div>
                  <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg">
                    <p className="font-medium text-blue-900">🤔 Normal person mode</p>
                    <p className="text-sm text-blue-800">Clear explanations, no jargon</p>
                  </div>
                  <div className="bg-green-100 border border-green-300 p-4 rounded-lg">
                    <p className="font-medium text-green-900">💼 Advanced mode</p>
                    <p className="text-sm text-green-800">More depth, still crystal clear</p>
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

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 h-12 text-base border-2 border-gray-300 focus:border-blue-500 text-black"
              disabled={isLoading || isSaving || isLoadingConversation}
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={isLoading || !input.trim() || isSaving || isLoadingConversation}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
            >
              {isLoading || isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {conversationId ? '✓ Conversation saved' : 'Conversations are saved automatically'}
          </p>
        </div>
      </div>
    </div>
  );
}