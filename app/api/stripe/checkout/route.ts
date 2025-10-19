/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, PRICING, type SubscriptionTier } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    console.log('💳 Stripe Checkout: Starting checkout session creation');
    
    // Parse request body to get the tier
    const body = await req.json();
    const { tier } = body as { tier?: SubscriptionTier };
    
    // Validate tier
    if (!tier || (tier !== 'starter' && tier !== 'premium')) {
      console.error('❌ Stripe Checkout: Invalid tier', { tier });
      return NextResponse.json(
        { error: 'Invalid subscription tier. Must be "starter" or "premium".' },
        { status: 400 }
      );
    }

    console.log('✅ Stripe Checkout: Tier selected', { tier });
    
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Stripe Checkout: Not authenticated', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Stripe Checkout: User authenticated', { userId: user.id });

    // Get or create profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single();

    console.log('📊 Stripe Checkout: Profile loaded', { 
      hasStripeCustomer: !!profile?.stripe_customer_id,
      currentSubscriptionStatus: profile?.subscription_status 
    });

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('🆕 Stripe Checkout: Creating new Stripe customer');
      
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      console.log('✅ Stripe Checkout: Stripe customer created', { customerId });
    }

    // Get the price ID for the selected tier
    const tierConfig = tier === 'starter' ? PRICING.STARTER : PRICING.PREMIUM;
    const priceId = tierConfig.priceId;

    if (!priceId) {
      console.error('❌ Stripe Checkout: Price ID not configured', { tier });
      return NextResponse.json(
        { error: `Price ID not configured for ${tier} tier. Please contact support.` },
        { status: 500 }
      );
    }

    console.log('✅ Stripe Checkout: Price ID retrieved', { 
      tier, 
      priceId: priceId.substring(0, 20) + '...' 
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?upgraded=true&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        supabase_user_id: user.id,
        subscription_tier: tier, // ⭐ Important for webhook
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          subscription_tier: tier, // ⭐ Important for webhook
        },
      },
    });

    console.log('✅ Stripe Checkout: Session created', { 
      sessionId: session.id,
      tier,
      url: session.url?.substring(0, 50) + '...'
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('❌ Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}