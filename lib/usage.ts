/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { type SubscriptionTier } from '@/lib/stripe';

export interface UsageData {
  tier: SubscriptionTier;
  canAsk: boolean;
  // Daily usage (for Free tier)
  dailyRemaining: number;
  dailyLimit: number;
  dailyUsed: number;
  // Monthly usage (for Starter tier)
  monthlyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  // Conversations
  conversationCount: number;
  conversationLimit: number | null;
  // Legacy properties (for backward compatibility)
  remaining: number;
  limit: number;
  isPremium: boolean;
}

// Tier limits
const TIER_LIMITS = {
  free: {
    dailyQuestions: 5,
    monthlyQuestions: null,
    maxConversations: 3,
  },
  starter: {
    dailyQuestions: null,
    monthlyQuestions: 100,
    maxConversations: 50,
  },
  premium: {
    dailyQuestions: null,
    monthlyQuestions: null,
    maxConversations: null,
  },
};

// Logging helper
const log = {
  info: (fn: string, msg: string, data?: any) => {
    console.log(`📊 [${fn}] ${msg}`, data || '');
  },
  error: (fn: string, msg: string, error: any) => {
    console.error(`❌ [${fn}] ${msg}`, error);
  },
  success: (fn: string, msg: string, data?: any) => {
    console.log(`✅ [${fn}] ${msg}`, data || '');
  },
};

/**
 * Get user's current usage for today
 */
export async function getUserUsage(): Promise<UsageData> {
  log.info('getUserUsage', 'Fetching user usage');
  
  const supabase = createClient();
  
  // Get user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    log.error('getUserUsage', 'Not authenticated', authError);
    return {
      tier: 'free',
      canAsk: false,
      dailyRemaining: 0,
      dailyLimit: 5,
      dailyUsed: 0,
      monthlyRemaining: 0,
      monthlyLimit: 100,
      monthlyUsed: 0,
      conversationCount: 0,
      conversationLimit: 3,
      // Legacy
      remaining: 0,
      limit: 5,
      isPremium: false,
    };
  }

  // Get user's subscription status and monthly usage
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, monthly_questions_used')
    .eq('id', user.id)
    .single();

  const tier = (profile?.subscription_status || 'free') as SubscriptionTier;
  const monthlyUsed = profile?.monthly_questions_used || 0;
  
  log.info('getUserUsage', 'User tier', { tier, monthlyUsed });

  // Get conversation count
  const { count: conversationCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get today's usage
  const today = new Date().toISOString().split('T')[0];
  
  const { data: usage } = await supabase
    .from('daily_usage')
    .select('question_count') // ⭐ FIXED: was questions_asked
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  const dailyUsed = usage?.question_count || 0; // ⭐ FIXED: was questions_asked

  // Calculate based on tier
  if (tier === 'premium') {
    log.success('getUserUsage', 'Premium user - unlimited');
    return {
      tier: 'premium',
      canAsk: true,
      dailyRemaining: 999999,
      dailyLimit: 999999,
      dailyUsed: dailyUsed,
      monthlyRemaining: 999999,
      monthlyLimit: 999999,
      monthlyUsed: 0,
      conversationCount: conversationCount || 0,
      conversationLimit: null,
      // Legacy
      remaining: 999999,
      limit: 999999,
      isPremium: true,
    };
  }

  if (tier === 'starter') {
    const monthlyLimit = TIER_LIMITS.starter.monthlyQuestions!;
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
    const canAsk = monthlyRemaining > 0;

    log.success('getUserUsage', 'Starter user usage', {
      monthlyUsed,
      monthlyRemaining,
      canAsk,
    });

    return {
      tier: 'starter',
      canAsk,
      dailyRemaining: 999999, // No daily limit for starter
      dailyLimit: 999999,
      dailyUsed: dailyUsed,
      monthlyRemaining,
      monthlyLimit,
      monthlyUsed,
      conversationCount: conversationCount || 0,
      conversationLimit: TIER_LIMITS.starter.maxConversations,
      // Legacy (use monthly for backward compatibility)
      remaining: monthlyRemaining,
      limit: monthlyLimit,
      isPremium: false,
    };
  }

  // Free tier
  const dailyLimit = TIER_LIMITS.free.dailyQuestions;
  const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
  const canAsk = dailyRemaining > 0;

  log.success('getUserUsage', 'Free user usage', {
    dailyUsed,
    dailyRemaining,
    canAsk,
  });

  return {
    tier: 'free',
    canAsk,
    dailyRemaining,
    dailyLimit,
    dailyUsed,
    monthlyRemaining: 0,
    monthlyLimit: 100,
    monthlyUsed: 0,
    conversationCount: conversationCount || 0,
    conversationLimit: TIER_LIMITS.free.maxConversations,
    // Legacy
    remaining: dailyRemaining,
    limit: dailyLimit,
    isPremium: false,
  };
}

/**
 * Increment user's question count for today
 */
export async function incrementUsage(): Promise<boolean> {
  log.info('incrementUsage', 'Incrementing question count');
  
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    log.error('incrementUsage', 'Not authenticated', authError);
    return false;
  }

  // Get user's tier and monthly usage
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, monthly_questions_used')
    .eq('id', user.id)
    .single();

  const tier = (profile?.subscription_status || 'free') as SubscriptionTier;
  const monthlyUsed = profile?.monthly_questions_used || 0;

  log.info('incrementUsage', 'User tier', { tier });

  const today = new Date().toISOString().split('T')[0];

  // 1. Increment daily usage (for all tiers, for analytics)
  const { data: existing } = await supabase
    .from('daily_usage')
    .select('id, question_count') // ⭐ FIXED: was questions_asked
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('daily_usage')
      .update({ question_count: existing.question_count + 1 }) // ⭐ FIXED
      .eq('id', existing.id);

    if (error) {
      log.error('incrementUsage', 'Failed to update daily usage', error);
      return false;
    }
  } else {
    const { error } = await supabase
      .from('daily_usage')
      .insert({
        user_id: user.id,
        date: today,
        question_count: 1, // ⭐ FIXED: was questions_asked
      });

    if (error) {
      log.error('incrementUsage', 'Failed to insert daily usage', error);
      return false;
    }
  }

  // 2. Increment monthly usage (for Starter tier only)
  if (tier === 'starter') {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        monthly_questions_used: monthlyUsed + 1,
      })
      .eq('id', user.id);

    if (error) {
      log.error('incrementUsage', 'Failed to update monthly usage', error);
      return false;
    }

    log.success('incrementUsage', 'Monthly usage incremented', { 
      newCount: monthlyUsed + 1,
    });
  }

  log.success('incrementUsage', 'Usage incremented successfully');
  return true;
}