/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ Webhook: No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook received:', event.type);

    // Use service role client to bypass RLS
    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      // Checkout completed - user just subscribed
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout completed:', session.id);

        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.subscription_tier as 'starter' | 'premium' | undefined;

        if (!userId) {
          console.error('❌ No user ID in session metadata');
          break;
        }

        if (!tier || (tier !== 'starter' && tier !== 'premium')) {
          console.error('❌ Invalid or missing tier in session metadata:', tier);
          break;
        }

        console.log('✅ Upgrading user to', tier, '- User ID:', userId);

        // Update user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: tier,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', userId);

        if (error) {
          console.error('❌ Failed to update profile:', error);
        } else {
          console.log('✅ User upgraded to', tier, '- User ID:', userId);
        }
        break;
      }

      // Subscription updated (tier change, renewal, etc.)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);

        const customerId = subscription.customer as string;
        const tier = subscription.metadata?.subscription_tier as 'starter' | 'premium' | undefined;
        
        // Check if subscription is active
        const isActive = ['active', 'trialing'].includes(subscription.status);

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error('❌ No profile found for customer:', customerId);
          break;
        }

        // Determine the correct tier
        let newTier: 'free' | 'starter' | 'premium' = 'free';
        
        if (isActive && tier) {
          newTier = tier;
        } else if (isActive) {
          // Fallback: if no tier in metadata, check price
          const priceId = subscription.items.data[0]?.price.id;
          
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
            newTier = 'starter';
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
            newTier = 'premium';
          }
        }

        console.log('✅ Updating subscription status:', {
          userId: profile.id,
          tier: newTier,
          isActive,
        });

        // Update user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: newTier })
          .eq('id', profile.id);

        if (error) {
          console.error('❌ Failed to update profile:', error);
        } else {
          console.log('✅ Subscription updated for user:', profile.id, '- New tier:', newTier);
        }
        break;
      }

      // Subscription deleted/cancelled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription deleted:', subscription.id);

        const customerId = subscription.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!profile) {
          console.error('❌ No profile found for customer:', customerId);
          break;
        }

        // Downgrade to free
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'free' })
          .eq('id', profile.id);

        if (error) {
          console.error('❌ Failed to update profile:', error);
        } else {
          console.log('✅ User downgraded to free:', profile.id);
        }
        break;
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn('⚠️ Payment failed for invoice:', invoice.id);

        const customerId = invoice.customer as string;

        // Find user by customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          console.log('⚠️ Payment failed for user:', profile.email);
          // TODO: Send email notification
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}