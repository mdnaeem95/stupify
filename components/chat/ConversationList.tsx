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
    console.log('🔄 ConversationList: Refresh triggered', { refreshTrigger });
    loadConversations();
    loadUsage();
  }, [refreshTrigger]);

  const loadUsage = async () => {
    const usageData = await getUserUsage();
    setUsage(usageData);
  };

  const loadConversations = async () => {
    console.log('📋 ConversationList: Starting to load conversations');
    setIsLoading(true);
    setError(null);
    
    try {
      const convos = await getUserConversations();
      console.log('✅ ConversationList: Loaded conversations', { 
        count: convos.length,
        conversations: convos.map(c => ({ id: c.id, title: c.title })),
      });
      setConversations(convos);
    } catch (err) {
      console.error('❌ ConversationList: Error loading conversations', err);
      setError('Failed to load conversations. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('🗑️ ConversationList: Delete requested', { conversationId });
    
    if (!confirm('Delete this conversation?')) {
      console.log('❌ ConversationList: Delete cancelled by user');
      return;
    }
    
    console.log('🗑️ ConversationList: Deleting conversation...');
    const success = await deleteConversation(conversationId);
    
    if (success) {
      console.log('✅ ConversationList: Conversation deleted successfully');
      setConversations(conversations.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        console.log('🆕 ConversationList: Current conversation deleted, creating new chat');
        onNewChat();
      }
    } else {
      console.error('❌ ConversationList: Failed to delete conversation');
      setError('Failed to delete conversation. Please try again.');
    }
  };

  if (isLoading) {
    console.log('⏳ ConversationList: Showing loading state');
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="p-4">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-11 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="p-3 space-y-2">
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('⚠️ ConversationList: Showing error state', { error });
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="p-4">
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="flex items-start gap-3 text-red-800 mb-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Something went wrong</p>
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
            <Button 
              onClick={loadConversations}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold h-10 rounded-xl"
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
    currentConversationId,
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-gray-50 sticky top-0 z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg blur-sm opacity-30" />
            <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Your Chats
          </h2>
        </div>
        <Button
          onClick={() => {
            console.log('🆕 ConversationList: New Chat button clicked');
            onNewChat();
          }}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 rounded-xl h-11 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-2xl rounded-full" />
              <div className="relative bg-gray-50 p-6 rounded-2xl">
                <MessageSquare className="w-10 h-10 text-gray-400" strokeWidth={2} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              No conversations yet
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-[200px]">
              Start your first chat to see your history here
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  console.log('🎯 ConversationList: Conversation selected', { 
                    conversationId: conversation.id,
                    title: conversation.title,
                  });
                  onSelectConversation(conversation.id);
                }}
                className={`group relative rounded-xl transition-all duration-200 cursor-pointer ${
                  currentConversationId === conversation.id
                    ? 'bg-gradient-to-br from-indigo-50 to-violet-50 shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 px-3 py-3">
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                      currentConversationId === conversation.id
                        ? 'text-indigo-600'
                        : 'text-gray-400'
                    }`} strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${
                        currentConversationId === conversation.id
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-700 font-medium'
                      }`}>
                        {conversation.title}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-600 h-8 w-8 rounded-lg flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - User Menu & Usage */}
      <div className="p-4 bg-gray-50">
        <div className="space-y-3">
          {/* Usage Badge */}
          {usage && (
            <div className="flex justify-center">
              <UsageBadge 
                tier={usage.tier}
                dailyRemaining={usage.dailyRemaining}
                dailyLimit={usage.dailyLimit}
                monthlyRemaining={usage.monthlyRemaining}
                monthlyLimit={usage.monthlyLimit}
              />
            </div>
          )}
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}