'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface AnalogyRatingProps {
  messageId: string;
  onRate: (messageId: string, rating: 'up' | 'down') => void;
}

export function AnalogyRating({ messageId, onRate }: AnalogyRatingProps) {
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
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
      <span className="text-xs text-gray-500">Was this helpful?</span>
      
      <button
        onClick={() => handleRate('up')}
        disabled={rating !== null}
        className={`
          p-1.5 rounded-lg transition-all
          ${rating === 'up' 
            ? 'bg-green-100 text-green-600' 
            : 'text-gray-400 hover:bg-gray-100 hover:text-green-600'}
          ${rating && rating !== 'up' ? 'opacity-40' : ''}
          disabled:cursor-not-allowed
        `}
        title="Good explanation"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleRate('down')}
        disabled={rating !== null}
        className={`
          p-1.5 rounded-lg transition-all
          ${rating === 'down' 
            ? 'bg-red-100 text-red-600' 
            : 'text-gray-400 hover:bg-gray-100 hover:text-red-600'}
          ${rating && rating !== 'down' ? 'opacity-40' : ''}
          disabled:cursor-not-allowed
        `}
        title="Confusing explanation"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>

      {rating && (
        <span className="text-xs text-gray-500 animate-fade-in">
          Thanks for your feedback!
        </span>
      )}
    </div>
  );
}