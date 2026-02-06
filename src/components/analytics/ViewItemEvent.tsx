"use client";

import { useEffect, useRef } from "react";
import { sendGTMEvent } from "@/lib/gtm";
import { usePathname } from "next/navigation";

interface ViewItemEventProps {
    currency?: string;
    product: {
        id: string;
        name: string;
        price: number;
        category?: string;
        image?: string;
    };
}

export default function ViewItemEvent({ product, currency = "ILS" }: ViewItemEventProps) {
    const sentRef = useRef("");
    const pathname = usePathname();

    useEffect(() => {
        // Simple logic to prevent double firing on re-renders, but allow if navigating back to same product (hash/query change)
        // Ideally, using pathname + product.id as unique key
        const uniqueKey = `${pathname}-${product.id}`;

        if (sentRef.current === uniqueKey) return;
        sentRef.current = uniqueKey;

        sendGTMEvent({
            event: "view_item",
            ecommerce: {
                currency: currency,
                value: product.price,
                items: [
                    {
                        item_id: product.id,
                        item_name: product.name,
                        price: product.price,
                        item_category: product.category,
                        quantity: 1
                    }
                ]
            }
        });

        // Debug log
        if (process.env.NODE_ENV === 'development') {
            console.debug('👁️ GTM View Item Fired:', product.name);
        }
    }, [product, currency, pathname]);

    return null;
}
