'use client';

import { useEffect, useState } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [, setTriggerNewChat] = useState(0);
  const [, setTriggerLoadConversation] = useState<{id: string; timestamp: number} | null>(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setTriggerLoadConversation({ id: conversationId, timestamp: Date.now() });
    setIsSidebarOpen(false);
    
    // Dispatch event to ChatInterface
    window.dispatchEvent(new CustomEvent('loadConversation', { 
      detail: { conversationId } 
    }));
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setTriggerNewChat(Date.now());
    setIsSidebarOpen(false);
    
    // Dispatch event to ChatInterface
    window.dispatchEvent(new Event('newChat'));
  };

  // Expose refresh function to chat interface
  useEffect(() => {
    const handleRefreshSidebar = () => {
      setRefreshSidebar(Date.now());
    };

    window.addEventListener('refreshSidebar', handleRefreshSidebar);
    return () => window.removeEventListener('refreshSidebar', handleRefreshSidebar);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700"
        size="icon"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar - Desktop always visible, Mobile overlay */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-80 bg-white border-r
          transform transition-transform duration-200 ease-in-out
          md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ConversationList
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          refreshTrigger={refreshSidebar}
        />
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}