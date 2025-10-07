/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, PRICING } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    console.log('💳 Stripe Checkout: Starting checkout session creation', req)
    
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Stripe Checkout: Not authenticated', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Stripe Checkout: User authenticated', { userId: user.id })

    // Get or create profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single();

    console.log('📊 Stripe Checkout: Profile loaded', { 
      hasStripeCustomer: !!profile?.stripe_customer_id,
      subscriptionStatus: profile?.subscription_status 
    })

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('🆕 Stripe Checkout: Creating new Stripe customer')
      
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

      console.log('✅ Stripe Checkout: Stripe customer created', { customerId })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICING.PREMIUM_MONTHLY.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing/cancel`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    console.log('✅ Stripe Checkout: Session created', { 
      sessionId: session.id,
      url: session.url 
    })

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('❌ Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}