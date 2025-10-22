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
    setCurrentConversationId(conversationId);
    setIsSidebarOpen(false);
    
    // Dispatch event to ChatInterface
    window.dispatchEvent(new CustomEvent('loadConversation', { 
      detail: { conversationId } 
    }));
  };

  const handleNewChat = () => {    
    setCurrentConversationId(null);
    setIsSidebarOpen(false);
    
    // Dispatch event to ChatInterface
    const event = new Event('newChat')
    window.dispatchEvent(event);
  };

  // Expose refresh function to chat interface
  useEffect(() => {  
    const handleRefreshSidebar = () => {
      setRefreshSidebar(Date.now());
    };

    window.addEventListener('refreshSidebar', handleRefreshSidebar);
    
    return () => {
      window.removeEventListener('refreshSidebar', handleRefreshSidebar);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => {
          console.log('📱 Layout: Mobile menu toggled', { 
            from: isSidebarOpen, 
            to: !isSidebarOpen 
          })
          setIsSidebarOpen(!isSidebarOpen)
        }}
        className={`${isSidebarOpen ? 'hidden ' : ''}md:hidden fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 shadow-lg rounded-xl`}
        size="icon"
      >
        {isSidebarOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
      </Button>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Subtle gray background to differentiate from main content */}
      <aside
        className={`
          bg-gray-50
          transition-all duration-300 ease-in-out
          flex-shrink-0
          
          /* Mobile: Fixed overlay covering ENTIRE screen - HIGH Z-INDEX */
          fixed md:static inset-0 md:inset-y-0 left-0 z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-80
          
          /* Desktop: Always visible, pushes content */
          md:translate-x-0 md:w-80 md:h-full md:z-auto
        `}
      >
        <ConversationList
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          refreshTrigger={refreshSidebar}
        />
      </aside>

      {/* Main Content - Pure white background */}
      <main className="flex-1 overflow-hidden min-w-0 bg-white">
        {children}
      </main>
    </div>
  );
}