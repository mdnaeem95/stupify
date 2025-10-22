import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();
    
    const isPremium = profile?.subscription_status === 'premium';
        
    // Get current usage from Redis
    // Note: Upstash Ratelimit stores data in a specific format
    // We need to calculate remaining requests
    
    const chatLimit = isPremium ? 1000 : 10;
    const voiceLimit = 50;
    
    // Calculate reset times (simplified - would be more accurate with actual Redis data)
    const now = Date.now();
    const chatResetDate = new Date();
    chatResetDate.setHours(24, 0, 0, 0); // Next midnight
    const chatResetMs = chatResetDate.getTime();
    
    const voiceResetDate = new Date(now + 60 * 60 * 1000); // Next hour
    const voiceResetMs = voiceResetDate.getTime();
    
    // For now, we'll use the daily_usage table for chat stats
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usageData } = await supabase
      .from('daily_usage')
      .select('question_count') // ✅ CORRECT - matches database schema
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    
    const chatUsed = usageData?.question_count || 0; // ✅ CORRECT
    
    // Voice usage would need a separate tracking table
    // For now, we'll return estimated values
    
    return NextResponse.json({
      chat: {
        used: chatUsed,
        limit: chatLimit,
        remaining: Math.max(0, chatLimit - chatUsed),
        resetAt: new Date(chatResetMs).toISOString(),
      },
      voice: {
        used: 0, // Would need actual tracking
        limit: voiceLimit,
        remaining: voiceLimit,
        resetAt: new Date(voiceResetMs).toISOString(),
      },
      isPremium,
    });
    
  } catch (error) {
    console.error('Failed to fetch usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}