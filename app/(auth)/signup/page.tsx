/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await signUp(email, password, fullName);
      
      // Check if email confirmation is required
      if (!user?.email_confirmed_at) {
        // Email confirmation required - show success message
        setEmailSent(true);
      } else {
        // Email already confirmed (shouldn't happen on new signups)
        window.location.href = '/chat';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state after email sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-12 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl transform group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Stupify
            </span>
          </Link>

          {/* Success Message */}
          <div className="space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-green-400 to-emerald-400 p-4 rounded-full">
                  <Mail className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-gray-900">
                Check your email
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                We sent a verification link to
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-gray-700">
                  Click the verification link in your email to activate your account
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-gray-700">
                  After verifying, you&apos;ll be redirected to sign in
                </p>
              </div>
            </div>

            {/* Didn't receive email */}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the email?
              </p>
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                variant="outline"
                className="font-semibold"
              >
                Try a different email
              </Button>
            </div>

            {/* Back to home */}
            <div className="text-center pt-4">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-gray-700 font-semibold hover:text-gray-900 transition-colors group"
              >
                <span>Back to home</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular signup form
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-12 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl transform group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Stupify
          </span>
        </Link>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Start learning today
            </h1>
            <p className="text-lg text-gray-600">
              Get clear explanations for anything you&apos;re curious about
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-5 py-3.5 rounded-2xl border border-red-100">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="h-12 px-4 rounded-xl bg-gray-50 border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="h-12 px-4 rounded-xl bg-gray-50 border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="h-12 px-4 rounded-xl bg-gray-50 border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-sm text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="group w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-gray-700 font-semibold hover:text-gray-900 transition-colors group"
            >
              <span>Sign in instead</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-gray-700 hover:text-gray-900 transition-colors">
            Terms
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-gray-700 hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}