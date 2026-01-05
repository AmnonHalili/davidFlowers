import { OrderStatus } from "@prisma/client";

export function StatusBadge({ status }: { status: OrderStatus }) {
    const styles = {
        PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
        PAID: "bg-blue-50 text-blue-700 ring-blue-600/20",
        PROCESSING: "bg-purple-50 text-purple-700 ring-purple-600/20",
        SHIPPED: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
        DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/20",
    };

    const labels = {
        PENDING: "ממתין",
        PAID: "שולם",
        PROCESSING: "בטיפול",
        SHIPPED: "נשלח",
        DELIVERED: "נמסר",
        CANCELLED: "בוטל",
    };

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
