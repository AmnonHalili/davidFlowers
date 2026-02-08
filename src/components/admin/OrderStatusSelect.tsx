'use client';

import { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import { updateOrderStatus } from '@/app/actions/order-actions';
import { Loader2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
}
/*
    This component renders a sleek, badge-like select input for changing order status directly in the list.
    It handles optimistic UI updates and shows loading/success/error states.
*/
export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const styles: Record<OrderStatus, string> = {
        PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        PAID: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        SHIPPED: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        DELIVERED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        CANCELLED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    };

    const statusLabels: Record<OrderStatus, string> = {
        PENDING: "ממתין לתשלום",
        PAID: "שולם (להכנה)",
        SHIPPED: "נשלח ללקוח",
        DELIVERED: "נמסר בהצלחה",
        CANCELLED: "בוטל",
    };

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === status) return;

        const previousStatus = status;
        setIsLoading(true);
        setStatus(newStatus); // Optimistic Update

        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success('הסטטוס עודכן בהצלחה');
                router.refresh();
            } else {
                throw new Error(result.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('שגיאה בעדכון הסטטוס');
            setStatus(previousStatus); // Revert on failure
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative inline-block w-full max-w-[140px]">
            <div className="relative">
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    disabled={isLoading}
                    className={`
                        appearance-none w-full
                        pl-8 pr-3 py-1.5
                        text-xs font-medium rounded-full border 
                        cursor-pointer transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-david-green/20
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${styles[status]}
                    `}
                >
                    {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-white text-stone-900 py-1">
                            {label}
                        </option>
                    ))}
                </select>

                {/* Icon Overlay */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60">
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    )}
                </div>
            </div>
        </div>
    );
}
