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

  // Category styling - updated to match design system
  const categoryStyles = {
    deeper: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700',
    related: 'bg-violet-50 hover:bg-violet-100/80 text-violet-700',
    practical: 'bg-purple-50 hover:bg-purple-100/80 text-purple-700'
  };

  const categoryLabels = {
    deeper: 'Go Deeper',
    related: 'Related Topics',
    practical: 'Practical Use'
  };

  return (
    <div className="my-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg blur-sm opacity-30" />
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900">Want to learn more?</span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
          <span>Thinking of great follow-up questions...</span>
        </div>
      ) : (
        /* Questions */
        <div className="space-y-2.5">
          {questions.map((question) => (
            <Button
              key={question.id}
              onClick={() => handleQuestionClick(question)}
              disabled={clickedId !== null}
              variant="outline"
              className={`
                w-full justify-start text-left h-auto py-3.5 px-4
                transition-all duration-200 
                rounded-2xl
                border-0
                ${categoryStyles[question.category]}
                ${clickedId === question.id ? 'ring-2 ring-indigo-500/20 opacity-50' : ''}
                ${clickedId && clickedId !== question.id ? 'opacity-40' : ''}
                hover:shadow-md hover:-translate-y-0.5
              `}
            >
              <span className="flex items-start gap-3 w-full">
                <span className="flex-1">
                  <span className="block text-xs font-bold mb-1.5 opacity-60 uppercase tracking-wide">
                    {categoryLabels[question.category]}
                  </span>
                  <span className="block text-sm font-medium leading-relaxed">
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
        <p className="text-xs text-gray-500 text-center mt-4">
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
    <div className="my-6 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg blur-sm opacity-30" />
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-1 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-700">Continue exploring:</span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
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
              className="text-xs bg-gray-50 border-0 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-violet-50 hover:shadow-sm transition-all duration-200 rounded-xl font-medium"
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
    <div className="my-4 text-sm">
      <span className="text-gray-600 font-semibold">Ask me: </span>
      {questions.map((question, index) => (
        <span key={question.id}>
          <button
            onClick={() => onQuestionClick(question.text)}
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 font-medium transition-colors"
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