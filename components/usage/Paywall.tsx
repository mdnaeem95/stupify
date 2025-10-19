'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Zap, Clock, Rocket, X } from 'lucide-react';
import { type SubscriptionTier } from '@/lib/stripe';

interface PaywallProps {
  tier?: SubscriptionTier;
  limit: number;
  // For showing what they ran out of
  limitType?: 'daily' | 'monthly';
}

export function Paywall({ tier = 'free', limit, limitType = 'daily' }: PaywallProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);

  const handleUpgrade = async (upgradeTier: 'starter' | 'premium') => {
    setIsLoading(upgradeTier);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: upgradeTier }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(null);
    }
  };

  if (!showModal) return null;

  // Different messages based on tier
  const getTitle = () => {
    if (tier === 'free' && limitType === 'daily') {
      return `You've used all ${limit} free questions today! 🎉`;
    }
    if (tier === 'starter' && limitType === 'monthly') {
      return `You've used all ${limit} questions this month! 📚`;
    }
    return `You've reached your limit! ⏰`;
  };

  const getDescription = () => {
    if (tier === 'free') {
      return 'Come back tomorrow for more free questions, or upgrade for more learning!';
    }
    if (tier === 'starter') {
      return 'Your monthly limit resets soon, or upgrade to Premium for unlimited questions!';
    }
    return 'Upgrade to continue learning without limits!';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-3">
          {getTitle()}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8">
          {getDescription()}
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Starter Card */}
          {tier === 'free' && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-lg text-gray-900">Starter</span>
              </div>
              
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  $4.99<span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600">~3 questions per day</p>
              </div>

              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>100 questions/month</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>50 conversations</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>30-day history</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Voice input</span>
                </li>
              </ul>

              <Button 
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() => handleUpgrade('starter')}
                disabled={isLoading !== null}
              >
                {isLoading === 'starter' ? 'Loading...' : 'Upgrade to Starter'}
              </Button>
            </div>
          )}

          {/* Premium Card */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-xl">
            {/* Popular badge for free users */}
            {tier === 'free' && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                MOST POPULAR
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 text-white">
              <Crown className="w-6 h-6 text-yellow-300" />
              <span className="font-bold text-lg">Premium</span>
            </div>
            
            <div className="mb-4">
              <div className="text-4xl font-bold text-white mb-1">
                $9.99<span className="text-lg text-indigo-200">/month</span>
              </div>
              <p className="text-sm text-indigo-200">Truly unlimited</p>
            </div>

            <ul className="space-y-2.5 mb-6 text-white">
              <li className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span><strong>✨ UNLIMITED questions</strong></span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Rocket className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span><strong>GPT-4o</strong> (best AI model)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Priority responses</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Crown className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Unlimited conversations</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Crown className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Permanent history</span>
              </li>
            </ul>

            <Button 
              size="lg"
              className="w-full bg-white text-indigo-600 hover:bg-gray-50 font-bold shadow-lg"
              onClick={() => handleUpgrade('premium')}
              disabled={isLoading !== null}
            >
              {isLoading === 'premium' ? 'Loading...' : 'Upgrade to Premium'}
            </Button>
          </div>
        </div>

        {/* Alternative action */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline"
            className="w-full mb-4"
            onClick={() => setShowModal(false)}
          >
            {tier === 'free' ? 'Come Back Tomorrow' : 'Maybe Later'}
          </Button>

          {/* Fine print */}
          <p className="text-xs text-gray-500">
            {tier === 'free' 
              ? 'Your free questions reset at midnight' 
              : tier === 'starter'
              ? 'Your monthly questions reset on the 1st'
              : 'Cancel anytime, no questions asked'
            }
          </p>
        </div>
      </div>
    </div>
  );
}