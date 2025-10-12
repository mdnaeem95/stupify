'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import type { FollowUpQuestion } from '@/lib/question-predictor';

interface AdaptiveFollowUpProps {
  questions: FollowUpQuestion[];
  onQuestionClick: (question: string) => void;
  isLoading?: boolean;
}

/**
 * ADAPTIVE FOLLOW-UP COMPONENT
 * 
 * Displays 3 intelligent follow-up questions after each AI response.
 * Users can click them to continue exploring without typing.
 */
export function AdaptiveFollowUp({ 
  questions, 
  onQuestionClick,
  isLoading = false 
}: AdaptiveFollowUpProps) {
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleQuestionClick = (question: FollowUpQuestion) => {
    setClickedId(question.id);
    onQuestionClick(question.text);
  };

  if (questions.length === 0 && !isLoading) {
    return null;
  }

  // Category styling
  const categoryStyles = {
    deeper: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800',
    related: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800',
    practical: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800'
  };

  const categoryIcons = {
    deeper: '🔍',
    related: '🔗',
    practical: '💡'
  };

  const categoryLabels = {
    deeper: 'Go Deeper',
    related: 'Related Topics',
    practical: 'Practical Use'
  };

  return (
    <div className="my-6 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span>Want to learn more?</span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Thinking of great follow-up questions...</span>
        </div>
      ) : (
        /* Questions */
        <div className="space-y-2">
          {questions.map((question) => (
            <Button
              key={question.id}
              onClick={() => handleQuestionClick(question)}
              disabled={clickedId !== null}
              variant="outline"
              className={`
                w-full justify-start text-left h-auto py-3 px-4
                transition-all duration-200 
                ${categoryStyles[question.category]}
                ${clickedId === question.id ? 'ring-2 ring-offset-2 ring-purple-500 opacity-50' : ''}
                ${clickedId && clickedId !== question.id ? 'opacity-40' : ''}
                hover:shadow-sm
              `}
            >
              <span className="flex items-start gap-3 w-full">
                <span className="text-lg mt-0.5 flex-shrink-0">
                  {categoryIcons[question.category]}
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-semibold mb-1 opacity-70">
                    {categoryLabels[question.category]}
                  </span>
                  <span className="block text-sm">
                    {question.text}
                  </span>
                </span>
              </span>
            </Button>
          ))}
        </div>
      )}

      {/* Help Text */}
      {!isLoading && questions.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Click a question to explore, or type your own below
        </p>
      )}
    </div>
  );
}

/**
 * COMPACT VERSION
 * Simpler design without category labels
 */
export function AdaptiveFollowUpCompact({ 
  questions, 
  onQuestionClick,
  isLoading = false 
}: AdaptiveFollowUpProps) {
  const handleQuestionClick = (question: string) => {
    onQuestionClick(question);
  };

  if (questions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="my-4 space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
        <span>Continue exploring:</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Loading questions...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {questions.map((question) => (
            <Button
              key={question.id}
              onClick={() => handleQuestionClick(question.text)}
              variant="outline"
              size="sm"
              className="text-xs hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              {question.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * MINIMAL VERSION
 * Just text links
 */
export function AdaptiveFollowUpMinimal({ 
  questions, 
  onQuestionClick 
}: AdaptiveFollowUpProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="my-3 text-sm">
      <span className="text-gray-500 font-medium">Ask me: </span>
      {questions.map((question, index) => (
        <span key={question.id}>
          <button
            onClick={() => onQuestionClick(question.text)}
            className="text-purple-600 hover:text-purple-800 hover:underline"
          >
            {question.text}
          </button>
          {index < questions.length - 1 && (
            <span className="text-gray-400 mx-2">•</span>
          )}
        </span>
      ))}
    </div>
  );
}