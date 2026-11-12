export function validCartItems(items: unknown): items is Array<{ productId: string; quantity: number; [key: string]: any }> {
    return Array.isArray(items) && items.length > 0 && items.length <= 100 && items.every(item =>
        item && typeof item.productId === 'string' && item.productId.length > 0 &&
        Number.isSafeInteger(item.quantity) && item.quantity > 0 && item.quantity <= 1000);
}

export function usableCoupon(coupon: any, now = new Date()): boolean {
    return !!coupon && coupon.isActive === true &&
        (!coupon.validFrom || new Date(coupon.validFrom) <= now) &&
        (!coupon.validUntil || new Date(coupon.validUntil) >= now) &&
        (coupon.usageLimit === null || (Number.isSafeInteger(coupon.usageLimit) && coupon.usageCount < coupon.usageLimit)) &&
        Number.isFinite(Number(coupon.discountAmount)) && Number(coupon.discountAmount) >= 0 &&
        (coupon.discountType === 'FIXED' || (coupon.discountType === 'PERCENTAGE' && Number(coupon.discountAmount) <= 100));
}
