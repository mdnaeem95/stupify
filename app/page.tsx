import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Heart, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stupify
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
            Finally, an AI that
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              speaks human
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
            No jargon. No confusion. Just simple explanations that actually make sense.
          </p>

          {/* CTA Button */}
          <Link href="/chat">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto group shadow-lg">
              Start Asking Questions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <p className="text-sm text-gray-600 mt-4 font-medium">
            Free to use • No signup required (for now)
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Choose Your Level</h3>
            <p className="text-gray-700">
              Explain like you`&apos;`re 5, a normal person, or someone with knowledge. You pick!
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Never Feel Stupid</h3>
            <p className="text-gray-700">
              Warm, encouraging answers that make learning feel safe and fun.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-700" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Real Examples</h3>
            <p className="text-gray-700">
              Every explanation uses analogies and examples you can actually picture.
            </p>
          </div>
        </div>

        {/* Before & After Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            See the Difference
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Other AI */}
            <div className="bg-white p-6 rounded-xl border-3 border-red-300 shadow-md">
              <div className="flex items-center gap-2 text-red-600 font-bold mb-3 text-lg">
                <span className="text-2xl">❌</span> Other AI
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-300">
                <p className="text-sm text-gray-700 mb-2 font-medium">User asks: `&quot;`What is blockchain?`&quot;`</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-900 border border-gray-300">
                `&quot;`Blockchain is a distributed ledger technology utilizing cryptographic hashing and consensus mechanisms to ensure immutable record-keeping across decentralized nodes...`&quot;`
              </div>
              <p className="text-sm text-gray-600 mt-3 italic font-medium">😵 Huh?</p>
            </div>

            {/* Stupify */}
            <div className="bg-white p-6 rounded-xl border-3 border-green-400 shadow-md">
              <div className="flex items-center gap-2 text-green-600 font-bold mb-3 text-lg">
                <span className="text-2xl">✅</span> Stupify
              </div>
              <div className="bg-green-50 p-4 rounded-lg mb-3 border border-green-300">
                <p className="text-sm text-gray-700 mb-2 font-medium">User asks: `&quot;`What is blockchain?`&quot;`</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-sm text-gray-900 border border-green-300">
                `&quot;`Think of blockchain like a notebook that everyone in your class can see and write in - but once something is written, nobody can erase it or change it...`&quot;`
              </div>
              <p className="text-sm text-green-700 mt-3 italic font-medium">😊 Oh, I get it!</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white shadow-xl">
            <h2 className="text-4xl font-bold mb-4">Ready to understand anything?</h2>
            <p className="text-xl mb-8">
              Join thousands of people learning without the confusion
            </p>
            <Link href="/chat">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto bg-white text-purple-700 hover:bg-gray-100 shadow-lg font-semibold">
                Start Learning Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t-2 border-gray-300 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-700">
          <p className="font-medium">Made with ❤️ to make AI accessible to everyone</p>
        </div>
      </footer>
    </div>
  );
}