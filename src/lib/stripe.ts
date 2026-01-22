import Stripe from 'stripe';

// Initialize Stripe only if key is present to avoid build crashes
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover', // Update to match SDK types
        typescript: true,
    })
    : null;

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is missing. Stripe functionality will not work.');
}
