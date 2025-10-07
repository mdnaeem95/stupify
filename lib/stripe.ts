import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Pricing
export const PRICING = {
  PREMIUM_MONTHLY: {
    price: 499, // $4.99 in cents
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '',
    name: 'Premium Monthly',
    description: 'Unlimited questions, priority support',
  },
};

// Helper to format price
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}