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
    categories?: any[];
}) {
    const regularPrice = parsePrice(product.price);
    const now = new Date();

    // 1. Check Specific Product Sale (Priority)
    const parsedSalePrice = parsePrice(product.salePrice);
    if (product.salePrice && parsedSalePrice > 0) {
        const startDate = product.saleStartDate ? new Date(product.saleStartDate) : null;
        const endDate = product.saleEndDate ? new Date(product.saleEndDate) : null;

        const isStarted = !startDate || startDate <= now;
        const isEnded = endDate && endDate < now;

        if (isStarted && !isEnded) {
            return { price: parsedSalePrice, isOnSale: true, regularPrice, type: 'PRODUCT_SALE' };
        }
    }

    // 2. Check Category Sale (Secondary)
    // We assume the product object passed in MIGHT have categories loaded with their promotion data
    // If not, this part will be skipped safely. 
    // In a real app, ensure getProduct includes categories.
    if ('categories' in product && Array.isArray((product as any).categories)) {
        const categories = (product as any).categories;

        for (const cat of categories) {
            if (cat.isSaleActive) {
                const endDate = cat.discountEndDate ? new Date(cat.discountEndDate) : null;
                if (endDate && endDate < now) continue;

                let salePrice = regularPrice;
                if (cat.discountType === 'PERCENTAGE') {
                    salePrice = regularPrice * (1 - (Number(cat.discountAmount) / 100));
                } else if (cat.discountType === 'FIXED') {
                    salePrice = Math.max(0, regularPrice - Number(cat.discountAmount));
                }

                if (salePrice < regularPrice) {
                    return { price: salePrice, isOnSale: true, regularPrice, type: 'CATEGORY_SALE', discountLabel: cat.name };
                }
            }
        }
    }

    return { price: regularPrice, isOnSale: false, regularPrice };
}
