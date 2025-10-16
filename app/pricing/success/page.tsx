'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Zap, Crown, Shield } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Mascot } from '@/components/mascot/Mascot';

export default function SuccessPage() {

  useEffect(() => {
    // Celebrate with confetti! 🎉
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#9333ea', '#3b82f6', '#eab308'],
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blinkys in corners - desktop only */}
      <div className="hidden lg:block absolute top-8 left-8 opacity-50">
        <Mascot expression="excited" size={100} />
      </div>
      <div className="hidden lg:block absolute top-8 right-8 opacity-50">
        <Mascot expression="excited" size={100} />
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Main Celebrating Blinky */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Mascot expression="excited" size={140} />
            {/* Premium Crown Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full p-3 shadow-lg animate-bounce">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Success Badge */}
        <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-900 font-semibold">Payment Successful</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to Premium! 🎉
        </h1>

        <p className="text-xl text-gray-700 mb-8">
          You&apos;re all set! You now have <span className="font-bold text-purple-600">unlimited access</span> to Stupify.
        </p>

        {/* Premium Features */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Your Premium Benefits:</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">Unlimited Questions</h3>
              <p className="text-sm text-gray-600">Ask as much as you want, 24/7</p>
            </div>

            <div className="text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">Priority Responses</h3>
              <p className="text-sm text-gray-600">Faster AI during peak times</p>
            </div>

            <div className="text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">Unlimited History</h3>
              <p className="text-sm text-gray-600">Never lose a conversation</p>
            </div>

            <div className="text-center sm:text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">Priority Support</h3>
              <p className="text-sm text-gray-600">Get help when needed</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 mb-8">
          <Link href="/chat">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold px-12 h-16 shadow-xl hover:scale-105 transition-transform"
            >
              Start Asking Questions →
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/pricing">
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                View My Subscription
              </Button>
            </Link>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <p className="text-sm text-gray-600">
              Manage subscription anytime in settings
            </p>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-100">
          <h3 className="font-bold text-lg mb-3 text-gray-900">🚀 What&apos;s Next?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✅ Your account has been upgraded to Premium</p>
            <p>✅ Daily question limits removed immediately</p>
            <p>✅ Receipt sent to your email</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-sm text-gray-500 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            A receipt has been sent to your email
          </p>
          <p>Questions? Contact us at <a href="mailto:support@stupify.app" className="text-purple-600 hover:underline">support@stupify.app</a></p>
        </div>
      </div>
    </div>
  );
}