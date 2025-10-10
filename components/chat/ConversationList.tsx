'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { getUserConversations, deleteConversation, type Conversation } from '@/lib/conversations';
import { UserMenu } from '@/components/layout/UserMenu';
import { UsageBadge } from '@/components/usage/UsageBadge';
import { getUserUsage, type UsageData } from '@/lib/usage';

interface ConversationListProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number;
}

export function ConversationList({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  refreshTrigger,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    console.log('🔄 ConversationList: Refresh triggered', { refreshTrigger })
    loadConversations();
    loadUsage();
  }, [refreshTrigger]);

  const loadUsage = async () => {
    const usageData = await getUserUsage();
    setUsage(usageData);
  };

  const loadConversations = async () => {
    console.log('📋 ConversationList: Starting to load conversations')
    setIsLoading(true);
    setError(null);
    
    try {
      const convos = await getUserConversations();
      console.log('✅ ConversationList: Loaded conversations', { 
        count: convos.length,
        conversations: convos.map(c => ({ id: c.id, title: c.title }))
      })
      setConversations(convos);
    } catch (err) {
      console.error('❌ ConversationList: Error loading conversations', err)
      setError('Failed to load conversations. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('🗑️ ConversationList: Delete requested', { conversationId })
    
    if (!confirm('Delete this conversation?')) {
      console.log('❌ ConversationList: Delete cancelled by user')
      return
    }
    
    console.log('🗑️ ConversationList: Deleting conversation...')
    const success = await deleteConversation(conversationId);
    
    if (success) {
      console.log('✅ ConversationList: Conversation deleted successfully')
      setConversations(conversations.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        console.log('🆕 ConversationList: Current conversation deleted, creating new chat')
        onNewChat();
      }
    } else {
      console.error('❌ ConversationList: Failed to delete conversation')
      setError('Failed to delete conversation. Please try again.');
    }
  };

  if (isLoading) {
    console.log('⏳ ConversationList: Showing loading state')
    return (
      <div className="flex flex-col h-full bg-white border-gray-200/60">
        <div className="p-3 bg-white">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="p-2 space-y-1">
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('⚠️ ConversationList: Showing error state', { error })
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3 text-red-800 mb-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">Something went wrong</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
            <Button 
              onClick={loadConversations}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm h-9"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('📋 ConversationList: Rendering', { 
    conversationCount: conversations.length,
    currentConversationId 
  })

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h2 className="text-sm font-semibold text-gray-700">
            Your Chats
          </h2>
        </div>
        <Button
          onClick={() => {
            console.log('🆕 ConversationList: New Chat button clicked')
            onNewChat()
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-sm hover:shadow transition-all duration-200 rounded-lg h-10 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="bg-gray-100 p-5 rounded-2xl mb-3">
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              No conversations yet
            </h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
              Start your first chat to see your history here
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  console.log('🎯 ConversationList: Conversation selected', { 
                    conversationId: conversation.id,
                    title: conversation.title 
                  })
                  onSelectConversation(conversation.id)
                }}
                className={`group relative rounded-lg transition-colors duration-150 cursor-pointer ${
                  currentConversationId === conversation.id
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                      currentConversationId === conversation.id
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        currentConversationId === conversation.id
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-700'
                      }`}>
                        {conversation.title}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-gray-200 h-7 w-7 rounded-md flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - User Menu & Usage */}
      <div className="p-3 bg-white">
        <div className="space-y-3">
          {/* Usage Badge */}
          {usage && (
            <div className="flex justify-center">
              <UsageBadge 
                remaining={usage.remaining} 
                limit={usage.limit} 
                isPremium={usage.isPremium}
              />
            </div>
          )}
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}