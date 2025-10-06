'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, Clock, AlertCircle } from 'lucide-react';
import { getUserConversations, deleteConversation, type Conversation } from '@/lib/conversations';
import { formatDate } from '@/lib/utils';

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

  useEffect(() => {
    console.log('🔄 ConversationList: Refresh triggered', { refreshTrigger })
    loadConversations();
  }, [refreshTrigger]);

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
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('⚠️ ConversationList: Showing error state', { error })
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button 
            onClick={loadConversations}
            className="mt-3 w-full"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  console.log('📋 ConversationList: Rendering', { 
    conversationCount: conversations.length,
    currentConversationId 
  })

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Chat History</h2>
        <Button
          onClick={() => {
            console.log('🆕 ConversationList: New Chat button clicked')
            onNewChat()
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          + New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start chatting to see your history</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
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
                className={`w-full text-left p-3 rounded-lg transition-colors group cursor-pointer ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}