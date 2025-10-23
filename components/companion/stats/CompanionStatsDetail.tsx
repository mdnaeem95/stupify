'use client';

import { Heart, Zap, Brain, Info } from 'lucide-react';
import CompanionStats from './CompanionStats';

interface CompanionStatsDetailProps {
  happiness: number;
  energy: number;
  knowledge: number;
}

export default function CompanionStatsDetail({
  happiness,
  energy,
  knowledge,
}: CompanionStatsDetailProps) {
  const statInfo = [
    {
      name: 'Happiness',
      icon: Heart,
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-50 to-emerald-50',
      description: 'Your companion feels happier when you interact and play games.',
      tips: [
        'Click on your companion to chat',
        'Play mini-games for a happiness boost',
        'Check in daily for rewards',
      ],
    },
    {
      name: 'Energy',
      icon: Zap,
      gradient: 'from-indigo-400 to-violet-400',
      bgGradient: 'from-indigo-50 to-violet-50',
      description: 'Energy grows as you ask questions and stay engaged.',
      tips: [
        'Ask questions to boost energy',
        'Daily check-ins restore energy fully',
        'Your companion stays energized with regular use',
      ],
    },
    {
      name: 'Knowledge',
      icon: Brain,
      gradient: 'from-violet-400 to-purple-400',
      bgGradient: 'from-violet-50 to-purple-50',
      description: 'Knowledge increases as you learn together.',
      tips: [
        'Advanced questions give more knowledge',
        'Consistent learning builds knowledge',
        'Your companion grows smarter with you',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Current Stats */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current Stats</h3>
        <CompanionStats 
          happiness={happiness} 
          energy={energy} 
          knowledge={knowledge} 
        />
      </div>

      {/* Detailed Info */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">How Stats Work</h3>
        <div className="space-y-6">
          {statInfo.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.name}
                className="bg-white rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}>
                    <Icon className="w-5 h-5 text-gray-700" strokeWidth={2} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">{stat.name}</h4>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {stat.description}
                </p>

                {/* Tips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-gray-500" strokeWidth={2} />
                    <span className="text-xs font-semibold text-gray-700">Ways to Improve</span>
                  </div>
                  <ul className="space-y-1.5 ml-6">
                    {stat.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-600 leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}