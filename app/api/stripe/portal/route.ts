/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/stripe/portal
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function POST() {
  try {
    console.log('🎫 Customer Portal: Creating portal session')
    
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Customer Portal: Not authenticated')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      console.error('❌ Customer Portal: No Stripe customer ID')
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    console.log('✅ Customer Portal: Creating session', { 
      customerId: profile.stripe_customer_id 
    })

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat`,
    });

    console.log('✅ Customer Portal: Session created', { url: session.url })

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('❌ Customer Portal Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}