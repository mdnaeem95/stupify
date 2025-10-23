/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mascot } from '../mascot/Mascot';
import { Flame, Trophy, Brain, TrendingUp, Calendar, Target, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanion, useCompanionMessages } from '@/hooks/companion';
import { CompanionProfile } from '../companion/CompanionProfile';

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
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { companion, progress } = useCompanion();
  const { messages } = useCompanionMessages(50);

  useEffect(() => {
    fetchStats();
  }, [companion]);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Mascot expression="thinking" size={120} />
          <p className="mt-4 text-gray-600">Loading your stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Mascot expression="happy" size={120} />
          <p className="mt-4 text-gray-600">No stats yet. Start learning!</p>
        </div>
      </div>
    );
  }

  const achievementPercentage = Math.round((stats.achievements.unlocked / stats.achievements.total) * 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Button 
          onClick={() => router.back()}
          variant="ghost"
          className="group mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
          Back
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with Blinky */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Your Learning Journey</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {stats.allTime.totalDays > 0 
              ? `You've been learning for ${stats.allTime.totalDays} day${stats.allTime.totalDays > 1 ? 's' : ''}!`
              : "Your adventure is just beginning!"}
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Streak */}
          <StatCard
            icon={<Flame className="w-9 h-9 text-white" strokeWidth={2.5} />}
            label="Current Streak"
            value={stats.streak.current}
            unit="days"
            gradient="from-orange-500 to-red-500"
          />

          {/* Total Questions */}
          <StatCard
            icon={<Brain className="w-9 h-9 text-white" strokeWidth={2.5} />}
            label="Total Questions"
            value={stats.allTime.totalQuestions}
            unit="asked"
            gradient="from-indigo-500 to-violet-500"
          />

          {/* Achievements */}
          <StatCard
            icon={<Trophy className="w-9 h-9 text-white" strokeWidth={2.5} />}
            label="Achievements"
            value={stats.achievements.unlocked}
            unit={`of ${stats.achievements.total}`}
            gradient="from-yellow-400 to-orange-400"
          />

          {/* Topics Explored */}
          <StatCard
            icon={<Target className="w-9 h-9 text-white" strokeWidth={2.5} />}
            label="Topics Explored"
            value={stats.allTime.totalTopics}
            unit="different"
            gradient="from-blue-500 to-cyan-500"
          />
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">This Week</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {stats.weekly.totalQuestions}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Questions Asked</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {stats.weekly.avgQuestionsPerDay.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Avg per Day</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {stats.weekly.streakDays}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Active Days</p>
            </div>
          </div>

          {/* Top topics this week */}
          {stats.weekly.topTopics.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-3">Top Topics This Week</p>
              <div className="flex flex-wrap gap-2">
                {stats.weekly.topTopics.slice(0, 5).map((topic, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 text-gray-900 rounded-full text-sm font-medium"
                  >
                    {topic.topic} ({topic.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Streak Calendar */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Calendar className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Calendar</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Last 30 days</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded" />
                  <span className="text-gray-600">No activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-red-400 rounded" />
                  <span className="text-gray-600">Active</span>
                </div>
              </div>
            </div>

            {/* Heatmap grid */}
            <div className="grid grid-cols-10 gap-2">
              {stats.streak.calendar.slice(-30).map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded transition-all cursor-pointer ${
                    day.active 
                      ? 'bg-gradient-to-br from-orange-400 to-red-400 hover:scale-110 shadow-sm' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={day.date}
                />
              ))}
            </div>
          </div>

          {/* Streak stats */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {stats.streak.current}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Current Streak</p>
            </div>
            <div>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {stats.streak.longest}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">Longest Streak</p>
            </div>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Trophy className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Achievement Progress</h2>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                {stats.achievements.unlocked} of {stats.achievements.total} unlocked
              </span>
              <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {achievementPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${achievementPercentage}%` }}
              />
            </div>
          </div>

          {/* Recent achievements */}
          {stats.achievements.recent.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-4">Recently Unlocked</p>
              <div className="space-y-3">
                {stats.achievements.recent.map((achievement, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{achievement.name}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Favorite Topics */}
        {stats.favoriteTopics.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Favorite Topics</h2>
            </div>
            <div className="space-y-4">
              {stats.favoriteTopics.slice(0, 10).map((topic, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent w-8">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">{topic.topic}</span>
                      <span className="text-sm text-gray-600 font-medium">{topic.count} questions</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full shadow-sm"
                        style={{ width: `${(topic.count / stats.allTime.totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Companion Profile Section */}
      {companion && progress && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Learning Companion</h2>
          <CompanionProfile
            companion={companion}
            progress={progress}
            stats={{
              total_messages: messages.length,
              total_interactions: companion.total_interactions,
              questions_asked: 0, // Calculate from your data
              messages_sent: messages.length,
              level_ups: companion.level - 1,
            }}
          />
        </section>
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
  gradient
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  unit: string; 
  gradient: string;
}) {
  return (
    <div className="relative group bg-gray-50 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all cursor-default">
      <div className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{unit}</p>
    </div>
  );
}