'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Zap, Shield, X } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      // Call Stripe checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-b border-gray-100">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          ← Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
          <Crown className="w-5 h-5 text-purple-600" />
          <span className="text-purple-900 font-semibold">Simple, Transparent Pricing</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-gray-900">
          Unlimited Questions,
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Zero Confusion
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Get unlimited access to Stupify&apos;s AI that actually explains things simply.
          No jargon, no limits.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-200 p-8 hover:shadow-xl transition">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Free</h3>
              <div className="text-5xl font-bold mb-2 text-gray-900">$0</div>
              <p className="text-gray-600">Try it out, no credit card needed</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">10 questions per day</strong> - Perfect for trying out
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">3 simplicity levels</strong> - From 5yo to advanced
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  <strong className="text-gray-900">Save conversations</strong> - Access your chat history
                </span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500">
                  Daily limit resets at midnight
                </span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-500">
                  No priority support
                </span>
              </li>
            </ul>

            <Link href="/signup">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-lg h-14 border-2 border-gray-300 hover:bg-gray-50"
              >
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl border-2 border-purple-400 p-8 relative overflow-hidden hover:scale-105 transition-transform">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              POPULAR
            </div>

            <div className="text-center mb-6 text-white">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6" />
                Premium
              </h3>
              <div className="text-5xl font-bold mb-2">
                $4.99
                <span className="text-xl font-normal opacity-90">/month</span>
              </div>
              <p className="text-purple-100">Unlimited learning, unlimited questions</p>
            </div>

            <ul className="space-y-4 mb-8 text-white">
              <li className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  <strong className="font-bold">Unlimited questions</strong> - Ask as much as you want, anytime
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  <strong className="font-bold">Priority AI responses</strong> - Faster answers during peak times
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  <strong className="font-bold">Unlimited chat history</strong> - Never lose a conversation
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  <strong className="font-bold">Priority support</strong> - Get help when you need it
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  <strong className="font-bold">Cancel anytime</strong> - No questions asked
                </span>
              </li>
            </ul>

            <Button 
              size="lg" 
              className="w-full bg-white text-purple-600 hover:bg-gray-100 text-lg font-bold h-14 shadow-lg hover:scale-105 transition-transform"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Upgrade to Premium'}
            </Button>

            <p className="text-white text-center text-sm mt-4 opacity-95">
              🎉 Join hundreds of learners loving Stupify
            </p>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 px-6 py-4 rounded-2xl">
            <Shield className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <div className="font-bold text-green-900">30-Day Money Back Guarantee</div>
              <div className="text-sm text-green-700">Not happy? Get a full refund, no questions asked.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Can I cancel anytime?</h3>
              <p className="text-gray-700">
                Absolutely! Cancel your subscription anytime from your account settings. 
                No hidden fees, no questions asked. You&apos;ll keep access until the end of your billing period.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">What happens to my conversations if I downgrade?</h3>
              <p className="text-gray-700">
                All your conversations stay saved! You just go back to the 10 questions/day limit. 
                You can still view all your old chats anytime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Is this really unlimited?</h3>
              <p className="text-gray-700">
                Yes! Premium users can ask as many questions as they want. 
                No daily limits, no hourly caps, no tricks. Just unlimited learning.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">How does the 30-day guarantee work?</h3>
              <p className="text-gray-700">
                If you&apos;re not satisfied within 30 days of subscribing, just email us and we&apos;ll 
                refund your money. No complicated process, no hassle.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Can I try before I buy?</h3>
              <p className="text-gray-700">
                Yes! Everyone gets 10 free questions per day. No credit card required to start. 
                Try Stupify out and upgrade when you&apos;re ready for unlimited access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to learn without limits?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join Stupify Premium and never hit a question limit again.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg font-bold px-12 h-16 hover:scale-105 transition-transform shadow-xl"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Start Premium Now - $4.99/month'}
          </Button>
        </div>
      </div>
    </div>
  );
}