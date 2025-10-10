'use client';

import { Button } from '@/components/ui/button';
import { XCircle, Heart, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { Mascot } from '@/components/mascot/Mascot';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Sad but understanding Blinky */}
        <div className="mb-6 flex justify-center">
          <Mascot expression="thinking" size={120} />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-4">
          <XCircle className="w-5 h-5 text-gray-600" />
          <span className="text-gray-900 font-semibold">Checkout Cancelled</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
          No worries! 👍
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
          Your checkout was cancelled. You can still use Stupify with <span className="font-semibold text-purple-600">10 free questions per day</span>!
        </p>

        {/* What you still have */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">You Still Have Access To:</h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">10 Free Questions</h3>
              <p className="text-sm text-gray-600">Every single day</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">3 Simplicity Levels</h3>
              <p className="text-sm text-gray-600">From 5yo to advanced</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-3 mx-auto">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-1 text-gray-900">Save Conversations</h3>
              <p className="text-sm text-gray-600">Access your history</p>
            </div>
          </div>
        </div>

        {/* Maybe Later Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-100">
          <h3 className="font-bold text-lg mb-2 text-gray-900">💭 Changed your mind?</h3>
          <p className="text-gray-700 mb-4">
            Premium is always available when you need unlimited questions!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="text-left sm:text-center">
              <p className="text-2xl font-bold text-purple-600">$4.99/month</p>
              <p className="text-sm text-gray-600">Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link href="/chat">
            <Button 
              size="lg" 
              className=" mb-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold px-12 h-16 shadow-lg w-full sm:w-auto"
            >
              Continue with Free Plan
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/pricing">
              <Button 
                variant="outline" 
                size="lg"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                View Pricing Again
              </Button>
            </Link>
            <span className="text-gray-400 hidden sm:inline">or</span>
            <Link href="/">
              <Button 
                variant="ghost" 
                size="lg"
                className="text-gray-600"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Have questions about Premium? <a href="mailto:support@stupify.ai" className="text-purple-600 hover:underline">Contact us</a></p>
        </div>
      </div>
    </div>
  );
}