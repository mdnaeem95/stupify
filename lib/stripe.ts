import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Subscription tiers
export type SubscriptionTier = 'free' | 'starter' | 'premium';

// Pricing configuration
export const PRICING = {
  FREE: {
    tier: 'free' as SubscriptionTier,
    price: 0,
    priceId: null,
    name: 'Free',
    description: '5 questions per day',
    features: [
      '5 questions per day',
      'All 3 simplicity levels',
      'Save up to 3 conversations',
      '7-day conversation history',
      'Email support',
    ],
    limits: {
      questionsPerDay: 5,
      questionsPerMonth: null,
      maxConversations: 3,
      conversationRetentionDays: 7,
    },
  },
  
  STARTER: {
    tier: 'starter' as SubscriptionTier,
    price: 499, // $4.99 in cents
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
    name: 'Starter',
    description: '100 questions per month',
    features: [
      '100 questions per month',
      'All 3 simplicity levels',
      'Save up to 50 conversations',
      '30-day conversation history',
      'Voice input',
      'Shareable cards',
      'Email support',
    ],
    limits: {
      questionsPerDay: null,
      questionsPerMonth: 100,
      maxConversations: 50,
      conversationRetentionDays: 30,
    },
    popular: false,
  },
  
  PREMIUM: {
    tier: 'premium' as SubscriptionTier,
    price: 999, // $9.99 in cents
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
    name: 'Premium',
    description: 'Unlimited questions',
    features: [
      '✨ UNLIMITED questions',
      'All 3 simplicity levels',
      'Unlimited conversations',
      'Permanent conversation history',
      'Voice input',
      'Shareable cards',
      'Priority AI responses (GPT-4o)',
      'Chrome extension access',
      'Priority email support',
    ],
    limits: {
      questionsPerDay: null,
      questionsPerMonth: null,
      maxConversations: null,
      conversationRetentionDays: null,
    },
    popular: true, // Show "Most Popular" badge
  },
};

// Helper: Get tier configuration
export function getTierConfig(tier: SubscriptionTier) {
  switch (tier) {
    case 'starter':
      return PRICING.STARTER;
    case 'premium':
      return PRICING.PREMIUM;
    case 'free':
    default:
      return PRICING.FREE;
  }
}

// Helper: Format price
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper: Get all paid tiers (for pricing page)
export function getPaidTiers() {
  return [PRICING.STARTER, PRICING.PREMIUM];
}

// Helper: Check if user can ask question based on tier
export interface QuestionLimitCheck {
  canAsk: boolean;
  reason?: string;
  questionsLeft?: number;
  upgradeRequired?: SubscriptionTier;
}

export function checkQuestionLimit(
  tier: SubscriptionTier,
  dailyCount: number,
  monthlyCount: number
): QuestionLimitCheck {
  const config = getTierConfig(tier);
  
  // Premium: unlimited
  if (tier === 'premium') {
    return { canAsk: true, questionsLeft: 999999 };
  }
  
  // Starter: check monthly limit
  if (tier === 'starter') {
    if (monthlyCount >= (config.limits.questionsPerMonth || 0)) {
      return {
        canAsk: false,
        reason: 'Monthly limit reached (100/month)',
        questionsLeft: 0,
        upgradeRequired: 'premium',
      };
    }
    return {
      canAsk: true,
      questionsLeft: (config.limits.questionsPerMonth || 0) - monthlyCount,
    };
  }
  
  // Free: check daily limit
  if (dailyCount >= (config.limits.questionsPerDay || 0)) {
    return {
      canAsk: false,
      reason: 'Daily limit reached (5/day)',
      questionsLeft: 0,
      upgradeRequired: 'starter',
    };
  }
  
  return {
    canAsk: true,
    questionsLeft: (config.limits.questionsPerDay || 0) - dailyCount,
  };
}

// Helper: Get AI model based on tier
export function getAIModel(tier: SubscriptionTier): string {
  // Premium users get GPT-4o, everyone else gets GPT-4o-mini
  return tier === 'premium' ? 'gpt-4o' : 'gpt-4o-mini';
}

// Helper: Check if feature is available for tier
export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  const config = getTierConfig(tier);
  return config.features.some(f => 
    f.toLowerCase().includes(feature.toLowerCase())
  );
}

// Type for usage stats
export interface UsageStats {
  tier: SubscriptionTier;
  dailyQuestionsUsed: number;
  dailyQuestionsLimit: number | null;
  monthlyQuestionsUsed: number;
  monthlyQuestionsLimit: number | null;
  conversationCount: number;
  conversationLimit: number | null;
}

// Helper: Calculate usage percentage
export function getUsagePercentage(used: number, limit: number | null): number {
  if (limit === null) return 0; // Unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}