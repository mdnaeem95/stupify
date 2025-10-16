'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Flame, TrendingUp, Calendar, Crown, Target, BarChart3 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UsageStats {
  questionsToday: number;
  dailyLimit: number;
  totalQuestions: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: string;
  isPremium: boolean;
  questionsThisMonth: number;
  conversationsCount: number;
}

export function UsageSettings() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const supabase = createClient();

      // Get profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, created_at')
        .eq('id', user.id)
        .single();

      const isPremium = profile?.subscription_status === 'premium';

      // Get today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: todayUsage } = await supabase
        .from('daily_usage')
        .select('questions_asked')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // Get total questions
      const { count: totalQuestions } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user');

      // Get this month's questions
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];
      const { count: monthlyQuestions } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', firstDayOfMonth);

      // Get streak info
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .single();

      // Get conversations count
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        questionsToday: todayUsage?.questions_asked || 0,
        dailyLimit: isPremium ? -1 : 10, // -1 means unlimited
        totalQuestions: totalQuestions || 0,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        memberSince: profile?.created_at || new Date().toISOString(),
        isPremium,
        questionsThisMonth: monthlyQuestions || 0,
        conversationsCount: conversationsCount || 0,
      });
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load usage statistics</p>
      </div>
    );
  }

  const memberSinceDate = new Date(stats.memberSince);
  const daysSinceMember = Math.floor(
    (new Date().getTime() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Usage & Statistics</h2>
        <p className="text-gray-600">Track your learning journey and progress</p>
      </div>

      {/* Today's Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Today&apos;s Questions</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-gray-900">
              {stats.questionsToday}
            </div>
            {!stats.isPremium && (
              <div className="text-gray-600">/ {stats.dailyLimit}</div>
            )}
          </div>
          {stats.isPremium ? (
            <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
              <Crown className="w-4 h-4" />
              Unlimited
            </div>
          ) : (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.questionsToday / stats.dailyLimit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {stats.dailyLimit - stats.questionsToday} questions remaining today
              </p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Current Streak</h3>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {stats.currentStreak} days
          </div>
          <p className="text-sm text-gray-600">
            Longest: {stats.longestStreak} days
          </p>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">All-Time Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Total Questions</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Conversations</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.conversationsCount}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Questions This Month</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.questionsThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Member Info */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Member Since</h3>
            <p className="text-sm text-gray-600">
              {memberSinceDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Target className="w-5 h-5" />
          <p className="text-sm">
            You&apos;ve been learning with Stupify for <strong>{daysSinceMember}</strong> {daysSinceMember === 1 ? 'day' : 'days'}!
          </p>
        </div>
      </div>

      {/* Upgrade CTA (if free user) */}
      {!stats.isPremium && stats.questionsToday >= stats.dailyLimit * 0.7 && (
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Running low on questions?</h3>
              <p className="text-purple-100 mb-4">
                Upgrade to Premium and ask unlimited questions every day. Never hit a limit again!
              </p>
              <Link href="/pricing">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                  Upgrade to Premium - $4.99/month
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* View Full Stats */}
      <div className="pt-6 border-t border-gray-200">
        <Link href="/stats">
          <Button variant="outline" className="border-gray-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Detailed Statistics
          </Button>
        </Link>
      </div>
    </div>
  );
}