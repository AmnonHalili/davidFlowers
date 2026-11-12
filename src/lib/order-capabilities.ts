import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

export type OrderCapability = {
    purpose: 'receipt' | 'draft' | 'checkout';
    orderId: string;
    expiresAt: number;
    subject?: string | null;
    version?: string;
};
export const RECEIPT_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
export const DRAFT_LIFETIME_SECONDS = 2 * 60 * 60;

function key() {
    const dedicated = process.env.ORDER_ACCESS_SECRET;
    if (dedicated) return dedicated.length >= 32 ? dedicated : null;
    // Existing Clerk server key is a bootstrap fallback; domain separation keeps token uses distinct.
    const clerk = process.env.CLERK_SECRET_KEY;
    return clerk && clerk.length >= 32 ? createHmac('sha256', clerk).update('davidflowers:order-capabilities:v1').digest('hex') : null;
}

export function orderCapabilitiesAvailable() { return key() !== null; }

export function issueOrderCapability(claims: OrderCapability): string | null {
    const secret = key();
    if (!secret) return null;
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = createHmac('sha256', secret).update(payload).digest('hex');
    return `${payload}.${signature}`;
}

export function verifyOrderCapability(token: string | undefined, purpose: OrderCapability['purpose'], now = Date.now()): OrderCapability | null {
    const secret = key();
    if (!secret || !token || token.length > 2048) return null;
    const parts = token.split('.');
    if (parts.length !== 2 || !/^[a-zA-Z0-9_-]+$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) return null;
    const expected = createHmac('sha256', secret).update(parts[0]).digest('hex');
    if (!timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expected))) return null;
    try {
        const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString()) as OrderCapability;
        if (claims.purpose !== purpose || typeof claims.orderId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(claims.orderId)) return null;
        if (!Number.isSafeInteger(claims.expiresAt) || claims.expiresAt <= now) return null;
        const maxLifetime = purpose === 'draft' ? DRAFT_LIFETIME_SECONDS : RECEIPT_LIFETIME_SECONDS;
        if (claims.expiresAt > now + maxLifetime * 1000) return null;
        if (purpose === 'receipt' && (process.env.ORDER_RECEIPT_REVOKED_IDS || '').split(',').map(id => id.trim()).includes(claims.orderId)) return null;
        if (purpose === 'checkout' && !(claims.subject === null || typeof claims.subject === 'string')) return null;
        if (purpose === 'draft' && (typeof claims.version !== 'string' || !Number.isFinite(Date.parse(claims.version)) || !(claims.subject === null || typeof claims.subject === 'string'))) return null;
        return claims;
    } catch { return null; }
}
