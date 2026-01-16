'use client';

import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/order-actions";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
}

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const router = useRouter();

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === status) return;

        setIsLoading(true);
        setStatus(newStatus); // Optimistic update

        const result = await updateOrderStatus(orderId, newStatus);

        if (!result.success) {
            // Revert on failure
            setStatus(currentStatus);
            alert('שגיאה בעדכון הסטטוס');
        }

        setIsLoading(false);
        router.refresh();
    };

    const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
        { value: 'PENDING', label: 'ממתין לטיפול', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'PAID', label: 'שולם - מוכן לאריזה', color: 'bg-blue-100 text-blue-800' },
        { value: 'SHIPPED', label: 'נשלח ללקוח', color: 'bg-purple-100 text-purple-800' },
        { value: 'DELIVERED', label: 'נמסר בהצלחה', color: 'bg-green-100 text-green-800' },
        { value: 'CANCELLED', label: 'בוטל', color: 'bg-red-100 text-red-800' },
    ];

    return (
        <div className="relative group">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 bg-white cursor-pointer hover:bg-stone-50 transition-colors ${isLoading ? 'opacity-50' : ''}`}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                <span className="font-medium text-sm text-stone-700">
                    {statusOptions.find(o => o.value === status)?.label}
                </span>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-100 overflow-hidden hidden group-hover:block z-50">
                {statusOptions.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`w-full text-right px-4 py-3 text-sm hover:bg-stone-50 flex items-center justify-between ${status === opt.value ? 'bg-stone-50 font-medium' : 'text-stone-600'}`}
                        disabled={isLoading}
                    >
                        <span>{opt.label}</span>
                        {status === opt.value && <Check className="w-4 h-4 text-david-green" />}
                    </button>
                ))}
            </div>
        </div>
    );
}
