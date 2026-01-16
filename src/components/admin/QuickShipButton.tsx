'use client';

import { updateOrderStatus } from "@/app/actions/order-actions";
import { OrderStatus } from "@prisma/client";
import { Loader2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface QuickShipButtonProps {
    orderId: string;
    currentStatus: OrderStatus;
}

export default function QuickShipButton({ orderId, currentStatus }: QuickShipButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Only show for Pending or Paid orders
    const isShippable = currentStatus === 'PENDING' || currentStatus === 'PAID';

    if (!isShippable) return null;

    const handleQuickShip = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent row click navigation if inside a link
        e.stopPropagation();

        if (!confirm('האם לסמן את ההזמנה כ"נשלחה"?')) return;

        setIsLoading(true);
        const result = await updateOrderStatus(orderId, 'SHIPPED');

        if (result.success) {
            router.refresh();
        } else {
            alert('שגיאה בעדכון הסטטוס');
        }
        setIsLoading(false);
    };

    return (
        <button
            onClick={handleQuickShip}
            disabled={isLoading}
            title="סמן כנשלח"
            className="p-1.5 text-stone-400 hover:text-david-green hover:bg-green-50 rounded-full transition-colors"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Truck className="w-4 h-4" />
            )}
        </button>
    );
}
