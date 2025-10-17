"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Heart, Zap, ArrowRight, Loader2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl transform group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Stupify
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium">
                Features
              </a>
              <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium">
                Pricing
              </a>
              <Button 
                variant="ghost" 
                onClick={handleLogin} 
                disabled={isLoginLoading || isSignupLoading}
                className="font-semibold"
              >
                {isLoginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <Button 
                onClick={handleSignup}
                disabled={isSignupLoading || isLoginLoading}
                className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                {isSignupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-3">
              <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900 font-medium">
                Features
              </a>
              <a href="/pricing" className="block py-2 text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </a>
              <div className="pt-2 space-y-2">
                <Button variant="ghost" onClick={handleLogin} className="w-full">
                  Sign In
                </Button>
                <Button onClick={handleSignup} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-2.5 rounded-full border border-indigo-100 group hover:border-indigo-200 transition-all cursor-default">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-900 to-violet-900 bg-clip-text text-transparent">
                Meet your AI learning companion
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900">Finally, an AI</span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  that speaks human
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-lg">
                Clear explanations. No jargon. Just learning that actually clicks.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-start pt-4">
              <Link href="/chat">
                <Button 
                  size="lg"
                  className="group shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                >
                  Start Learning Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <div className="flex flex-col text-sm text-gray-500 pt-2 sm:pt-4">
                <span className="font-semibold text-gray-700">10 questions daily, free</span>
                <span>No credit card needed</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-400 border-3 border-white ring-2 ring-indigo-100"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-bold text-gray-900">10,000+ learners</div>
                <div className="text-gray-500">joined this month</div>
              </div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative lg:pl-8">
            {/* Floating card with ambient glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl rounded-full" />
              
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-indigo-100/50 p-8 space-y-6 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-500">
                {/* User message */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-5 py-3.5 max-w-xs">
                    <p className="text-gray-700 font-medium">
                      What is quantum computing?
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl rounded-tl-sm px-5 py-3.5 flex-1 border border-indigo-100">
                    <p className="text-gray-700 leading-relaxed">
                      Think of it like this: Regular computers work with switches that are either on or off. Quantum computers use special switches that can be on, off, or both at the same time...
                    </p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex gap-3 opacity-60">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
              AI-powered
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              Always learning
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Learning made simple
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Designed to help you understand, not just memorize
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Choose your level",
              description: "From beginner to expert—explanations that match how you learn best",
              gradient: "from-indigo-500 to-violet-500"
            },
            {
              icon: Heart,
              title: "Feel confident",
              description: "Warm, encouraging answers that make every question feel welcome",
              gradient: "from-violet-500 to-purple-500"
            },
            {
              icon: Zap,
              title: "Get it instantly",
              description: "Clear examples and analogies that make complex ideas click",
              gradient: "from-purple-500 to-pink-500"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group relative bg-white rounded-3xl p-8 border border-indigo-100/50 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 cursor-default"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-3xl p-12 lg:p-16 border border-indigo-100/50">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              See the difference
            </h2>
            <p className="text-xl text-gray-600">
              Same question, completely different experience
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Other AI */}
            <div className="bg-white rounded-2xl p-6 border border-indigo-100/50 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">✕</span>
                </div>
                <span className="font-semibold text-gray-900">Other AI</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">You ask:</p>
                <p className="font-semibold text-gray-900">What is blockchain?</p>
              </div>
              
              <div className="bg-gray-900 text-gray-100 rounded-xl p-5 leading-relaxed">
                Blockchain is a distributed ledger technology utilizing cryptographic hashing and consensus mechanisms to ensure immutable record-keeping across decentralized nodes...
              </div>
              
              <div className="flex items-center gap-2 text-orange-600 pt-2">
                <span className="text-2xl">😕</span>
                <span className="font-medium">Wait, what?</span>
              </div>
            </div>
            
            {/* Stupify */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 border-2 border-indigo-200 space-y-4 relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                Better
              </div>

              <div className="flex items-center gap-3 pb-3 border-b border-indigo-100">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-gray-900">Stupify</span>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-gray-500 mb-1">You ask:</p>
                <p className="font-semibold text-gray-900">What is blockchain?</p>
              </div>
              
              <div className="bg-white rounded-xl p-5 leading-relaxed text-gray-700 border border-indigo-100">
                Think of blockchain like a notebook that everyone in your class can see and write in—but once something is written, nobody can erase it or change it...
              </div>
              
              <div className="flex items-center gap-2 text-green-600 pt-2">
                <span className="text-2xl">✓</span>
                <span className="font-medium">Oh, I get it!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl blur-2xl opacity-20" />
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-12 lg:p-16 text-center shadow-2xl shadow-indigo-500/30">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join 10,000+ people who learn without the confusion
            </p>
            <Link href="/chat">
              <Button 
                size="lg"
                variant="secondary"
                className="shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 font-semibold text-lg"
              >
                Get Started Free
              </Button>
            </Link>
            <p className="text-indigo-200 text-sm mt-4">
              10 questions daily • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 py-12 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold text-gray-900">Stupify</span>
              </div>
              <p className="text-gray-600 max-w-md leading-relaxed">
                Making AI accessible through simple, warm explanations. Finally, an AI that speaks human.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
              </ul>
            </div>
          
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 text-center text-sm text-gray-500">
            <p>© 2025 Stupify. Making AI accessible to everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}