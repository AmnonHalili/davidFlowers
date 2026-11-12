import { isAdminIdentity } from '@/lib/admin-auth';
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });
        if (!isAdminIdentity(user)) return new NextResponse('Forbidden', { status: 403 });
        return NextResponse.json({ success: false, code: 'PUSH_PAUSED', message: 'Device notifications are temporarily paused; re-enrollment is not yet available.' }, { status: 503 });

    } catch (error) {
        console.error('[PUSH_SUBSCRIBE_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
