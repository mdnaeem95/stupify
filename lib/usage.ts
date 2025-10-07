/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';

export interface UsageData {
  remaining: number;
  limit: number;
  canAsk: boolean;
  isPremium: boolean;
}

const FREE_DAILY_LIMIT = 10;

// Logging helper
const log = {
  info: (fn: string, msg: string, data?: any) => {
    console.log(`📊 [${fn}] ${msg}`, data || '')
  },
  error: (fn: string, msg: string, error: any) => {
    console.error(`❌ [${fn}] ${msg}`, error)
  },
  success: (fn: string, msg: string, data?: any) => {
    console.log(`✅ [${fn}] ${msg}`, data || '')
  }
}

/**
 * Get user's current usage for today
 */
export async function getUserUsage(): Promise<UsageData> {
  log.info('getUserUsage', 'Fetching user usage')
  
  const supabase = createClient();
  
  // Get user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    log.error('getUserUsage', 'Not authenticated', authError)
    return {
      remaining: 0,
      limit: 0,
      canAsk: false,
      isPremium: false
    }
  }

  // Get user's subscription status
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  const isPremium = profile?.subscription_status === 'premium';
  
  log.info('getUserUsage', 'User subscription status', { isPremium })

  // Premium users have unlimited questions
  if (isPremium) {
    log.success('getUserUsage', 'Premium user - unlimited')
    return {
      remaining: 999999,
      limit: 999999,
      canAsk: true,
      isPremium: true
    }
  }

  // Get today's usage for free users
  const today = new Date().toISOString().split('T')[0];
  
  const { data: usage } = await supabase
    .from('daily_usage')
    .select('question_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  const questionCount = usage?.question_count || 0;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - questionCount);
  const canAsk = remaining > 0;

  log.success('getUserUsage', 'Usage calculated', {
    questionCount,
    remaining,
    limit: FREE_DAILY_LIMIT,
    canAsk
  })

  return {
    remaining,
    limit: FREE_DAILY_LIMIT,
    canAsk,
    isPremium: false
  }
}

/**
 * Increment user's question count for today
 */
export async function incrementUsage(): Promise<boolean> {
  log.info('incrementUsage', 'Incrementing question count')
  
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    log.error('incrementUsage', 'Not authenticated', authError)
    return false
  }

  // Check if premium (don't track for premium users)
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_status === 'premium') {
    log.info('incrementUsage', 'Premium user - not tracking')
    return true
  }

  const today = new Date().toISOString().split('T')[0];

  // Try to increment existing record
  const { data: existing } = await supabase
    .from('daily_usage')
    .select('id, question_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('daily_usage')
      .update({ question_count: existing.question_count + 1 })
      .eq('id', existing.id);

    if (error) {
      log.error('incrementUsage', 'Failed to update', error)
      return false
    }

    log.success('incrementUsage', 'Usage incremented', { 
      newCount: existing.question_count + 1 
    })
    return true
  } else {
    // Create new record for today
    const { error } = await supabase
      .from('daily_usage')
      .insert({
        user_id: user.id,
        date: today,
        question_count: 1
      });

    if (error) {
      log.error('incrementUsage', 'Failed to insert', error)
      return false
    }

    log.success('incrementUsage', 'New usage record created', { count: 1 })
    return true
  }
}