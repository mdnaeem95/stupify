'use client';

import { Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts/prompts';

interface ChatEmptyStateProps {
  simplicityLevel: SimplicityLevel;
  greeting?: string;
  onExampleClick?: (question: string) => void;
  isMobile?: boolean;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
}

const exampleQuestions = [
  { text: 'How does DNA work?', level: '5yo' as SimplicityLevel },
  { text: 'Why do we have time zones?', level: 'normal' as SimplicityLevel },
  { text: 'How does electricity work?', level: 'advanced' as SimplicityLevel },
  { text: 'How do rockets work?', level: '5yo' as SimplicityLevel },
  { text: 'What causes ocean waves?', level: 'normal' as SimplicityLevel },
  { text: 'How does the brain learn?', level: 'advanced' as SimplicityLevel },
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
    <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center space-y-8">
      
      {/* Logo with ambient glow */}
      <div className="relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl blur-2xl opacity-20" />
        
        {/* Logo container */}
        <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-8 rounded-3xl shadow-xl shadow-indigo-500/25">
          <Sparkles className="w-16 h-16 text-white" strokeWidth={2.5} />
        </div>
      </div>
      
      {/* Greeting & Description */}
      <div className="space-y-4 max-w-md px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          {greeting || 'Ask me anything'}
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          I&apos;ll explain it in a way that actually makes sense. No jargon, no confusion — just simple, clear answers.
        </p>
      </div>

      {/* Example Questions */}
      <div className="w-full max-w-2xl px-6">
        <p className="text-sm font-semibold text-gray-500 mb-4">
          Try asking about...
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exampleQuestions.map((example, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(example.text)}
              className={`
                p-4 rounded-2xl text-left
                bg-gray-50 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-violet-50
                hover:shadow-lg hover:shadow-indigo-100/50
                transition-all duration-200
                min-h-[60px]
                ${isMobile ? 'active:scale-95' : 'hover:-translate-y-1'}
              `}
            >
              <span className="text-sm font-medium text-gray-700 hover:text-gray-900">
                {example.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Mode Indicator */}
      <div className="inline-flex items-center gap-2.5 bg-gray-50 px-4 py-2.5 rounded-full">
        <div className={`w-2 h-2 rounded-full ${
          simplicityLevel === '5yo' ? 'bg-gradient-to-r from-indigo-600 to-violet-600' :
          simplicityLevel === 'normal' ? 'bg-gradient-to-r from-indigo-600 to-violet-600' :
          'bg-gradient-to-r from-indigo-600 to-violet-600'
        }`} />
        <span className="text-sm text-gray-700">
          Currently in <span className="font-semibold bg-gradient-to-r from-indigo-900 to-violet-900 bg-clip-text text-transparent">
            {simplicityLevel === '5yo' ? 'ELI5' : 
             simplicityLevel === 'normal' ? 'Normal' : 
             'Advanced'}
          </span> mode
        </span>
      </div>
      
    </div>
  );
}