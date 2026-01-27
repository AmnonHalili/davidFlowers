/**
 * Helper to safely parse any price format (Decimal, string, number) into a number
 */
export function parsePrice(value: unknown): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    // Handle Prisma Decimal (has .toNumber() or .toString())
    if (typeof value === 'object' && value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const v = value as any;
        if (typeof v.toNumber === 'function') return v.toNumber();
        if (typeof v.toString === 'function') return parseFloat(v.toString());
    }
    return 0;
}

export function calculateProductPrice(product: {
    price: number | string | unknown;
    salePrice?: number | string | unknown | null;
    saleStartDate?: Date | string | null;
    saleEndDate?: Date | string | null;
}) {
    const regularPrice = parsePrice(product.price);

    // If no sale price exists or it's invalid/zero
    const parsedSalePrice = parsePrice(product.salePrice);
    if (!product.salePrice || parsedSalePrice <= 0) {
        return { price: regularPrice, isOnSale: false, regularPrice };
    }

    const now = new Date();
    const startDate = product.saleStartDate ? new Date(product.saleStartDate) : null;
    const endDate = product.saleEndDate ? new Date(product.saleEndDate) : null;

    // Check start date
    if (startDate && startDate > now) {
        return { price: regularPrice, isOnSale: false, regularPrice };
    }

    // Check end date
    if (endDate && endDate < now) {
        return { price: regularPrice, isOnSale: false, regularPrice };
    }

    return { price: parsedSalePrice, isOnSale: true, regularPrice };
}
