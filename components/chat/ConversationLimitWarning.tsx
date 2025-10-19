'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Crown, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { canCreateConversation } from '@/lib/conversations';

export function ConversationLimitWarning() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    currentCount: number;
    limit: number | null;
  } | null>(null);

  useEffect(() => {
    checkLimit();
  }, []);

  const checkLimit = async () => {
    const check = await canCreateConversation();
    
    if (!check.canCreate) {
      return; // Don't show if they can't create at all
    }

    // Show warning if close to limit
    if (check.limit !== null && check.currentCount !== undefined) {
      const percentUsed = (check.currentCount / check?.limit!) * 100;
      
      if (percentUsed >= 80) {
        setShow(true);
        setLimitInfo({
          currentCount: check.currentCount,
          limit: check.limit!,
        });
      }
    }
  };

  if (!show || !limitInfo) return null;

  const remaining = limitInfo.limit! - limitInfo.currentCount;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl p-4 max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">
              Running out of conversation slots!
            </p>
            <p className="text-xs text-white/90 mb-3">
              You have {remaining} of {limitInfo.limit} conversations left. Upgrade to save more!
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push('/pricing')}
                className="bg-white text-orange-600 hover:bg-gray-100 text-xs h-8"
              >
                <Zap className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShow(false)}
                className="text-white hover:bg-white/20 text-xs h-8"
              >
                Dismiss
              </Button>
            </div>
          </div>
          
          <button
            onClick={() => setShow(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Component to show expiring conversations
export function ExpiringConversationsWarning() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    checkExpiring();
  }, []);

  const checkExpiring = async () => {
    try {
      const response = await fetch('/api/conversations/expiring');
      const data = await response.json();
      
      if (data.count > 0) {
        setExpiringCount(data.count);
        setShow(true);
      }
    } catch (error) {
      console.error('Failed to check expiring conversations:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl shadow-2xl p-4 max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">
              {expiringCount} conversation{expiringCount > 1 ? 's' : ''} expiring soon!
            </p>
            <p className="text-xs text-white/90 mb-3">
              Upgrade to Premium to keep your conversations forever.
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push('/pricing')}
                className="bg-white text-orange-600 hover:bg-gray-100 text-xs h-8"
              >
                <Crown className="w-3 h-3 mr-1" />
                Go Premium
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShow(false)}
                className="text-white hover:bg-white/20 text-xs h-8"
              >
                Dismiss
              </Button>
            </div>
          </div>
          
          <button
            onClick={() => setShow(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}