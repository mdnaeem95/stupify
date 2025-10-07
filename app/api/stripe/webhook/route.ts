/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('❌ Webhook: No signature found')
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('✅ Webhook received:', event.type);

  const supabase = await createClient();

  try {
    switch (event.type) {
      // Payment successful, subscription created
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout completed:', session.id);

        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error('❌ No user ID in session metadata');
          break;
        }

        // Update user to premium
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'premium',
            stripe_customer_id: session.customer as string,
          })
          .eq('id', userId);

        if (error) {
          console.error('❌ Failed to update profile:', error);
        } else {
          console.log('✅ User upgraded to premium:', userId);
        }
        break;
      }

      // Subscription updated (renewal, plan change)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);

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

        // Update subscription status based on subscription status
        const isActive = subscription.status === 'active';
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: isActive ? 'premium' : 'free'
          })
          .eq('id', profile.id);

        if (error) {
          console.error('❌ Failed to update profile:', error);
        } else {
          console.log('✅ Subscription updated for user:', profile.id, isActive ? 'premium' : 'free');
        }
        break;
      }

      // Subscription cancelled/ended
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