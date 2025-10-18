'use client';

import { useEffect, useState } from 'react';
import { Mascot } from '../mascot/Mascot';
import { Lock, Check } from 'lucide-react';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'learning' | 'social' | 'exploration';
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementGridProps {
  showUnlockedOnly?: boolean;
}

export function AchievementGrid({ showUnlockedOnly = false }: AchievementGridProps) {
  const [achievements, setAchievements] = useState<{
    all: Achievement[];
    byCategory: Record<string, Achievement[]>;
    stats: { total: number; unlocked: number; percentage: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/gamification/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Mascot expression="thinking" size={100} />
          <p className="mt-4 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!achievements) {
    return (
      <div className="text-center py-12">
        <Mascot expression="happy" size={100} />
        <p className="mt-4 text-gray-600">No achievements yet!</p>
      </div>
    );
  }

  // Filter achievements
  const filteredAchievements = achievements.all.filter((a) => {
    if (showUnlockedOnly && !a.unlocked) return false;
    if (selectedCategory && a.category !== selectedCategory) return false;
    return true;
  });

  // Category stats
  const categories = [
    { key: 'streak', label: 'Streak', icon: '🔥', color: 'orange' },
    { key: 'learning', label: 'Learning', icon: '📚', color: 'purple' },
    { key: 'social', label: 'Social', icon: '🎨', color: 'blue' },
    { key: 'exploration', label: 'Exploration', icon: '🔍', color: 'green' },
  ];

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Mascot expression="proud" size={120} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Achievements</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {achievements.stats.unlocked} of {achievements.stats.total} unlocked ({achievements.stats.percentage}%)
        </p>

        {/* Progress bar */}
        <div className="max-w-md mx-auto">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${achievements.stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-5 py-2.5 rounded-full font-semibold transition-all cursor-pointer ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const count = achievements.byCategory[cat.key]?.length || 0;
          const unlocked = achievements.byCategory[cat.key]?.filter((a) => a.unlocked).length || 0;
          
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.icon} {cat.label} ({unlocked}/{count})
            </button>
          );
        })}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No achievements in this category yet!</p>
        </div>
      )}
    </div>
  );
}

// Individual achievement card
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isLocked = !achievement.unlocked;

  // Category colors
  const categoryColors = {
    streak: 'from-orange-50 to-red-50',
    learning: 'from-indigo-50 to-violet-50',
    social: 'from-blue-50 to-cyan-50',
    exploration: 'from-green-50 to-emerald-50',
  };

  const bgColor = categoryColors[achievement.category];

  return (
    <div
      className={`relative bg-gradient-to-br ${bgColor} rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all ${
        isLocked ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute top-4 right-4">
          <div className="bg-gray-400 rounded-full p-2 shadow-sm">
            <Lock className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        </div>
      )}

      {/* Unlocked checkmark */}
      {!isLocked && (
        <div className="absolute top-4 right-4">
          <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-2 shadow-lg shadow-green-500/30">
            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Achievement icon */}
      <div className={`text-6xl mb-4 ${isLocked ? 'filter grayscale' : ''}`}>
        {achievement.icon}
      </div>

      {/* Achievement info */}
      <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
        {achievement.name}
      </h3>
      <p className={`text-sm mb-4 leading-relaxed ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
        {achievement.description}
      </p>

      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700 capitalize px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full">
          {achievement.category}
        </span>

        {!isLocked && achievement.unlockedAt && (
          <span className="text-xs text-gray-500 font-medium">
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

// Compact achievements list (for sidebar/header)
export function AchievementsCompact() {
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchRecentAchievements();
  }, []);

  const fetchRecentAchievements = async () => {
    try {
      const response = await fetch('/api/gamification/achievements');
      if (response.ok) {
        const data = await response.json();
        // Get 3 most recent unlocked
        const recent = data.all
          .filter((a: Achievement) => a.unlocked)
          .sort((a: Achievement, b: Achievement) => {
            if (!a.unlockedAt || !b.unlockedAt) return 0;
            return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
          })
          .slice(0, 3);
        setRecentAchievements(recent);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  if (recentAchievements.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Recent Achievements</p>
      <div className="space-y-2">
        {recentAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="text-2xl">{achievement.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{achievement.name}</p>
              <p className="text-xs text-gray-600 truncate leading-relaxed">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}