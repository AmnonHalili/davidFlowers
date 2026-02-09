'use client';

import { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import { updateOrderStatus } from '@/app/actions/order-actions';
import { Loader2, ChevronDown, CheckCircle2, Clock, Truck, Package, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
    fullWidth?: boolean;
}

const statusConfig: Record<OrderStatus, {
    label: string,
    styles: string,
    icon: any,
    description: string
}> = {
    PENDING: {
        label: "ממתין לתשלום",
        styles: "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500/20",
        icon: Clock,
        description: "הזמנה חדשה שטרם שולמה"
    },
    PAID: {
        label: "שולם (להכנה)",
        styles: "bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-500/20",
        icon: Package,
        description: "התשלום התקבל, אפשר להתחיל להכין"
    },
    SHIPPED: {
        label: "נשלח ללקוח",
        styles: "bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-500/20",
        icon: Truck,
        description: "ההזמנה יצאה עם השליח"
    },
    DELIVERED: {
        label: "נמסר בהצלחה",
        styles: "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500/20",
        icon: CheckCircle2,
        description: "הלקוח קיבל את הפרחים"
    },
    CANCELLED: {
        label: "בוטל",
        styles: "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500/20",
        icon: XCircle,
        description: "ההזמנה בוטלה ולא תבוצע"
    },
};

export default function OrderStatusSelect({ orderId, currentStatus, fullWidth = false }: OrderStatusSelectProps) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === status) return;

        const previousStatus = status;
        setIsLoading(true);
        setStatus(newStatus);

        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success(`הסטטוס עודכן ל-${statusConfig[newStatus].label}`);
                router.refresh();
            } else {
                throw new Error(result.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('שגיאה בעדכון הסטטוס');
            setStatus(previousStatus);
        } finally {
            setIsLoading(false);
        }
    };

    const Config = statusConfig[status];
    const Icon = Config.icon;

    return (
        <div className={`relative isolate ${fullWidth ? 'w-full' : 'w-full max-w-[160px]'}`}>
            <div className="relative group">
                {/* Visual Representation (Badge) */}
                <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl border
                    transition-all duration-300 shadow-sm
                    group-hover:shadow-md active:scale-95
                    ${Config.styles}
                `}>
                    <div className="shrink-0 text-current">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                        ) : (
                            <Icon className="w-4 h-4" />
                        )}
                    </div>

                    <span className="text-[13px] font-bold tracking-tight truncate">
                        {Config.label}
                    </span>

                    <ChevronDown className={`
                        w-3.5 h-3.5 ml-auto opacity-40 transition-transform duration-300
                        group-hover:opacity-100 group-hover:translate-y-0.5
                    `} />
                </div>

                {/* Secret Native Select (Better for Mobile Touch than Custom Dropdown) */}
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    disabled={isLoading}
                    className="
                        absolute inset-0 w-full h-full opacity-0 cursor-pointer
                        disabled:cursor-not-allowed z-10
                    "
                >
                    {Object.entries(statusConfig).map(([key, item]) => (
                        <option key={key} value={key}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

