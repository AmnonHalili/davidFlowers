"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics";
import { useCart } from "@/context/CartContext";

interface PurchaseEventProps {
    orderId: string;
    total: number;
    currency?: string;
    items: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
    }>;
}

export default function PurchaseEvent({ orderId, total, currency = "ILS", items }: PurchaseEventProps) {
    // Use a ref to ensure the event fires only once per mount (though React 18 strict mode may fire twice in dev, which is expected)
    const sentRef = useRef(false);
    const { clearCart } = useCart();

    useEffect(() => {
        if (sentRef.current) return;
        sentRef.current = true;

        trackPurchase(orderId, items, total, 0, 0, currency);

        // Google Ads Conversion tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'conversion', {
                'send_to': process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
                'transaction_id': orderId
            });
        }

        // Clear the cart on successful purchase
        clearCart();

        // Optional: Log in dev for visibility
        if (process.env.NODE_ENV === 'development') {
            console.debug('🛒 GTM Purchase Event Fired & Cart Cleared:', { orderId, total });
        }
    }, [orderId, total, currency, items, clearCart]);

    return null;
}
