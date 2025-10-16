'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, CreditCard, ExternalLink, CheckCircle2 } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const isPremium = subscription?.status === 'premium';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription</h2>
        <p className="text-gray-600">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <div className={`p-6 rounded-xl border-2 ${
        isPremium 
          ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isPremium ? 'Unlimited questions, unlimited learning' : '10 questions per day'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {isPremium ? '$4.99' : '$0'}
            </div>
            <div className="text-sm text-gray-600">per month</div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Your Benefits:</h4>
          <ul className="space-y-2">
            {isPremium ? (
              <>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Unlimited questions
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Unlimited conversation history
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Priority AI responses
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  All 3 simplicity levels
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Voice input
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Shareable explanation cards
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Priority email support
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  10 questions per day
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  All 3 simplicity levels
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Save up to 5 conversations
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Email support
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Billing Management */}
      {isPremium ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-semibold">Billing Management</h3>
          </div>
          
          <p className="text-sm text-gray-600">
            Manage your payment method, view invoices, and update billing information through the Stripe Customer Portal.
          </p>

          <Button 
            onClick={handleManageSubscription}
            disabled={isOpeningPortal}
            variant="outline"
            className="border-gray-300"
          >
            {isOpeningPortal ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </>
            )}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">Cancel Subscription</h4>
            <p className="text-sm text-blue-800 mb-3">
              You can cancel your subscription anytime. You&apos;ll continue to have Premium access until the end of your current billing period.
            </p>
            <Button
              onClick={handleManageSubscription}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              disabled={isOpeningPortal}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Crown className="w-6 h-6" />
              Upgrade to Premium
            </h3>
            <p className="text-purple-100 mb-4">
              Unlock unlimited questions and get the most out of your learning journey.
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-200" />
                Ask as many questions as you want
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-200" />
                Save unlimited conversations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-200" />
                Priority responses during peak times
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-200" />
                Access to all future premium features
              </li>
            </ul>

            <Button
              onClick={handleUpgrade}
              disabled={isOpeningPortal}
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold"
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Upgrade Now - $4.99/month'
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Cancel anytime • No long-term commitment • Instant activation</p>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes! You can cancel your subscription at any time with no penalties. You&apos;ll continue to have Premium access until the end of your current billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Will I get a refund if I cancel?</h4>
            <p className="text-sm text-gray-600">
              Subscription fees are non-refundable, but you&apos;ll retain access to Premium features until the end of your current billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}