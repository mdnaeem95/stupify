"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Heart, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLogin = () => {
    setIsLoginLoading(true);
    router.push('/login');
  };

  const handleSignup = () => {
    setIsSignupLoading(true);
    router.push('/signup');
  };

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
              <Button variant="ghost" className="text-gray-700 hover:cursor-pointer" onClick={handleLogin} disabled={isLoginLoading || isSignupLoading}>
                {isLoginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              <Button 
                className="hover:cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                onClick={handleSignup}
                disabled={isSignupLoading || isLoginLoading}
              >
                {isSignupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Blinky */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-6 border border-purple-200">
              <span className="text-2xl">💡</span>
              <span className="text-sm font-semibold text-purple-900">Meet Blinky, your AI friend!</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Finally, an AI that
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                speaks human
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              No jargon. No confusion. Just simple explanations that actually make sense.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link href="/chat">
                <Button 
                  size="lg" 
                  className=" hover:cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6 h-auto group shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                >
                  Start Asking Questions
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="text-sm text-gray-500 mt-3">
                <div className="font-medium text-gray-700">10 free questions/day</div>
                <div>No credit card required</div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white"/>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">10,000+</span> learners
              </div>
            </div>
          </div>

          {/* Right - Blinky Mascot */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10 animate-bounce">
                👋 Hi there!
              </div>
              
              {/* Blinky SVG */}
              <svg viewBox="0 0 200 200" className="w-80 h-80 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bulbGradientHero" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#a855f7',stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                  </linearGradient>
                  <linearGradient id="glowGradientHero" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#fbbf24',stopOpacity:0.8}} />
                    <stop offset="100%" style={{stopColor:'#f59e0b',stopOpacity:0.6}} />
                  </linearGradient>
                </defs>
                
                {/* Glow effect */}
                <circle cx="100" cy="80" r="55" fill="url(#glowGradientHero)" opacity="0.3">
                  <animate attributeName="r" values="55;60;55" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                
                {/* Main lightbulb */}
                <path d="M 100 30 C 75 30, 60 45, 60 70 C 60 85, 65 95, 70 105 L 70 115 L 130 115 L 130 105 C 135 95, 140 85, 140 70 C 140 45, 125 30, 100 30 Z" 
                      fill="url(#bulbGradientHero)" stroke="#6366f1" strokeWidth="2"/>
                
                {/* Highlight */}
                <ellipse cx="85" cy="55" rx="15" ry="20" fill="white" opacity="0.4"/>
                <ellipse cx="90" cy="50" rx="8" ry="10" fill="white" opacity="0.6"/>
                
                {/* Screw threads */}
                <rect x="75" y="115" width="50" height="8" fill="#cbd5e1" rx="2"/>
                <rect x="75" y="125" width="50" height="8" fill="#94a3b8" rx="2"/>
                <rect x="75" y="135" width="50" height="8" fill="#cbd5e1" rx="2"/>
                
                {/* Base */}
                <rect x="80" y="145" width="40" height="12" fill="#64748b" rx="3"/>
                
                {/* Happy waving face */}
                <g>
                  {/* Winking */}
                  <circle cx="85" cy="75" r="5" fill="#1e293b"/>
                  <circle cx="87" cy="73" r="2" fill="white"/>
                  <path d="M 108 75 Q 115 73, 122 75" 
                        stroke="#1e293b" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"/>
                  
                  {/* Big smile */}
                  <path d="M 80 90 Q 100 108, 120 90" 
                        stroke="#1e293b" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeLinecap="round"/>
                  
                  {/* Rosy cheeks */}
                  <circle cx="70" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
                  <circle cx="130" cy="85" r="6" fill="#f472b6" opacity="0.4"/>
                </g>
                
                {/* Sparkles */}
                <g>
                  <path d="M 145 45 L 147 50 L 152 52 L 147 54 L 145 59 L 143 54 L 138 52 L 143 50 Z" fill="#fbbf24">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                  </path>
                  <path d="M 55 50 L 57 55 L 62 57 L 57 59 L 55 64 L 53 59 L 48 57 L 53 55 Z" fill="#fbbf24">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                  </path>
                  <path d="M 100 25 L 102 30 L 107 32 L 102 34 L 100 39 L 98 34 L 93 32 L 98 30 Z" fill="#fbbf24">
                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                  </path>
                </g>
                
                {/* Waving arm */}
                <g>
                  <path d="M 60 90 Q 45 85, 35 95" 
                        stroke="#6366f1" 
                        strokeWidth="6" 
                        fill="none" 
                        strokeLinecap="round">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 60 90"
                      to="15 60 90"
                      dur="0.5s"
                      repeatCount="indefinite"
                      direction="alternate"
                    />
                  </path>
                  <circle cx="35" cy="95" r="5" fill="#6366f1">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 60 90"
                      to="15 60 90"
                      dur="0.5s"
                      repeatCount="indefinite"
                      direction="alternate"
                    />
                  </circle>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mt-32">
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
              
              {/* Stupify with Blinky */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200 shadow-sm relative">
                {/* Mini Blinky */}
                <div className="absolute -top-6 -right-6 w-16 h-16">
                  <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="bulbMini" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#a855f7',stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:'#3b82f6',stopOpacity:1}} />
                      </linearGradient>
                    </defs>
                    <path d="M 100 30 C 75 30, 60 45, 60 70 C 60 85, 65 95, 70 105 L 70 115 L 130 115 L 130 105 C 135 95, 140 85, 140 70 C 140 45, 125 30, 100 30 Z" 
                          fill="url(#bulbMini)" stroke="#6366f1" strokeWidth="2"/>
                    <rect x="75" y="115" width="50" height="20" fill="#94a3b8" rx="2"/>
                    <circle cx="85" cy="75" r="5" fill="#1e293b"/>
                    <circle cx="115" cy="75" r="5" fill="#1e293b"/>
                    <path d="M 80 90 Q 100 100, 120 90" stroke="#1e293b" strokeWidth="3" fill="none"/>
                  </svg>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="font-semibold text-gray-900">Stupify + Blinky</span>
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
              Ready to learn with Blinky?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join 10,000+ people learning without the confusion
            </p>
            <Link href="/chat">
              <Button 
                size="lg" 
                variant="secondary" 
                className="hover:cursor-pointer text-lg px-10 py-6 h-auto bg-white text-purple-600 hover:bg-gray-50 shadow-xl font-bold hover:scale-105 transition-transform"
              >
                Start Learning Now - It&apos;s Free!
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Changed to grid-cols-3 and added justify-items-center to center the columns */}
          <div className="grid md:grid-cols-3 gap-8 mb-8 justify-items-center md:justify-items-start max-w-3xl mx-auto">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">Stupify</span>
              </div>
              <p className="text-gray-600 text-sm">
                AI that speaks human.<br />Finally.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-gray-900 transition">Features</a></li>
                <li><a href="/pricing" className="hover:text-gray-900 transition">Pricing</a></li>
              </ul>
            </div>
          
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-gray-900 transition">Privacy</a></li>
                <li><a href="/terms" className="hover:text-gray-900 transition">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            © 2025 Stupify. Made with ❤️ by Blinky to make AI accessible to everyone.
          </div>
        </div>
      </footer>
    </div>
  );
}