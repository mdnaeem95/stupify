'use client';

import { Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';

interface ChatEmptyStateProps {
  simplicityLevel: SimplicityLevel;
  greeting?: string;
  onExampleClick?: (question: string) => void;
  isMobile?: boolean;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
}

const exampleQuestions = [
  { emoji: '🧬', text: 'How does DNA work?', level: '5yo' as SimplicityLevel },
  { emoji: '🌍', text: 'Why do we have time zones?', level: 'normal' as SimplicityLevel },
  { emoji: '💡', text: 'How does electricity work?', level: 'advanced' as SimplicityLevel },
  { emoji: '🚀', text: 'How do rockets work?', level: '5yo' as SimplicityLevel },
  { emoji: '🌊', text: 'What causes ocean waves?', level: 'normal' as SimplicityLevel },
  { emoji: '🧠', text: 'How does the brain learn?', level: 'advanced' as SimplicityLevel },
];

export function ChatEmptyState({ 
  simplicityLevel, 
  greeting,
  onExampleClick,
  isMobile,
  triggerHaptic 
}: ChatEmptyStateProps) {
  
  const handleExampleClick = (question: string) => {
    if (onExampleClick) {
      onExampleClick(question);
    }
    if (isMobile && triggerHaptic) {
      triggerHaptic('light');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-16 text-center space-y-6 md:space-y-8">
      
      {/* Logo */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 md:p-8 rounded-3xl shadow-lg">
        <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-white" />
      </div>
      
      {/* Greeting & Description */}
      <div className="space-y-3 max-w-md px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {greeting || 'Ask me anything!'}
        </h2>
        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
          I&apos;ll explain it in a way that actually makes sense. No jargon, no confusion — just simple, clear answers.
        </p>
        <p className="text-xs text-purple-600 font-medium">
          💡 Tip: Use the dropdown above to change how I explain things
        </p>
      </div>

      {/* Example Questions */}
      <div className="w-full max-w-2xl px-4">
        <p className="text-sm font-medium text-gray-500 mb-4">
          Try asking about...
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exampleQuestions.map((example, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(example.text)}
              className={`
                flex items-center gap-3 p-4 rounded-xl 
                bg-white hover:bg-purple-50 
                border-2 border-gray-200 hover:border-purple-300 
                transition-all text-left group
                min-h-[60px]
                ${isMobile ? 'active:scale-95' : 'hover:scale-105'}
              `}
            >
              <span className="text-2xl flex-shrink-0">{example.emoji}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                {example.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Mode Indicator */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
        <div className={`w-2 h-2 rounded-full ${
          simplicityLevel === '5yo' ? 'bg-purple-500' :
          simplicityLevel === 'normal' ? 'bg-blue-500' :
          'bg-green-500'
        }`} />
        <span className="text-xs text-gray-600">
          Currently in <span className="font-semibold">
            {simplicityLevel === '5yo' ? '5 years old' : 
             simplicityLevel === 'normal' ? 'normal' : 
             'advanced'}
          </span> mode
        </span>
      </div>
      
    </div>
  );
}