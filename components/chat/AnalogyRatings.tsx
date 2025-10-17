'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface AnalogyRatingProps {
  messageId: string;
  onRate: (messageId: string, rating: 'up' | 'down') => void;
  isMobile?: boolean;
}

export function AnalogyRating({ messageId, onRate, isMobile }: AnalogyRatingProps) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (newRating: 'up' | 'down') => {
    if (isSubmitting || rating) return;
    
    setIsSubmitting(true);
    setRating(newRating);
    
    try {
      await onRate(messageId, newRating);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-2 mb-4">
      <span className="text-xs font-medium text-gray-600">Was this helpful?</span>
      
      <button
        onClick={() => handleRate('up')}
        disabled={rating !== null}
        className={`
          p-2 rounded-xl transition-all duration-200
          ${rating === 'up' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 shadow-sm' 
            : 'text-gray-400 hover:bg-gray-50 hover:text-green-600'}
          ${rating && rating !== 'up' ? 'opacity-40' : ''}
          ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}
          disabled:cursor-not-allowed
        `}
        title="Good explanation"
      >
        <ThumbsUp className="w-4 h-4" strokeWidth={2} />
      </button>

      <button
        onClick={() => handleRate('down')}
        disabled={rating !== null}
        className={`
          p-2 rounded-xl transition-all duration-200
          ${rating === 'down' 
            ? 'bg-red-50 text-red-600 shadow-sm' 
            : 'text-gray-400 hover:bg-gray-50 hover:text-red-600'}
          ${rating && rating !== 'down' ? 'opacity-40' : ''}
          ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}
          disabled:cursor-not-allowed
        `}
        title="Confusing explanation"
      >
        <ThumbsDown className="w-4 h-4" strokeWidth={2} />
      </button>

      {rating && (
        <span className="text-xs font-medium text-gray-600 animate-fade-in">
          Thanks for your feedback!
        </span>
      )}
    </div>
  );
}