'use client';

import { X, Mic, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface VoiceUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: 'free' | 'starter' | 'premium';
}

export function VoiceUpgradeModal({ isOpen, onClose }: VoiceUpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Header with Gradient */}
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 rounded-t-3xl p-8 text-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Icon */}
            <div className="relative mb-4 inline-flex">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <Mic className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" fill="currentColor" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Voice Input
            </h2>
            <p className="text-indigo-100 text-sm">
              Ask questions hands-free with your voice
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-gray-700 mb-6 text-center leading-relaxed">
              Voice input is available for <span className="font-semibold text-indigo-600">Starter</span> and <span className="font-semibold text-violet-600">Premium</span> users. Upgrade to unlock this feature!
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-lg p-1.5 mt-0.5">
                  <Check className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">15+ Languages</p>
                  <p className="text-sm text-gray-600">Ask in your preferred language</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-violet-100 rounded-lg p-1.5 mt-0.5">
                  <Check className="w-4 h-4 text-violet-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hands-Free Learning</p>
                  <p className="text-sm text-gray-600">Perfect while cooking, driving, or multitasking</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 rounded-lg p-1.5 mt-0.5">
                  <Check className="w-4 h-4 text-purple-600" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Natural Conversations</p>
                  <p className="text-sm text-gray-600">Speak naturally, just like you think</p>
                </div>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="space-y-3 mb-6">
              {/* Starter Plan */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4 border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">Starter</h3>
                    <p className="text-xs text-gray-600">100 questions/month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">$4.99</p>
                    <p className="text-xs text-gray-600">per month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-indigo-600" strokeWidth={2.5} />
                  <span>Voice input included</span>
                </div>
              </div>

              {/* Premium Plan - Highlighted */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 border-2 border-violet-500 relative overflow-hidden shadow-lg">
                {/* Popular badge */}
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  POPULAR
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white">Premium</h3>
                    <p className="text-xs text-violet-200">Unlimited everything</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">$9.99</p>
                    <p className="text-xs text-violet-200">per month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  <span>Voice input + GPT-4o AI</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl h-12 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View Plans & Upgrade
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl h-12 font-medium transition-colors"
              >
                Maybe Later
              </Button>
            </div>

            {/* Trust signals */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Cancel anytime • No long-term commitment • Instant activation
            </p>
          </div>
        </div>
      </div>
    </>
  );
}