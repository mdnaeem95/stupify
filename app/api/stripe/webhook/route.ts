import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// ⭐ NEW: Import rate limiting
import {
  webhookLimiter,
  getClientIp,
  checkRateLimit,
  createRateLimitResponse,
} from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // ============================================================================
    // STEP 1: RATE LIMITING (PREVENT REPLAY ATTACKS)
    // ============================================================================
    
    const ip = getClientIp(request);
    
    // Stripe webhooks should be low-volume
    // 100/minute is generous but prevents abuse
    const webhookCheck = await checkRateLimit(webhookLimiter, ip);
    
    if (!webhookCheck.success) {
      console.warn(`⚠️ Webhook rate limit exceeded from IP: ${ip}`);
      return createRateLimitResponse(
        "Too many webhook requests. Possible attack detected.",
        webhookCheck.limit,
        webhookCheck.remaining,
        webhookCheck.reset
      );
    }
    
    // ============================================================================
    // STEP 2: VERIFY STRIPE SIGNATURE
    // ============================================================================
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    console.log('✅ Stripe webhook received:', event.type);
    
    // ============================================================================
    // STEP 3: HANDLE WEBHOOK EVENTS
    // ============================================================================
    
    const supabase = await createClient();
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('💳 Checkout completed:', {
          customerId: session.customer,
          email: session.customer_email,
        });
        
        // Update user profile to premium
        if (session.customer && session.customer_email) {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'premium',
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq('email', session.customer_email);
          
          if (error) {
            console.error('❌ Failed to update profile:', error);
          } else {
            console.log('✅ User upgraded to premium:', session.customer_email);
          }
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('📋 Subscription updated:', {
          customerId: subscription.customer,
          status: subscription.status,
        });
        
        // Update subscription status
        const status = subscription.status === 'active' ? 'premium' : 'free';
        
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer as string);
        
        if (error) {
          console.error('❌ Failed to update subscription:', error);
        } else {
          console.log(`✅ Subscription updated to ${status}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('❌ Subscription cancelled:', {
          customerId: subscription.customer,
        });
        
        // Downgrade to free
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer as string);
        
        if (error) {
          console.error('❌ Failed to downgrade user:', error);
        } else {
          console.log('✅ User downgraded to free');
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.warn('⚠️ Payment failed:', {
          customerId: invoice.customer,
          amount: invoice.amount_due,
        });
        
        // Optionally: Send email notification to user
        // Optionally: Downgrade after multiple failures
        break;
      }
      
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
    
    // ============================================================================
    // STEP 4: RETURN SUCCESS
    // ============================================================================
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}