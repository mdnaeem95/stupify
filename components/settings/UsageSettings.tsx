'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Flame, TrendingUp, Calendar, Crown, Target, BarChart3, Sparkles } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" strokeWidth={2} />
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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Usage & Statistics</h2>
        <p className="text-gray-600 leading-relaxed">Track your learning journey and progress</p>
      </div>

      {/* Today's Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Questions Card */}
        <div className="relative bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl blur-md opacity-40" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <MessageSquare className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Today&apos;s Questions</h3>
          </div>
          
          <div className="flex items-baseline gap-2 mb-3">
            <div className="text-4xl font-bold text-gray-900">
              {stats.questionsToday}
            </div>
            {!stats.isPremium && (
              <div className="text-xl text-gray-600">/ {stats.dailyLimit}</div>
            )}
          </div>
          
          {stats.isPremium ? (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Crown className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Unlimited
              </span>
            </div>
          ) : (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2.5 rounded-full transition-all shadow-sm shadow-indigo-500/30"
                  style={{ width: `${Math.min((stats.questionsToday / stats.dailyLimit) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 font-medium">
                {stats.dailyLimit - stats.questionsToday} questions remaining today
              </p>
            </div>
          )}
        </div>

        {/* Current Streak Card */}
        <div className="relative bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur-md opacity-40" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Flame className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Current Streak</h3>
          </div>
          
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {stats.currentStreak} days
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Longest: {stats.longestStreak} days
          </p>
        </div>
      </div>

      {/* All-Time Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">All-Time Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <TrendingUp className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-semibold">Total Questions</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MessageSquare className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-semibold">Conversations</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.conversationsCount}</div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Calendar className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-semibold">Questions This Month</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.questionsThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Member Info */}
      <div className="bg-gray-50 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-gray-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Member Since</h3>
            <p className="text-sm text-gray-600 font-medium">
              {memberSinceDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Target className="w-5 h-5 text-gray-600" strokeWidth={2} />
          <p className="text-sm leading-relaxed">
            You&apos;ve been learning with Stupify for <span className="font-bold">{daysSinceMember}</span> {daysSinceMember === 1 ? 'day' : 'days'}!
          </p>
        </div>
      </div>

      {/* Upgrade CTA (if free user) */}
      {!stats.isPremium && stats.questionsToday >= stats.dailyLimit * 0.7 && (
        <div className="relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl rounded-2xl" />
          
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-500/30">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Running low on questions?</h3>
                <p className="text-indigo-100 mb-6 leading-relaxed">
                  Upgrade to Premium and ask unlimited questions every day. Never hit a limit again!
                </p>
                <Link href="/pricing">
                  <Button className="bg-white text-indigo-600 hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer">
                    Upgrade to Premium - $4.99/month
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Full Stats */}
      <div className="pt-6 border-t border-gray-100">
        <Link href="/stats">
          <Button variant="outline" className="hover:bg-gray-50 transition-colors cursor-pointer">
            <BarChart3 className="w-4 h-4 mr-2" strokeWidth={2} />
            View Detailed Statistics
          </Button>
        </Link>
      </div>
    </div>
  );
}