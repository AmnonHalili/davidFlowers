"use client";

import { useEffect, useRef } from "react";
import { sendGTMEvent } from "@/lib/gtm";

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

    useEffect(() => {
        if (sentRef.current) return;
        sentRef.current = true;

        sendGTMEvent({
            event: "purchase",
            ecommerce: {
                transaction_id: orderId,
                value: total,
                currency: currency,
                items: items,
            },
        });

        // Optional: Log in dev for visibility
        if (process.env.NODE_ENV === 'development') {
            console.debug('🛒 GTM Purchase Event Fired:', { orderId, total });
        }
    }, [orderId, total, currency, items]);

    return null;
}
