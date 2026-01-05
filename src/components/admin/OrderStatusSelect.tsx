'use client';

import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/order-actions";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as OrderStatus;
        if (newStatus === currentStatus) return;

        setIsLoading(true);
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("שגיאה בעדכון הסטטוס");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative inline-block w-full min-w-[120px]">
            {isLoading && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
                </div>
            )}
            <select
                disabled={isLoading}
                value={currentStatus}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-stone-600 sm:text-xs sm:leading-6 bg-transparent disabled:opacity-50 cursor-pointer hover:bg-stone-50 transition-colors"
                dir="rtl"
            >
                <option value="PENDING">ממתין</option>
                <option value="PAID">שולם</option>
                <option value="PROCESSING">בטיפול</option>
                <option value="SHIPPED">נשלח</option>
                <option value="DELIVERED">נמסר</option>
                <option value="CANCELLED">בוטל</option>
            </select>
        </div>
    );
}
