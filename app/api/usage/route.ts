import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const FREE_DAILY_LIMIT = 10;

/**
 * GET /api/usage - Check current usage
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.subscription_status === 'premium';

    // Premium users have unlimited
    if (isPremium) {
      return NextResponse.json({
        remaining: 999999,
        limit: 999999,
        canAsk: true,
        isPremium: true
      });
    }

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('question_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const questionCount = usage?.question_count || 0;
    const remaining = Math.max(0, FREE_DAILY_LIMIT - questionCount);

    return NextResponse.json({
      remaining,
      limit: FREE_DAILY_LIMIT,
      canAsk: remaining > 0,
      isPremium: false
    });

  } catch (error) {
    console.error('Usage API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usage - Increment usage count
 */
export async function POST() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if premium (don't track for premium)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_status === 'premium') {
      return NextResponse.json({ success: true, isPremium: true });
    }

    const today = new Date().toISOString().split('T')[0];

    // Try to get existing record
    const { data: existing } = await supabase
      .from('daily_usage')
      .select('id, question_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('daily_usage')
        .update({ question_count: existing.question_count + 1 })
        .eq('id', existing.id);

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        count: existing.question_count + 1 
      });
    } else {
      // Create new
      const { error } = await supabase
        .from('daily_usage')
        .insert({
          user_id: user.id,
          date: today,
          question_count: 1
        });

      if (error) throw error;

      return NextResponse.json({ success: true, count: 1 });
    }

  } catch (error) {
    console.error('Usage Increment Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}