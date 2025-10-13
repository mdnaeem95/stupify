'use client';

import { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  question: string;
  answer: string;
  level: string;
  conversationId?: string;
  messageId: string;
}

export function ShareButton({
  question,
  answer,
  level,
  conversationId,
  messageId,
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Save the explanation
      const response = await fetch('/api/share/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          simplicityLevel: level,
          conversationId,
          messageId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const { id } = await response.json();

      // Open share modal/dialog with the card
      // For now, we'll use the native share API if available
      if (navigator.share) {
        await navigator.share({
          title: `${question} - Explained by Stupify`,
          text: `Just learned something cool: ${question}\n\n${answer.substring(0, 100)}...\n\nExplained simply by Stupify!`,
          url: `${window.location.origin}/share/${id}`,
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/share/${id}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      disabled={isSharing}
      className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
    >
      {isSharing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Sharing...
        </>
      ) : shareSuccess ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </>
      )}
    </Button>
  );
}