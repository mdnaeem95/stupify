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
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const handleSelectConversation = (conversationId: string) => {
    console.log('📂 Layout: Selecting conversation', { conversationId })
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false);
    
    // Dispatch event to ChatInterface
    console.log('📡 Layout: Dispatching loadConversation event')
    window.dispatchEvent(new CustomEvent('loadConversation', { 
      detail: { conversationId } 
    }));
  };

  const handleNewChat = () => {
    console.log('🆕 Layout: New chat clicked')
    console.log('🆕 Layout: Current conversation ID:', currentConversationId)
    
    setCurrentConversationId(null);
    setIsSidebarOpen(false);
    
    // Dispatch event to ChatInterface
    console.log('📡 Layout: Dispatching newChat event')
    const event = new Event('newChat')
    window.dispatchEvent(event);
    console.log('✅ Layout: newChat event dispatched')
  };

  // Expose refresh function to chat interface
  useEffect(() => {
    console.log('🔧 Layout: Setting up refreshSidebar listener')
    
    const handleRefreshSidebar = () => {
      console.log('🔄 Layout: Refresh sidebar triggered')
      setRefreshSidebar(Date.now());
    };

    window.addEventListener('refreshSidebar', handleRefreshSidebar);
    
    return () => {
      console.log('🧹 Layout: Cleaning up refreshSidebar listener')
      window.removeEventListener('refreshSidebar', handleRefreshSidebar);
    }
  }, []);

  console.log('🎨 Layout: Rendering', { 
    isSidebarOpen, 
    currentConversationId,
    refreshSidebar 
  })

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => {
          console.log('📱 Layout: Mobile menu toggled', { 
            from: isSidebarOpen, 
            to: !isSidebarOpen 
          })
          setIsSidebarOpen(!isSidebarOpen)
        }}
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
          onClick={() => {
            console.log('📱 Layout: Mobile overlay clicked - closing sidebar')
            setIsSidebarOpen(false)
          }}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}