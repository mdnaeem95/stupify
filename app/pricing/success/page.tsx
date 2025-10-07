'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          Welcome to Premium! 🎉
        </h1>

        <p className="text-xl text-gray-700 mb-8">
          You&apos;re all set! You now have unlimited access to Stupify.
        </p>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What You Get:</h2>
          
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-1">Unlimited Questions</h3>
              <p className="text-sm text-gray-600">Ask as much as you want, anytime</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-1">Priority Support</h3>
              <p className="text-sm text-gray-600">Get help when you need it</p>
            </div>

            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-1">Save Everything</h3>
              <p className="text-sm text-gray-600">Unlimited chat history</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link href="/chat">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold px-12 h-16"
            >
              Start Asking Questions →
            </Button>
          </Link>

          <p className="text-sm text-gray-600">
            You can manage your subscription anytime from your account settings.
          </p>
        </div>

        {/* Receipt */}
        <div className="mt-8 text-sm text-gray-500">
          <p>A receipt has been sent to your email.</p>
          <p>Questions? Contact us at support@stupify.ai</p>
        </div>
      </div>
    </div>
  );
}