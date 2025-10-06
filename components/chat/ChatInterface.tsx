'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { SimplifySelector } from './SimplifySelector';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles, Plus } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { createConversation, generateConversationTitle, saveMessage, updateConversationTitle } from '@/lib/conversations';

export function ChatInterface() {
  const [simplicityLevel, setSimplicityLevel] = useState<SimplicityLevel>('normal');
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMessageRef = useRef(true);

  // AI SDK v5 useChat with transport
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        simplicityLevel,
      },
    }),
    onFinish: async ({ message }) => {
      // Save the assistant message to the database
      if (conversationId && message.role === 'assistant') {
        const content = message.parts
          ?.filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('') || '';

          await saveMessage(conversationId, 'assistant', content, simplicityLevel);
      }
    },
  });

  const isLoading = status === 'streaming';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();

    // Create conversation on first message
    if (!conversationId) {
      setIsSaving(true);
      const newConvId = await createConversation('New Chat');
      if (newConvId) {
        setConversationId(newConvId);
        
        // Update title with first message after a short delay
        setTimeout(async () => {
          const title = generateConversationTitle(messageText);
          await updateConversationTitle(newConvId, title);
        }, 1000);
      }
      setIsSaving(false);
    }

    // Send message to AI
    sendMessage({
      text: messageText,
    });

    // Save user message to database
    if (conversationId) {
      await saveMessage(conversationId, 'user', messageText, simplicityLevel);
    }

    // Clear input
    setInput('');
    isFirstMessageRef.current = false;
  };

  // Start a new chat
  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput('');
    isFirstMessageRef.current = true;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-4">
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

                {/* New Chat Button */}
                {messages.length > 0 && (
                    <Button
                        onClick={handleNewChat}
                        variant="outline"
                        className='flex items-center gap-2 text-black'
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </Button>
                )}
            </div>
        </div>
        
        {/* Simplicity Selector */}
        <SimplifySelector selected={simplicityLevel} onSelect={setSimplicityLevel} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl mx-auto">
                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Welcome to Stupify!</h2>
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
              disabled={isLoading || isSaving}
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={isLoading || !input.trim() || isSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md"
            >
              {isLoading ? (
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