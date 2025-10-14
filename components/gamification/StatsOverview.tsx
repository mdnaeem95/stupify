/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Mascot } from '../mascot/Mascot';
import { Flame, Trophy, Brain, TrendingUp, Calendar, Target } from 'lucide-react';

interface StatsData {
  streak: {
    current: number;
    longest: number;
    calendar: { date: string; active: boolean }[];
  };
  achievements: {
    total: number;
    unlocked: number;
    recent: any[];
  };
  weekly: {
    totalQuestions: number;
    avgQuestionsPerDay: number;
    topTopics: { topic: string; count: number }[];
    streakDays: number;
  };
  allTime: {
    totalQuestions: number;
    totalTopics: number;
    totalDays: number;
    longestStreak: number;
    achievementsUnlocked: number;
  };
  favoriteTopics: { topic: string; count: number }[];
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Mascot expression="thinking" size={120} />
          <p className="mt-4 text-gray-600">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Mascot expression="happy" size={120} />
          <p className="mt-4 text-gray-600">No stats yet. Start learning!</p>
        </div>
      </div>
    );
  }

  const achievementPercentage = Math.round((stats.achievements.unlocked / stats.achievements.total) * 100);

  // Determine Blinky's expression based on progress
  const getBlinkyExpression = () => {
    if (stats.streak.current >= 30) return 'celebrating';
    if (stats.achievements.unlocked >= 10) return 'proud';
    if (stats.streak.current >= 7) return 'excited';
    return 'happy';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with Blinky */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Mascot expression={getBlinkyExpression()} size={160} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Learning Journey</h1>
          <p className="text-gray-600">
            {stats.allTime.totalDays > 0 
              ? `You've been learning for ${stats.allTime.totalDays} day${stats.allTime.totalDays > 1 ? 's' : ''}!`
              : "Your adventure is just beginning!"}
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Streak */}
          <StatCard
            icon={<Flame className="w-8 h-8 text-orange-500" />}
            label="Current Streak"
            value={stats.streak.current}
            unit="days"
            color="from-orange-100 to-red-100"
            borderColor="border-orange-200"
          />

          {/* Total Questions */}
          <StatCard
            icon={<Brain className="w-8 h-8 text-purple-500" />}
            label="Total Questions"
            value={stats.allTime.totalQuestions}
            unit="asked"
            color="from-purple-100 to-blue-100"
            borderColor="border-purple-200"
          />

          {/* Achievements */}
          <StatCard
            icon={<Trophy className="w-8 h-8 text-yellow-500" />}
            label="Achievements"
            value={stats.achievements.unlocked}
            unit={`of ${stats.achievements.total}`}
            color="from-yellow-100 to-orange-100"
            borderColor="border-yellow-200"
          />

          {/* Topics Explored */}
          <StatCard
            icon={<Target className="w-8 h-8 text-blue-500" />}
            label="Topics Explored"
            value={stats.allTime.totalTopics}
            unit="different"
            color="from-blue-100 to-cyan-100"
            borderColor="border-blue-200"
          />
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">This Week</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-4xl font-bold text-purple-600">{stats.weekly.totalQuestions}</p>
              <p className="text-sm text-gray-600">Questions Asked</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">{stats.weekly.avgQuestionsPerDay.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Avg per Day</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">{stats.weekly.streakDays}</p>
              <p className="text-sm text-gray-600">Active Days</p>
            </div>
          </div>

          {/* Top topics this week */}
          {stats.weekly.topTopics.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Top Topics This Week</p>
              <div className="flex flex-wrap gap-2">
                {stats.weekly.topTopics.slice(0, 5).map((topic, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200"
                  >
                    {topic.topic} ({topic.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Streak Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Activity Calendar</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Last 30 days</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded" />
                  <span className="text-gray-600">No activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded" />
                  <span className="text-gray-600">Active</span>
                </div>
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-cols-10 gap-2">
              {stats.streak.calendar.slice(-30).map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded ${
                    day.active 
                      ? 'bg-orange-400 hover:bg-orange-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors cursor-pointer`}
                  title={day.date}
                />
              ))}
            </div>
          </div>

          {/* Streak stats */}
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.streak.current}</p>
              <p className="text-sm text-gray-600">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.streak.longest}</p>
              <p className="text-sm text-gray-600">Longest Streak</p>
            </div>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Achievement Progress</h2>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {stats.achievements.unlocked} of {stats.achievements.total} unlocked
              </span>
              <span className="text-sm font-bold text-purple-600">{achievementPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${achievementPercentage}%` }}
              />
            </div>
          </div>

          {/* Recent achievements */}
          {stats.achievements.recent.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Recently Unlocked</p>
              <div className="space-y-3">
                {stats.achievements.recent.map((achievement, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{achievement.name}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Favorite Topics */}
        {stats.favoriteTopics.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Favorite Topics</h2>
            <div className="space-y-3">
              {stats.favoriteTopics.slice(0, 10).map((topic, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-purple-600 w-8">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">{topic.topic}</span>
                      <span className="text-sm text-gray-600">{topic.count} questions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                        style={{ width: `${(topic.count / stats.allTime.totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ 
  icon, 
  label, 
  value, 
  unit, 
  color, 
  borderColor 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  unit: string; 
  color: string; 
  borderColor: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 border ${borderColor} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{unit}</p>
    </div>
  );
}