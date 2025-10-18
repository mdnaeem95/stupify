'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Database, DollarSign, Zap, RefreshCw, Trash2 } from 'lucide-react';

interface CacheStats {
  hits: number;
  misses: number;
  stored: number;
  totalRequests: number;
  hitRate: number;
  costSavings: {
    amount: number;
    currency: string;
    savedRequests: number;
  };
  metrics: {
    hitRate: string;
    totalRequests: number;
    cacheEfficiency: string;
  };
}

export default function CacheDashboard() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear ALL cached responses? This cannot be undone.')) {
      return;
    }
    
    setIsClearing(true);
    try {
      const response = await fetch('/api/cache/stats', {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchStats();
        alert('Cache cleared successfully!');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cache stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center text-red-500">
            <p className="text-lg font-semibold mb-2">Unable to load cache stats</p>
            <p className="text-sm text-gray-600">Please try refreshing the page</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Cache Performance
            </h1>
            <p className="text-gray-600">Monitor your caching efficiency and cost savings</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Clearing...' : 'Clear Cache'}
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Hit Rate */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(stats.hitRate)}%
                  </div>
                  <div className="text-sm text-gray-500">Hit Rate</div>
                </div>
              </div>
              <Progress value={stats.hitRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {stats.hits} hits / {stats.totalRequests} requests
              </p>
            </CardContent>
          </Card>

          {/* Cost Savings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-600">
                    ${stats.costSavings.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Saved</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats.costSavings.savedRequests} cached requests
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ~$0.0015 saved per cached request
              </p>
            </CardContent>
          </Card>

          {/* Total Requests */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalRequests.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Requests</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats.hits} cached, {stats.misses} fresh
              </p>
            </CardContent>
          </Card>

          {/* Stored Entries */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.stored.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Cached</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {stats.metrics.cacheEfficiency} reuse rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Cache Breakdown</CardTitle>
            <CardDescription>Detailed caching statistics</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Cache Hits */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Cache Hits</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats.hits.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(stats.hits / stats.totalRequests) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Requests served from cache (free!)
                </p>
              </div>

              {/* Cache Misses */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Cache Misses</span>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.misses.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(stats.misses / stats.totalRequests) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Requests that required AI calls
                </p>
              </div>

              {/* Cache Efficiency */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">What This Means</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>
                      <strong>{Math.round(stats.hitRate)}%</strong> of requests are served from cache, saving money
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>
                      You&apos;ve saved <strong>${stats.costSavings.amount.toFixed(2)}</strong> in API costs
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">✓</span>
                    <span>
                      {stats.stored} unique questions are cached for faster responses
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl">Optimization Tips</CardTitle>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  <strong>Good hit rate ({'>'}50%):</strong> Most common questions are being cached effectively
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  <strong>Cache warming:</strong> Pre-populate cache with top 100 questions to boost hit rate
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  <strong>Monitor cost savings:</strong> Track this daily to understand ROI of caching
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">
                  <strong>Clear cache:</strong> Only clear when updating prompts or fixing cached errors
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}