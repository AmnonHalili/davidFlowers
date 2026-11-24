export interface ProductWithStock {
    stock?: number | null;
    isVariablePrice?: boolean | null;
    variations?: any;
    [key: string]: any;
}

/**
 * Checks whether a product is currently in stock.
 * Handles both regular products and variable price products.
 */
export function isProductInStock(product: ProductWithStock): boolean {
    if (!product) return false;

    // For variable products, check if any variation has available stock
    if (product.isVariablePrice && product.variations) {
        let variationsObj: Record<string, any> = {};
        if (typeof product.variations === 'string') {
            try {
                variationsObj = JSON.parse(product.variations);
            } catch {
                variationsObj = {};
            }
        } else if (typeof product.variations === 'object' && product.variations !== null) {
            variationsObj = product.variations;
        }

        const variationValues = Object.values(variationsObj);
        if (variationValues.length > 0) {
            const totalStock = variationValues.reduce((sum: number, v: any) => {
                const s = typeof v?.stock === 'number' ? v.stock : parseInt(v?.stock, 10);
                return sum + (isNaN(s) ? 0 : s);
            }, 0);
            return totalStock > 0;
        }
    }

    const stockNum = typeof product.stock === 'number' ? product.stock : parseInt(String(product.stock), 10);
    return !isNaN(stockNum) && stockNum > 0;
}

/**
 * Stable-sorts products so that items that are in stock appear first,
 * and items that are out of stock appear last, preserving their existing relative sort order.
 */
export function sortProductsByStock<T extends ProductWithStock>(products: T[]): T[] {
    if (!Array.isArray(products) || products.length === 0) return products;

    return [...products].sort((a, b) => {
        const aInStock = isProductInStock(a) ? 1 : 0;
        const bInStock = isProductInStock(b) ? 1 : 0;
        return bInStock - aInStock;
    });
}
