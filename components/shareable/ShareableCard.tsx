'use client';

import { Sparkles } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts/prompts-v2';

interface ShareableCardProps {
  question: string;
  answer: string;
  level: SimplicityLevel;
  theme?: 'gradient' | 'minimal' | 'playful';
  showBranding?: boolean;
}

export function ShareableCard({
  question,
  answer,
  level,
  theme = 'gradient',
  showBranding = true,
}: ShareableCardProps) {
  // Truncate long text for card display
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayQuestion = truncateText(question, 120);
  const displayAnswer = truncateText(answer, 400);

  // Get level badge info
  const getLevelInfo = () => {
    switch (level) {
      case '5yo':
        return { emoji: '🎈', text: 'Super Simple', color: 'bg-pink-100 text-pink-700' };
      case 'normal':
        return { emoji: '✨', text: 'Clear & Simple', color: 'bg-purple-100 text-purple-700' };
      case 'advanced':
        return { emoji: '📚', text: 'In Depth', color: 'bg-blue-100 text-blue-700' };
    }
  };

  const levelInfo = getLevelInfo();

  // Theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'gradient':
        return {
          container: 'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600',
          content: 'bg-white/95 backdrop-blur-sm',
        };
      case 'minimal':
        return {
          container: 'bg-white border-4 border-gray-900',
          content: 'bg-gray-50',
        };
      case 'playful':
        return {
          container: 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400',
          content: 'bg-white/90 backdrop-blur-sm',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      id="shareable-card"
      className={`w-full max-w-2xl aspect-square ${styles.container} rounded-3xl p-8 flex flex-col justify-between shadow-2xl`}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Stupify</h3>
            <p className="text-white/80 text-sm">Finally, AI that speaks human</p>
          </div>
        </div>
        <div className={`${levelInfo.color} px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2`}>
          <span>{levelInfo.emoji}</span>
          <span>{levelInfo.text}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${styles.content} rounded-2xl p-8 shadow-xl flex-1 my-6 flex flex-col justify-center`}>
        {/* Question */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wider">
            Question
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {displayQuestion}
          </h2>
        </div>

        {/* Answer */}
        <div>
          <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wider">
            Answer
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            {displayAnswer}
          </p>
        </div>
      </div>

      {/* Footer */}
      {showBranding && (
        <div className="flex items-center justify-between text-white">
          <div className="text-sm opacity-90">
            Get your own simple explanations at
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm">
            stupify.app
          </div>
        </div>
      )}
    </div>
  );
}