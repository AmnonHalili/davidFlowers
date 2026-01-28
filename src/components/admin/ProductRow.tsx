'use client';

import { useRouter } from 'next/navigation';

export default function ProductRow({
    productId,
    children
}: {
    productId: string;
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleRowClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on action buttons, links, or inputs
        if (
            (e.target as HTMLElement).closest('button') ||
            (e.target as HTMLElement).closest('a') ||
            (e.target as HTMLElement).closest('input') ||
            (e.target as HTMLElement).closest('form')
        ) {
            return;
        }

        router.push(`/admin/products/${productId}/edit`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="group hover:bg-stone-50 transition-colors cursor-pointer"
        >
            {children}
        </tr>
    );
}
