'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, CreditCard, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

interface SubscriptionData {
  status: 'free' | 'premium';
  stripeCustomerId?: string;
  billingPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export function SubscriptionSettings() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, stripe_customer_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSubscription({
          status: profile.subscription_status || 'free',
          stripeCustomerId: profile.stripe_customer_id,
        });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
      setIsOpeningPortal(false);
    }
  };

  const handleUpgrade = async () => {
    setIsOpeningPortal(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" strokeWidth={2} />
      </div>
    );
  }

  const isPremium = subscription?.status === 'premium';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
        <p className="text-gray-600 leading-relaxed">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <div className={`relative p-6 rounded-2xl ${
        isPremium 
          ? 'bg-gradient-to-br from-indigo-50 to-violet-50' 
          : 'bg-gray-50'
      }`}>
        <div className="flex items-start gap-4 mb-6">
          {isPremium ? (
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl blur-lg opacity-40" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Crown className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
          ) : (
            <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 text-gray-500" strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </h3>
              {isPremium && (
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg shadow-green-500/30">
                  Active
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {isPremium ? 'Unlimited questions, unlimited learning' : '10 questions per day'}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-gray-900">
              {isPremium ? '$4.99' : '$0'}
            </div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4">Your Benefits</h4>
          <ul className="space-y-2.5">
            {isPremium ? (
              <>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Unlimited questions</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Unlimited conversation history</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Priority AI responses</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>All 3 simplicity levels</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Voice input</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Shareable explanation cards</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Priority email support</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>10 questions per day</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>All 3 simplicity levels</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Save up to 5 conversations</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2} />
                  <span>Email support</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Billing Management */}
      {isPremium ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-gray-900">
            <CreditCard className="w-5 h-5 text-gray-600" strokeWidth={2} />
            <h3 className="font-semibold">Billing Management</h3>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            Manage your payment method, view invoices, and update billing information through the Stripe Customer Portal.
          </p>

          <Button 
            onClick={handleManageSubscription}
            disabled={isOpeningPortal}
            variant="outline"
            className="hover:bg-gray-50 transition-colors cursor-pointer">
            {isOpeningPortal ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" strokeWidth={2} />
                Manage Billing
              </>
            )}
          </Button>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Cancel Subscription</h4>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              You can cancel your subscription anytime. You&apos;ll continue to have Premium access until the end of your current billing period.
            </p>
            <Button
              onClick={handleManageSubscription}
              variant="outline"
              className="hover:bg-white transition-colors cursor-pointer"
              disabled={isOpeningPortal}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl rounded-2xl" />
            
            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold">Upgrade to Premium</h3>
              </div>
              
              <p className="text-indigo-100 mb-6 leading-relaxed">
                Unlock unlimited questions and get the most out of your learning journey.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2} />
                  <span>Ask as many questions as you want</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2} />
                  <span>Save unlimited conversations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2} />
                  <span>Priority responses during peak times</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" strokeWidth={2} />
                  <span>Access to all future premium features</span>
                </li>
              </ul>

              <Button
                onClick={handleUpgrade}
                disabled={isOpeningPortal}
                className="w-full bg-white text-indigo-600 hover:bg-gray-50 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
                    Loading...
                  </>
                ) : (
                  'Upgrade Now - $4.99/month'
                )}
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Cancel anytime • No long-term commitment • Instant activation</p>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Yes! You can cancel your subscription at any time with no penalties. You&apos;ll continue to have Premium access until the end of your current billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Will I get a refund if I cancel?</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Subscription fees are non-refundable, but you&apos;ll retain access to Premium features until the end of your current billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}