'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Mic, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface UsageStats {
  chat: {
    used: number;
    limit: number;
    resetAt: string;
  };
  voice: {
    used: number;
    limit: number;
    resetAt: string;
  };
  isPremium: boolean;
}

export default function UsageDashboard() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/usage/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeUntilReset = (resetAt: string) => {
    const now = new Date();
    const reset = new Date(resetAt);
    const hours = Math.floor((reset.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor((reset.getTime() - now.getTime()) / (1000 * 60)) % 60;
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your usage stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold mb-2">Unable to load stats</p>
            <p className="text-sm text-gray-600">Please try refreshing the page</p>
          </div>
        </Card>
      </div>
    );
  }

  const chatPercentage = (stats.chat.used / stats.chat.limit) * 100;
  const voicePercentage = (stats.voice.used / stats.voice.limit) * 100;
  const chatRemaining = stats.chat.limit - stats.chat.used;
  const voiceRemaining = stats.voice.limit - stats.voice.used;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Usage
          </h1>
          <p className="text-gray-600">Track your daily question limits and usage</p>
        </div>

        {/* Subscription Status Card */}
        <Card className="mb-6 overflow-hidden border-2 border-purple-100">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {stats.isPremium ? (
                    <Sparkles className="w-6 h-6" />
                  ) : (
                    <Zap className="w-6 h-6" />
                  )}
                  <h2 className="text-2xl font-bold">
                    {stats.isPremium ? 'Premium Plan' : 'Free Plan'}
                  </h2>
                </div>
                <p className="text-purple-100">
                  {stats.isPremium
                    ? 'Enjoy unlimited learning with premium features'
                    : 'Upgrade to unlock unlimited questions'}
                </p>
              </div>
              {!stats.isPremium && (
                <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors whitespace-nowrap">
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Chat Usage Card */}
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Chat Questions</CardTitle>
                <CardDescription>Daily question limit</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {chatRemaining}
                </div>
                <div className="text-sm text-gray-500">remaining</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">
                  {stats.chat.used} of {stats.chat.limit} used
                </span>
                <span className="font-semibold text-purple-600">
                  {Math.round(chatPercentage)}%
                </span>
              </div>
              <Progress value={chatPercentage} className="h-3" />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <span>
                Resets in <span className="font-semibold text-gray-700">{getTimeUntilReset(stats.chat.resetAt)}</span>
              </span>
            </div>

            {chatPercentage >= 80 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-1">
                  ⚠️ Running low on questions
                </p>
                <p className="text-sm text-yellow-700">
                  {!stats.isPremium 
                    ? 'Upgrade to Premium for 1000 questions per day!'
                    : 'You\'ll get more questions when your limit resets.'}
                </p>
              </div>
            )}

            {chatPercentage >= 100 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  🚫 Daily limit reached
                </p>
                <p className="text-sm text-red-700">
                  {!stats.isPremium 
                    ? 'Upgrade to Premium or wait for your limit to reset.'
                    : 'Your limit will reset soon. Come back then!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Usage Card */}
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Voice Transcriptions</CardTitle>
                <CardDescription>Hourly transcription limit</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {voiceRemaining}
                </div>
                <div className="text-sm text-gray-500">remaining</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">
                  {stats.voice.used} of {stats.voice.limit} used
                </span>
                <span className="font-semibold text-blue-600">
                  {Math.round(voicePercentage)}%
                </span>
              </div>
              <Progress value={voicePercentage} className="h-3" />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <Clock className="w-4 h-4" />
              <span>
                Resets in <span className="font-semibold text-gray-700">{getTimeUntilReset(stats.voice.resetAt)}</span>
              </span>
            </div>

            {voicePercentage >= 80 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-1">
                  ⚠️ Voice limit running low
                </p>
                <p className="text-sm text-yellow-700">
                  Consider typing your questions to save voice credits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Tips to maximize your usage</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  Ask detailed follow-up questions in the same conversation to learn more
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  Use voice input on mobile for hands-free learning
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  Save explanations you like for future reference
                </span>
              </li>
              {!stats.isPremium && (
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    <strong className="text-purple-600">Upgrade to Premium</strong> for 100x more questions per day (1000 vs 10)
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}