// src/lib/analytics.ts

// Define the GA4 Ecommerce Item type according to Google's specs
export interface AnalyticsItem {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
    item_category?: string;
    item_brand?: string;
    item_variant?: string;
    discount?: number;
}

// Check if gtag is available on the window object
const isGtagAvailable = () => typeof window !== 'undefined' && typeof (window as any).gtag === 'function';

/**
 * Send a generic event to GA4
 */
export const trackEvent = (eventName: string, params?: any) => {
    if (isGtagAvailable()) {
        (window as any).gtag('event', eventName, params);
    }
};

/**
 * Track when a user views a product (view_item)
 */
export const trackViewItem = (item: AnalyticsItem, value: number, currency = 'ILS') => {
    trackEvent('view_item', {
        currency,
        value,
        items: [item]
    });
};

/**
 * Track when a user adds a product to the cart (add_to_cart)
 */
export const trackAddToCart = (item: AnalyticsItem, value: number, currency = 'ILS') => {
    trackEvent('add_to_cart', {
        currency,
        value,
        items: [item]
    });
};

/**
 * Track when a user removes a product from the cart (remove_from_cart)
 */
export const trackRemoveFromCart = (item: AnalyticsItem, value: number, currency = 'ILS') => {
    trackEvent('remove_from_cart', {
        currency,
        value,
        items: [item]
    });
};

/**
 * Track when a user begins the checkout process (begin_checkout)
 */
export const trackBeginCheckout = (items: AnalyticsItem[], value: number, currency = 'ILS') => {
    trackEvent('begin_checkout', {
        currency,
        value,
        items
    });
};

/**
 * Track a completed purchase (purchase)
 */
export const trackPurchase = (transactionId: string, items: AnalyticsItem[], value: number, shipping: number = 0, tax: number = 0, currency = 'ILS', coupon?: string) => {
    trackEvent('purchase', {
        transaction_id: transactionId,
        currency,
        value,
        shipping,
        tax,
        coupon,
        items
    });
};
