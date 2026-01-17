import Stripe from 'stripe';

// Initialize Stripe only if key is present to avoid build crashes
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia', // Update to latest or keep existing
        typescript: true,
    })
    : null;

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is missing. Stripe functionality will not work.');
}
apiVersion: '2024-12-18.acacia', // Use latest API version or pins to a specific one if needed. ensuring stability.
    typescript: true,
});
