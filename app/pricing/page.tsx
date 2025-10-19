'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Zap, Shield, X, ArrowLeft, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: 'starter' | 'premium') => {
    setIsLoading(tier);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2.5 rounded-full border border-indigo-100 mb-8">
          <Crown className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-semibold bg-gradient-to-r from-indigo-900 to-violet-900 bg-clip-text text-transparent">
            Simple, transparent pricing
          </span>
        </div>

        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
          <span className="text-gray-900">Learn at your pace,</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            pay for what you need
          </span>
        </h1>

        <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          From casual learner to knowledge enthusiast, we have a plan that fits your curiosity.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/15 transition-all duration-300 ring-1 ring-gray-900/5">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Free</h3>
              <div className="mb-4">
                <span className="text-6xl font-bold text-gray-900">$0</span>
              </div>
              <p className="text-gray-600 leading-relaxed">Try it out, no credit card needed</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">5 questions per day</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">All 3 simplicity levels</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">Save up to 3 conversations</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">7-day history</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-gray-400" strokeWidth={3} />
                </div>
                <span className="text-gray-500 leading-relaxed">
                  Voice input
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-gray-400" strokeWidth={3} />
                </div>
                <span className="text-gray-500 leading-relaxed">
                  Shareable cards
                </span>
              </li>
            </ul>

            <Link href="/signup">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-lg font-semibold h-14 hover:bg-gray-50"
              >
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Starter Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 ring-2 ring-blue-200">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="w-7 h-7 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
              </div>
              <div className="mb-4">
                <span className="text-6xl font-bold text-gray-900">$4.99</span>
                <span className="text-xl font-normal text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600 leading-relaxed">Perfect for students & casual learners</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">100 questions per month</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">All 3 simplicity levels</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">Save up to 50 conversations</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">30-day history</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">Voice input</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700 leading-relaxed">
                  <strong className="text-gray-900 font-semibold">Shareable cards</strong>
                </span>
              </li>
            </ul>

            <Button 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold h-14 hover:scale-105 transition-transform"
              onClick={() => handleUpgrade('starter')}
              disabled={isLoading !== null}
            >
              {isLoading === 'starter' ? 'Loading...' : 'Choose Starter'}
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-300">
            {/* Popular Badge */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              MOST POPULAR
            </div>

            <div className="text-center mb-8 text-white">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Crown className="w-7 h-7 text-yellow-300" />
                <h3 className="text-2xl font-bold">Premium</h3>
              </div>
              <div className="mb-4">
                <span className="text-6xl font-bold">$9.99</span>
                <span className="text-xl font-normal text-indigo-100 ml-2">/month</span>
              </div>
              <p className="text-indigo-100 leading-relaxed">For the endlessly curious</p>
            </div>

            <ul className="space-y-4 mb-8 text-white">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">✨ UNLIMITED questions</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Rocket className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">GPT-4o AI model</strong> — Best answers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">Priority responses</strong> — Faster answers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Crown className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">Unlimited conversations</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Crown className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">Permanent history</strong> — Never lose anything
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-yellow-300" strokeWidth={3} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">Voice input & shareable cards</strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-yellow-300" strokeWidth={2.5} />
                </div>
                <span className="text-white leading-relaxed">
                  <strong className="font-semibold">Priority support</strong>
                </span>
              </li>
            </ul>

            <Button 
              size="lg" 
              className="w-full bg-white text-indigo-600 hover:bg-gray-50 text-lg font-bold h-14 shadow-xl hover:scale-105 transition-transform"
              onClick={() => handleUpgrade('premium')}
              disabled={isLoading !== null}
            >
              {isLoading === 'premium' ? 'Loading...' : 'Choose Premium'}
            </Button>

            <p className="text-white text-center text-sm mt-4">
              Join hundreds of learners loving Stupify
            </p>
          </div>
        </div>

        {/* Comparison Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            <strong className="text-gray-900">Not sure which plan?</strong> Start with Starter and upgrade anytime!
          </p>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-5 rounded-2xl shadow-lg shadow-green-500/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900 text-lg">30-Day Money Back Guarantee</div>
              <div className="text-gray-600">Not happy? Get a full refund, no questions asked.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "What's the difference between Starter and Premium?",
                answer: "Starter gives you 100 questions per month (perfect for homework and occasional learning), while Premium gives you UNLIMITED questions plus better AI (GPT-4o) and permanent conversation history."
              },
              {
                question: "Can I upgrade from Starter to Premium?",
                answer: "Absolutely! You can upgrade anytime from your account settings. You'll be charged the difference for the remaining days of your billing period."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes! Cancel your subscription anytime from your account settings. No hidden fees, no questions asked. You'll keep access until the end of your billing period."
              },
              {
                question: "What happens to my conversations if I downgrade?",
                answer: "All your conversations stay saved! You just go back to the limits of your new plan. You can still view all your old chats anytime."
              },
              {
                question: "How does the 30-day guarantee work?",
                answer: "If you're not satisfied within 30 days of subscribing, just email us and we'll refund your money. No complicated process, no hassle."
              },
              {
                question: "Can I try before I buy?",
                answer: "Yes! Everyone gets 5 free questions per day. No credit card required to start. Try Stupify out and upgrade when you're ready."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 blur-2xl opacity-20" />
        <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to learn without limits?
            </h2>
            <p className="text-xl lg:text-2xl mb-10 text-indigo-100 leading-relaxed">
              Choose the plan that fits your learning style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 text-lg font-bold px-12 h-16 hover:scale-105 transition-transform shadow-2xl"
                onClick={() => handleUpgrade('starter')}
                disabled={isLoading !== null}
              >
                {isLoading === 'starter' ? 'Loading...' : 'Start with Starter — $4.99'}
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-gray-50 text-lg font-bold px-12 h-16 hover:scale-105 transition-transform shadow-2xl"
                onClick={() => handleUpgrade('premium')}
                disabled={isLoading !== null}
              >
                {isLoading === 'premium' ? 'Loading...' : 'Go Premium — $9.99'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}