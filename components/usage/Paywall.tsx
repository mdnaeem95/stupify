'use client';

import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Zap, Clock } from 'lucide-react';
import Link from 'next/link';

interface PaywallProps {
  limit: number;
}

export function Paywall({ limit }: PaywallProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close hint */}
        <div className="absolute top-4 right-4 text-gray-400 text-sm">
          ESC to close
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-3">
          You&apos;ve used all {limit} free questions today! 🎉
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Come back tomorrow for {limit} more free questions, or upgrade to Premium for unlimited access!
        </p>

        {/* Premium Benefits */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-lg">Premium Benefits</span>
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                <strong>Unlimited questions</strong> - Ask as much as you want
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                <strong>Priority AI responses</strong> - Faster answers
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                <strong>Save conversation history</strong> - Access anytime
              </span>
            </li>
          </ul>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            $4.99<span className="text-xl text-gray-500">/month</span>
          </div>
          <p className="text-sm text-gray-500">
            Cancel anytime • No hidden fees
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link href="/pricing">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg h-14"
            >
              Upgrade to Premium
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Come Back Tomorrow
          </Button>
        </div>

        {/* Fine print */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your free questions reset at midnight
        </p>
      </div>
    </div>
  );
}