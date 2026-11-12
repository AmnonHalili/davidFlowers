import 'server-only';
import { currentUser } from '@clerk/nextjs/server';

type Identity = { id: string; emailAddresses: Array<{ emailAddress: string; verification?: { status: string } | null }> };

// Database roles were historically assigned to customers and are not credentials.
export function isAdminIdentity(user: Identity | null): boolean {
    const emails = (process.env.ADMIN_EMAILS || '').split(',')
        .map(email => email.trim().replace(/^['"]|['"]$/g, '').toLowerCase()).filter(Boolean);
    return !!user && user.emailAddresses.some(email =>
        email.verification?.status === 'verified' && emails.includes(email.emailAddress.toLowerCase()));
}

export async function requireAdmin() {
    const user = await currentUser();
    if (!isAdminIdentity(user)) throw new Error('Forbidden');
    return user!;
}
