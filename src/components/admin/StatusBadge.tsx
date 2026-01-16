import { OrderStatus } from "@prisma/client";

interface StatusBadgeProps {
    status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        PAID: "bg-blue-100 text-blue-800 border-blue-200",
        SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
        DELIVERED: "bg-green-100 text-green-800 border-green-200",
        CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };

    const labels = {
        PENDING: "ממתין",
        PAID: "שולם",
        SHIPPED: "נשלח",
        DELIVERED: "נמסר",
        CANCELLED: "בוטל",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
