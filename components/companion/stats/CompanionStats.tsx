'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Brain } from 'lucide-react';

interface CompanionStatsProps {
  happiness: number;
  energy: number;
  knowledge: number;
  compact?: boolean;
}

export default function CompanionStats({
  happiness,
  energy,
  knowledge,
  compact = false,
}: CompanionStatsProps) {
  const stats = [
    {
      name: 'Happiness',
      value: happiness,
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-50 to-emerald-50',
      icon: Heart,
    },
    {
      name: 'Energy',
      value: energy,
      gradient: 'from-indigo-400 to-violet-400',
      bgGradient: 'from-indigo-50 to-violet-50',
      icon: Zap,
    },
    {
      name: 'Knowledge',
      value: knowledge,
      gradient: 'from-violet-400 to-purple-400',
      bgGradient: 'from-violet-50 to-purple-50',
      icon: Brain,
    },
  ];

  if (compact) {
    return (
      <div className="flex gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-gray-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-gray-900">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.bgGradient}`}>
                  <Icon className="w-4 h-4 text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stat.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {stat.value}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${stat.gradient}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}