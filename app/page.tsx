import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Heart, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-xl shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Stupify</span>
            </div>
            <div className="hidden md:flex gap-6 items-center">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
              <Button variant="ghost" className="text-gray-700">Login</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          {/* Mascot Icon */}
          <div className="mb-8 inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
            Finally, an AI that
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              speaks human
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
            No jargon. No confusion. Just simple explanations<br className="hidden md:block" /> that actually make sense.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/chat">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto group shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
              >
                Start Asking Questions
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500">Free to use • No signup required (for now)</p>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group cursor-pointer">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Choose Your Level</h3>
            <p className="text-gray-600">
              Explain like you&apos;re 5, a normal person, or someone with knowledge. You pick!
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Never Feel Stupid</h3>
            <p className="text-gray-600">
              Warm, encouraging answers that make learning feel safe and fun.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group cursor-pointer">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Real Examples</h3>
            <p className="text-gray-600">
              Every explanation uses analogies and examples you can actually picture.
            </p>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-32 bg-gray-50 -mx-4 px-4 py-20 md:rounded-3xl">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">See the difference</h2>
            <p className="text-center text-gray-600 mb-12">Same question, completely different experience</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Other AI */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold">✕</span>
                  </div>
                  <span className="font-semibold text-gray-900">Other AI</span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                  <p className="text-sm text-gray-600">
                    User asks: <span className="font-medium text-gray-900">&quot;What is blockchain?&quot;</span>
                  </p>
                </div>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm leading-relaxed">
                  &quot;Blockchain is a distributed ledger technology utilizing cryptographic hashing and consensus mechanisms to ensure immutable record-keeping across decentralized nodes...&quot;
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-orange-600">
                  <span className="text-xl">😕</span>
                  <span className="text-sm font-medium">Huh?</span>
                </div>
              </div>
              
              {/* Stupify */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="font-semibold text-gray-900">Stupify</span>
                </div>
                
                <div className="bg-white p-4 rounded-lg mb-4 border border-purple-100">
                  <p className="text-sm text-gray-600">
                    User asks: <span className="font-medium text-gray-900">&quot;What is blockchain?&quot;</span>
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg text-sm leading-relaxed text-gray-700 border border-purple-100">
                  &quot;Think of blockchain like a notebook that everyone in your class can see and write in - but once something is written, nobody can erase it or change it...&quot;
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-green-600">
                  <span className="text-xl">😊</span>
                  <span className="text-sm font-medium">Oh, I get it!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to understand anything?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of people learning without the confusion
            </p>
            <Link href="/chat">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-10 py-6 h-auto bg-white text-purple-600 hover:bg-gray-50 shadow-xl font-bold hover:scale-105 transition-transform"
              >
                Start Learning Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Stupify</span>
              </div>
              <p className="text-gray-600 text-sm">
                AI that speaks human.<br />Finally.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900 transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-gray-900 transition">Pricing</a></li>
                <li><a href="#faq" className="hover:text-gray-900 transition">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#about" className="hover:text-gray-900 transition">About</a></li>
                <li><a href="#blog" className="hover:text-gray-900 transition">Blog</a></li>
                <li><a href="#contact" className="hover:text-gray-900 transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#privacy" className="hover:text-gray-900 transition">Privacy</a></li>
                <li><a href="#terms" className="hover:text-gray-900 transition">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            © 2025 Stupify. Making AI accessible to everyone.
          </div>
        </div>
      </footer>
    </div>
  );
}