'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-blue-500' : 'bg-purple-500'
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[80%] px-4 py-3 rounded-2xl',
        isUser 
          ? 'bg-blue-500 text-white rounded-tr-none' 
          : 'bg-gray-100 text-gray-900 rounded-tl-none'
      )}>
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    </div>
  );
}